import 'dart:async';

import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../models/content.dart';
import '../models/forum.dart';
import '../models/quiz.dart';
import '../Screens/conteudo_screen.dart';
import '../Screens/podcast_selecionado_screen.dart';
import '../Screens/praticar_quiz_screen.dart';
import '../Screens/sala_de_debate_screen.dart';
import '../services/content_service.dart';
import '../services/forum_service.dart';
import '../services/quiz_service.dart';
import '../theme/app_colors.dart';

class SearchModal {
  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _SearchModalContent(parentContext: context),
    );
  }
}

class _SearchModalContent extends StatefulWidget {
  final BuildContext parentContext;

  const _SearchModalContent({required this.parentContext});

  @override
  State<_SearchModalContent> createState() => _SearchModalContentState();
}

class _SearchModalContentState extends State<_SearchModalContent> {
  final _searchController = TextEditingController();
  final _focusNode = FocusNode();
  final _contentService = ContentService();
  final _forumService = ForumService();
  final _quizService = QuizService();

  Timer? _debounce;
  String _query = '';
  bool _isLoading = false;
  String? _error;
  List<_ResultadoItem> _resultados = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    final query = value.trim();
    setState(() {
      _query = query;
      _error = null;
      if (query.length < 2) {
        _resultados = [];
        _isLoading = false;
      }
    });

