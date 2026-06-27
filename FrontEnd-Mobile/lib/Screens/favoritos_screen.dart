import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../service/perfil_service.dart';
import '../services/content_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import 'conteudo_screen.dart';
import 'login_screen.dart';
import 'podcast_selecionado_screen.dart';

class FavoritosScreen extends StatefulWidget {
  const FavoritosScreen({super.key});

  @override
  State<FavoritosScreen> createState() => _FavoritosScreenState();
}

class _FavoritosScreenState extends State<FavoritosScreen> {
  final _service = ContentService();
  final _filtros = const ['Todos', 'Artigos', 'Podcasts', 'Jindungo'];

  int _filtroSelecionado = 0;
  bool _isLoading = true;
  String? _error;
  List<SavedContent> _itens = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final perfil = context.read<PerfilService>();
    if (!perfil.isAuthenticated) {
      setState(() {
        _isLoading = false;
        _error = null;
        _itens = [];
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _service.getSavedContents();
      if (!mounted) return;
      setState(() => _itens = response.data);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar favoritos.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _remover(SavedContent item) async {
    try {
      await _service.removeSavedContent(item.contentId);
      if (!mounted) return;
      setState(() => _itens.removeWhere((saved) => saved.id == item.id));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Conteudo removido dos favoritos.')),
      );
    } on AppException catch (e) {
      if (mounted) _showError(e.message);
    } catch (_) {
      if (mounted) _showError('Erro ao remover favorito.');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.primary),
    );
  }

  List<SavedContent> get _filtrados {
    final filtro = _filtros[_filtroSelecionado];
    if (filtro == 'Todos') return _itens;
    return _itens.where((item) {
      final content = item.content;
      if (content == null) return false;
      if (filtro == 'Podcasts') return content.isPodcast;
      if (filtro == 'Jindungo') return content.isJindungo;
      return !content.isPodcast && !content.isJindungo;
    }).toList();
  }

  void _abrirConteudo(Content content) {
    final route = content.isPodcast
        ? MaterialPageRoute(
            builder: (_) => PodcastSelecionadoScreen(
              contentId: content.id,
              initialContent: content,
            ),
          )
        : MaterialPageRoute(
            builder: (_) =>
                ConteudoScreen(contentId: content.id, initialContent: content),
          );
    Navigator.push(context, route);
  }

  @override
  Widget build(BuildContext context) {
    final isAuthenticated = context.watch<PerfilService>().isAuthenticated;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        titulo: 'Favoritos',
        mostrarVoltar: true,
        mostrarFavoritos: false,
        mostrarNotificacoes: true,
        mostrarPesquisa: true,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            const Text(
              'Favoritos',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Conteudos guardados na tua conta.',
              style: TextStyle(fontSize: 13, color: AppColors.textMedium),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _filtros.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final ativo = i == _filtroSelecionado;
                  return GestureDetector(
                    onTap: () => setState(() => _filtroSelecionado = i),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: ativo ? AppColors.primary : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: ativo
                              ? AppColors.primary
                              : const Color(0xFFD8C1C4),
                        ),
                      ),
                      child: Text(
                        _filtros[i],
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: ativo ? Colors.white : AppColors.textMedium,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 18),
            if (!isAuthenticated)
              _LoginPrompt(
                onLogin: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
              )
            else if (_isLoading)
              const SizedBox(
                height: 340,
                child: LoadingState(message: 'A carregar favoritos...'),
              )
            else if (_error != null)
              SizedBox(
                height: 340,
                child: ErrorState(message: _error!, onRetry: _load),
              )
            else if (_filtrados.isEmpty)
              const SizedBox(
                height: 340,
                child: EmptyState(
                  message: 'Ainda não há favoritos guardados.',
                  icon: Icons.bookmark_border_rounded,
                ),
              )
            else
              ..._filtrados.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _FavoritoCard(
                    item: item,
                    onTap: item.content == null
                        ? null
                        : () => _abrirConteudo(item.content!),
                    onRemove: () => _remover(item),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _LoginPrompt extends StatelessWidget {
  final VoidCallback onLogin;

  const _LoginPrompt({required this.onLogin});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEEE8E9)),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.lock_outline_rounded,
            color: AppColors.primary,
            size: 38,
          ),
          const SizedBox(height: 12),
          const Text(
            'Inicia sessao para ver os teus favoritos.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textMedium, height: 1.4),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: onLogin,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Iniciar sessao'),
          ),
        ],
      ),
    );
  }
}

class _FavoritoCard extends StatelessWidget {
  final SavedContent item;
  final VoidCallback? onTap;
  final VoidCallback onRemove;

  const _FavoritoCard({
    required this.item,
    required this.onTap,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final content = item.content;
    final isPremium = content?.isJindungo ?? false;
    final isPodcast = content?.isPodcast ?? false;
    final type =
        content?.contentType?.name ?? (isPodcast ? 'Podcast' : 'Conteudo');

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isPremium
                  ? AppColors.primary.withValues(alpha: 0.4)
                  : const Color(0xFFEEE8E9),
              width: isPremium ? 1.5 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: isPremium
                      ? AppColors.primary.withValues(alpha: 0.1)
                      : const Color(0xFFF0EAEA),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  isPodcast
                      ? Icons.podcasts_rounded
                      : isPremium
                      ? Icons.workspace_premium_outlined
                      : Icons.article_outlined,
                  color: isPremium ? AppColors.primary : AppColors.textLight,
                  size: 21,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      type.toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: isPremium
                            ? AppColors.primary
                            : AppColors.textLight,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      content?.title ?? 'Conteudo #${item.contentId}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textDark,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(
                          Icons.bookmark_rounded,
                          size: 13,
                          color: AppColors.textLight,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          timeAgo(item.createdAt).isEmpty
                              ? 'guardado'
                              : timeAgo(item.createdAt),
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textLight,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'Remover',
                onPressed: onRemove,
                icon: const Icon(
                  Icons.bookmark_remove_rounded,
                  color: AppColors.primary,
                  size: 22,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
