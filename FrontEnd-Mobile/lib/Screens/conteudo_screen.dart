import 'dart:async';

import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../services/content_service.dart';
import '../theme/app_colors.dart';
import 'discussao_screen.dart';

class ConteudoScreen extends StatefulWidget {
  final int? contentId;
  final Content? initialContent;

  const ConteudoScreen({super.key, this.contentId, this.initialContent});

  @override
  State<ConteudoScreen> createState() => _ConteudoScreenState();
}

class _ConteudoScreenState extends State<ConteudoScreen> {
  final _service = ContentService();
  Content? _content;
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isUpdatingProgress = false;
  String? _error;
  int _lastProgressSent = 0;
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _content = widget.initialContent;
    _scrollController.addListener(_handleScrollProgress);
    _load();
  }

  @override
  void dispose() {
    _scrollController.removeListener(_handleScrollProgress);
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final id = widget.contentId ?? widget.initialContent?.id;
    if (id == null || id == 0) {
      setState(() {
        _isLoading = false;
        _error = 'Conteúdo inválido.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final content = await _service.getContent(id);
      if (!mounted) return;
      setState(() {
        _content = content;
        _lastProgressSent = 0;
      });
      if (!content.isLocked) _sendProgress(10);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar conteúdo.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleLike() async {
    final content = _content;
    if (content == null) return;
    try {
      final result = await _service.toggleReaction(contentId: content.id);
      if (!mounted) return;
      _showSnackBar(result.reacted ? 'Reação adicionada.' : 'Reação removida.');
      await _load();
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    }
  }

  Future<void> _saveContent() async {
    final content = _content;
    if (content == null || _isSaving) return;
    setState(() => _isSaving = true);
    try {
      await _service.saveContent(content.id);
      if (mounted) _showSnackBar('Conteúdo guardado.');
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _handleScrollProgress() {
    final content = _content;
    if (content == null || content.isLocked || !_scrollController.hasClients) {
      return;
    }
    final position = _scrollController.position;
    if (position.maxScrollExtent <= 0) return;

    final progress = ((position.pixels / position.maxScrollExtent) * 100)
        .round()
        .clamp(0, 100)
        .toInt();
    if (progress >= 100 || progress >= _lastProgressSent + 15) {
      _sendProgress(progress);
    }
  }

  void _sendProgress(int progressPercent) {
    final content = _content;
    if (content == null ||
        _isUpdatingProgress ||
        progressPercent <= _lastProgressSent) {
      return;
    }

    final previousProgress = _lastProgressSent;
    _lastProgressSent = progressPercent;
    _isUpdatingProgress = true;
    unawaited(_persistProgress(content.id, progressPercent, previousProgress));
  }

  Future<void> _persistProgress(
    int contentId,
    int progressPercent,
    int previousProgress,
  ) async {
    try {
      await _service.updateProgress(
        contentId: contentId,
        progressPercent: progressPercent,
      );
    } catch (_) {
      _lastProgressSent = previousProgress;
    } finally {
      _isUpdatingProgress = false;
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final content = _content;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const _AppBar(),
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primary,
                onRefresh: _load,
                child: _isLoading
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [
                          SizedBox(
                            height: 480,
                            child: LoadingState(
                              message: 'A carregar conteúdo...',
                            ),
                          ),
                        ],
                      )
                    : _error != null
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: [
                          ErrorState(message: _error!, onRetry: _load),
                        ],
                      )
                    : content == null
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [
                          EmptyState(message: 'Conteúdo não encontrado.'),
                        ],
                      )
                    : _ContentBody(
                        content: content,
                        scrollController: _scrollController,
                        onLike: _toggleLike,
                        onSave: _saveContent,
                        isSaving: _isSaving,
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AppBar extends StatelessWidget {
  const _AppBar();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.maybePop(context),
            child: const Icon(
              Icons.arrow_back_rounded,
              color: AppColors.primary,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          const Text(
            'Conteúdo',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textDark,
            ),
          ),
        ],
      ),
    );
  }
}

class _ContentBody extends StatelessWidget {
  final Content content;
  final ScrollController scrollController;
  final VoidCallback onLike;
  final VoidCallback onSave;
  final bool isSaving;

  const _ContentBody({
    required this.content,
    required this.scrollController,
    required this.onLike,
    required this.onSave,
    required this.isSaving,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      controller: scrollController,
      physics: const AlwaysScrollableScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _Badge(
                      label:
                          content.contentType?.name.toUpperCase() ?? 'CONTEUDO',
                      cor: AppColors.primary,
                    ),
                    if (content.isJindungo) ...[
                      const SizedBox(width: 8),
                      const _Badge(label: 'JINDUNGO', cor: Color(0xFFB5933A)),
                    ],
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  content.title,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 16),
                _AutorRow(content: content),
                const SizedBox(height: 20),
              ],
            ),
          ),
          if (content.displayImage != null)
            SizedBox(
              width: double.infinity,
              height: 220,
              child: AppNetworkImage(url: content.displayImage),
            ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if ((content.summary ?? '').isNotEmpty) ...[
                  const SizedBox(height: 20),
                  Text(
                    content.summary!,
                    style: const TextStyle(
                      fontSize: 15,
                      color: AppColors.primary,
                      height: 1.6,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
                const SizedBox(height: 20),
                _ContentText(text: content.content ?? ''),
                const SizedBox(height: 24),
                _AcoesArtigo(
                  content: content,
                  onLike: onLike,
                  onSave: onSave,
                  isSaving: isSaving,
                ),
                const Divider(color: Color(0xFFEEE8E9), height: 32),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DiscussaoScreen(content: content),
                      ),
                    ),
                    icon: const Icon(Icons.chat_bubble_outline_rounded),
                    label: Text('Ver comentários (${content.commentsCount})'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color cor;

  const _Badge({required this.label, required this.cor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: cor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: Colors.white,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _AutorRow extends StatelessWidget {
  final Content content;

  const _AutorRow({required this.content});

  @override
  Widget build(BuildContext context) {
    final author = content.author;
    return Row(
      children: [
        CircleAvatar(
          radius: 20,
          backgroundColor: AppColors.primary,
          child: Text(
            initials(author?.name),
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                author?.name ?? 'Autor',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '${formatDate(content.createdAt)} - ${readTime(content.content)}',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textLight,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ContentText extends StatelessWidget {
  final String text;

  const _ContentText({required this.text});

  @override
  Widget build(BuildContext context) {
    if (text.trim().isEmpty) {
      return const EmptyState(message: 'Este conteúdo não tem corpo textual.');
    }
    final paragraphs = text
        .split(RegExp(r'\n\s*\n'))
        .where((p) => p.trim().isNotEmpty);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: paragraphs
          .map(
            (paragraph) => Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                paragraph.trim(),
                style: const TextStyle(
                  fontSize: 15,
                  color: AppColors.textMedium,
                  height: 1.7,
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _AcoesArtigo extends StatelessWidget {
  final Content content;
  final VoidCallback onLike;
  final VoidCallback onSave;
  final bool isSaving;

  const _AcoesArtigo({
    required this.content,
    required this.onLike,
    required this.onSave,
    required this.isSaving,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        GestureDetector(
          onTap: onLike,
          child: Icon(
            content.likedByMe
                ? Icons.favorite_rounded
                : Icons.favorite_border_rounded,
            color: content.likedByMe ? AppColors.primary : AppColors.textLight,
            size: 20,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          '${content.reactionsCount}',
          style: const TextStyle(fontSize: 13, color: AppColors.textLight),
        ),
        const SizedBox(width: 20),
        const Icon(
          Icons.chat_bubble_outline_rounded,
          color: AppColors.textLight,
          size: 18,
        ),
        const SizedBox(width: 6),
        Text(
          '${content.commentsCount}',
          style: const TextStyle(fontSize: 13, color: AppColors.textLight),
        ),
        const Spacer(),
        const Icon(Icons.share_outlined, color: AppColors.textLight, size: 20),
        const SizedBox(width: 16),
        GestureDetector(
          onTap: isSaving ? null : onSave,
          child: Icon(
            isSaving
                ? Icons.hourglass_empty_rounded
                : Icons.bookmark_add_outlined,
            color: AppColors.textLight,
            size: 20,
          ),
        ),
      ],
    );
  }
}