    if (query.length < 2) return;
    _debounce = Timer(const Duration(milliseconds: 350), () => _buscar(query));
  }

  Future<void> _buscar(String query) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final contents = await _contentService.getContents(search: query);
      final forums = await _forumService.getForums(search: query);
      final quizzes = await _quizService.getQuizzes(search: query);
      if (!mounted || _query != query) return;

      final lowerQuery = query.toLowerCase();
      final forumMatches = forums.where((forum) {
        return forum.name.toLowerCase().contains(lowerQuery) ||
            (forum.description ?? '').toLowerCase().contains(lowerQuery);
      });

      setState(() {
        _resultados = [
          ...contents.data.map(_contentResult),
          ...forumMatches.map(_forumResult),
          ...quizzes.data.map(_quizResult),
        ];
      });
    } on AppException catch (e) {
      if (mounted && _query == query) setState(() => _error = e.message);
    } catch (_) {
      if (mounted && _query == query) {
        setState(() => _error = 'Não foi possível concluir a pesquisa.');
      }
    } finally {
      if (mounted && _query == query) setState(() => _isLoading = false);
    }
  }

  _ResultadoItem _contentResult(Content content) {
    final type = content.contentType?.name ?? 'Conteúdo';
    final subtitleParts = [
      if (content.category?.name != null) content.category!.name,
      readTime(content.content ?? content.summary),
    ];
    return _ResultadoItem(
      tipo: type,
      titulo: content.title,
      subtitulo: subtitleParts.join(' - '),
      icone: content.isPodcast
          ? Icons.podcasts_rounded
          : Icons.article_outlined,
      onTap: () => _open(
        content.isPodcast
            ? PodcastSelecionadoScreen(
                contentId: content.id,
                initialContent: content,
              )
            : ConteudoScreen(contentId: content.id, initialContent: content),
      ),
    );
  }

  _ResultadoItem _forumResult(Forum forum) {
    return _ResultadoItem(
      tipo: 'Fórum',
      titulo: forum.name,
      subtitulo:
          '${forum.topicsCount} tópico${forum.topicsCount == 1 ? '' : 's'}',
      icone: Icons.forum_outlined,
      onTap: () => _open(SalaDeDebateScreen(forum: forum)),
    );
  }

  _ResultadoItem _quizResult(Quiz quiz) {
    return _ResultadoItem(
      tipo: 'Quiz',
      titulo: quiz.title,
      subtitulo:
          '${quiz.questionsCount} pergunta${quiz.questionsCount == 1 ? '' : 's'}',
      icone: Icons.quiz_outlined,
      onTap: () => _open(PraticarQuizScreen(quiz: quiz)),
    );
  }

  void _open(Widget screen) {
    final navigator = Navigator.of(widget.parentContext);
    Navigator.of(context).pop();
    navigator.push(MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderSoft,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.inputFill,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppColors.borderSoft,
                        width: 1.2,
                      ),
                    ),
                    child: Row(
                      children: [
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 12),
                          child: Icon(
                            Icons.search_rounded,
                            color: AppColors.textLight,
                            size: 20,
                          ),
                        ),
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            focusNode: _focusNode,
                            onChanged: _onSearchChanged,
                            style: const TextStyle(
                              fontSize: 15,
                              color: AppColors.textDark,
                            ),
                            decoration: const InputDecoration(
                              hintText:
                                  'Pesquisar conteúdos, fóruns, quizzes...',
                              hintStyle: TextStyle(
                                fontSize: 14,
                                color: AppColors.textLight,
                              ),
                              border: InputBorder.none,
                              isDense: true,
                            ),
                          ),
                        ),
                        if (_query.isNotEmpty)
                          GestureDetector(
                            onTap: () {
                              _searchController.clear();
                              _onSearchChanged('');
                            },
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 12),
                              child: Icon(
                                Icons.close_rounded,
                                color: AppColors.textLight,
                                size: 18,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: const Text(
                    'Cancelar',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                bottom: bottomInset + 24,
              ),
              child: _ResultadosSection(
                query: _query,
                isLoading: _isLoading,
                error: _error,
                resultados: _resultados,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ResultadosSection extends StatelessWidget {
  final String query;
  final bool isLoading;
  final String? error;
  final List<_ResultadoItem> resultados;

  const _ResultadosSection({
    required this.query,
    required this.isLoading,
    required this.error,
    required this.resultados,
  });

  @override
  Widget build(BuildContext context) {
    if (query.isEmpty) {
      return const _CenteredMessage(
        icon: Icons.search_rounded,
        message: 'Digite pelo menos 2 caracteres para pesquisar.',
      );
    }

    if (query.length < 2) {
      return const _CenteredMessage(
        icon: Icons.keyboard_rounded,
        message: 'Continue a digitar para pesquisar.',
      );
    }

    if (isLoading) {
      return const Padding(
        padding: EdgeInsets.only(top: 48),
        child: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    if (error != null) {
      return _CenteredMessage(
        icon: Icons.error_outline_rounded,
        message: error!,
      );
    }

    if (resultados.isEmpty) {
      return const _CenteredMessage(
        icon: Icons.search_off_rounded,
        message: 'Nenhum resultado encontrado.',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${resultados.length} resultado${resultados.length != 1 ? 's' : ''}',
          style: const TextStyle(fontSize: 13, color: AppColors.textLight),
        ),
        const SizedBox(height: 12),
        ...resultados.map((r) => _ResultadoTile(item: r)),
      ],
    );
  }
}

class _CenteredMessage extends StatelessWidget {
  final IconData icon;
  final String message;

  const _CenteredMessage({required this.icon, required this.message});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 48),
      child: Center(
        child: Column(
          children: [
            Icon(icon, size: 48, color: AppColors.borderSoft),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: AppColors.textLight),
            ),
          ],
        ),
      ),
    );
  }
}

class _ResultadoItem {
  final String tipo;
  final String titulo;
  final String subtitulo;
  final IconData icone;
  final VoidCallback onTap;

  const _ResultadoItem({
    required this.tipo,
    required this.titulo,
    required this.subtitulo,
    required this.icone,
    required this.onTap,
  });
}

class _ResultadoTile extends StatelessWidget {
  final _ResultadoItem item;

  const _ResultadoTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: item.onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.inputFill,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(item.icone, size: 20, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.titulo,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    item.subtitulo,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textLight,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.borderSoft,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                item.tipo,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMedium,
                  letterSpacing: 0.3,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
