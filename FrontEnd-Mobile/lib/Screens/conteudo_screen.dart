import 'dart:async';

import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/comment.dart';
import '../models/content.dart';
import '../services/content_service.dart';
import '../theme/app_colors.dart';

class ConteudoScreen extends StatefulWidget {
  final int? contentId;
  final Content? initialContent;

  const ConteudoScreen({super.key, this.contentId, this.initialContent});

  @override
  State<ConteudoScreen> createState() => _ConteudoScreenState();
}

class _ConteudoScreenState extends State<ConteudoScreen> {
  static const _commentsBatchSize = 5;

  final _service = ContentService();
  final _commentController = TextEditingController();
  final _scrollController = ScrollController();
  Content? _content;
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isSaved = false;
  bool _isCheckingSaved = false;
  bool _isTogglingReaction = false;
  bool _isSharing = false;
  bool _isUpdatingProgress = false;
  bool _isAccessBlocked = false;
  bool _commentsExpanded = false;
  bool _isLoadingComments = false;
  bool _isSendingComment = false;
  String? _commentsError;
  List<Comment> _allComments = [];
  int _visibleCommentsCount = 0;
  String? _error;
  int _lastProgressSent = 0;

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
    _commentController.dispose();
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
      _isAccessBlocked = false;
      _error = null;
    });
    try {
      final content = await _service.getContent(id);
      final isSaved = content.isLocked
          ? false
          : await _isContentSaved(content.id);
      if (!mounted) return;
      setState(() {
        _content = content;
        _isSaved = isSaved;
        _lastProgressSent = 0;
        _commentsExpanded = false;
        _commentsError = null;
        _allComments = [];
        _visibleCommentsCount = 0;
      });
      if (!content.isLocked) _sendProgress(10);
    } on ForbiddenException catch (e) {
      if (mounted) {
        setState(() {
          if (_isJindungoAccessDenied(e)) {
            _isAccessBlocked = true;
            _error = null;
          } else {
            _error = e.message;
          }
        });
      }
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
    if (content == null ||
        content.isLocked ||
        _isAccessBlocked ||
        _isTogglingReaction) {
      return;
    }
    setState(() => _isTogglingReaction = true);
    try {
      final result = await _service.toggleReaction(contentId: content.id);
      if (!mounted) return;
      setState(() {
        _content = content.copyWith(
          likedByMe: result.reacted,
          reactionsCount: result.reactionsCount,
        );
      });
      _showSnackBar(result.reacted ? 'Reacao adicionada.' : 'Reacao removida.');
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } finally {
      if (mounted) setState(() => _isTogglingReaction = false);
    }
  }

  Future<void> _toggleSaveContent() async {
    final content = _content;
    if (content == null || content.isLocked || _isAccessBlocked || _isSaving) {
      return;
    }
    setState(() => _isSaving = true);
    try {
      if (_isSaved) {
        await _service.removeSavedContent(content.id);
      } else {
        await _service.saveContent(content.id);
      }
      if (!mounted) return;
      setState(() => _isSaved = !_isSaved);
      _showSnackBar(_isSaved ? 'Conteudo guardado.' : 'Conteudo removido.');
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _shareContent() async {
    final content = _content;
    if (content == null || content.isLocked || _isAccessBlocked || _isSharing) {
      return;
    }
    setState(() => _isSharing = true);
    try {
      final summary = (content.summary ?? '').trim();
      final text = [
        '${content.title} - Economia com Historia',
        if (summary.isNotEmpty) summary,
      ].join('\n\n');
      await SharePlus.instance.share(ShareParams(text: text));
    } catch (_) {
      if (mounted) _showSnackBar('Nao foi possivel partilhar.');
    } finally {
      if (mounted) setState(() => _isSharing = false);
    }
  }

  Future<bool> _isContentSaved(int contentId) async {
    if (mounted) setState(() => _isCheckingSaved = true);
    try {
      var page = 1;
      while (true) {
        final response = await _service.getSavedContents(page: page);
        if (response.data.any((item) => item.contentId == contentId)) {
          return true;
        }
        if (!response.hasMore) return false;
        page += 1;
      }
    } catch (_) {
      return false;
    } finally {
      if (mounted) setState(() => _isCheckingSaved = false);
    }
  }

  Future<void> _toggleComments() async {
    final content = _content;
    if (content == null || content.isLocked || _isAccessBlocked) return;
    if (_commentsExpanded) {
      setState(() => _commentsExpanded = false);
      return;
    }
    setState(() => _commentsExpanded = true);
    if (_allComments.isEmpty && !_isLoadingComments) {
      await _loadComments();
    }
  }

  Future<void> _loadComments() async {
    final content = _content;
    if (content == null || _isLoadingComments) return;
    setState(() {
      _isLoadingComments = true;
      _commentsError = null;
    });
    try {
      final comments = await _service.getComments(content.id);
      if (!mounted) return;
      setState(() {
        _allComments = comments;
        _visibleCommentsCount = comments.length < _commentsBatchSize
            ? comments.length
            : _commentsBatchSize;
        _content = content.copyWith(commentsCount: comments.length);
      });
    } on AppException catch (e) {
      if (mounted) setState(() => _commentsError = e.message);
    } catch (_) {
      if (mounted) {
        setState(() => _commentsError = 'Erro ao carregar comentarios.');
      }
    } finally {
      if (mounted) setState(() => _isLoadingComments = false);
    }
  }

  Future<void> _sendComment() async {
    final content = _content;
    final text = _commentController.text.trim();
    if (content == null || text.isEmpty || _isSendingComment) return;
    setState(() => _isSendingComment = true);
    try {
      await _service.addComment(contentId: content.id, comment: text);
      _commentController.clear();
      await _loadComments();
      if (mounted) _showSnackBar('Comentario publicado.');
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } catch (_) {
      if (mounted) _showSnackBar('Erro ao enviar comentario.');
    } finally {
      if (mounted) setState(() => _isSendingComment = false);
    }
  }

  void _revealMoreComments() {
    if (!_commentsExpanded || _isLoadingComments) return;
    if (_visibleCommentsCount >= _allComments.length) return;
    setState(() {
      final next = _visibleCommentsCount + _commentsBatchSize;
      _visibleCommentsCount = next > _allComments.length
          ? _allComments.length
          : next;
    });
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
    if (_commentsExpanded && position.extentAfter < 260) {
      _revealMoreComments();
    }
  }

  void _sendProgress(int progressPercent) {
    final content = _content;
    if (content == null ||
        content.isLocked ||
        _isAccessBlocked ||
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

  bool _isJindungoAccessDenied(ForbiddenException exception) {
    final message = exception.message.toLowerCase();
    final content = _content ?? widget.initialContent;
    return content?.isJindungo == true ||
        message.contains('jindungo') ||
        message.contains('subscr') ||
        message.contains('subscription');
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
                    : _isAccessBlocked
                    ? _LockedContentView(content: content, onRetry: _load)
                    : content == null
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [
                          EmptyState(message: 'Conteúdo não encontrado.'),
                        ],
                      )
                    : content.isLocked
                    ? _LockedContentView(content: content, onRetry: _load)
                    : _ContentBody(
                        content: content,
                        scrollController: _scrollController,
                        onLike: _toggleLike,
                        onSave: _toggleSaveContent,
                        onShare: _shareContent,
                        onCommentsTap: _toggleComments,
                        commentController: _commentController,
                        onSendComment: _sendComment,
                        onLoadMoreComments: _revealMoreComments,
                        isSaving: _isSaving,
                        isSaved: _isSaved,
                        isCheckingSaved: _isCheckingSaved,
                        isTogglingReaction: _isTogglingReaction,
                        isSharing: _isSharing,
                        commentsExpanded: _commentsExpanded,
                        comments: _allComments
                            .take(_visibleCommentsCount)
                            .toList(growable: false),
                        hasMoreComments:
                            _visibleCommentsCount < _allComments.length,
                        isLoadingComments: _isLoadingComments,
                        isSendingComment: _isSendingComment,
                        commentsError: _commentsError,
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
  final VoidCallback onShare;
  final VoidCallback onCommentsTap;
  final TextEditingController commentController;
  final VoidCallback onSendComment;
  final VoidCallback onLoadMoreComments;
  final bool isSaving;
  final bool isSaved;
  final bool isCheckingSaved;
  final bool isTogglingReaction;
  final bool isSharing;
  final bool commentsExpanded;
  final List<Comment> comments;
  final bool hasMoreComments;
  final bool isLoadingComments;
  final bool isSendingComment;
  final String? commentsError;

  const _ContentBody({
    required this.content,
    required this.scrollController,
    required this.onLike,
    required this.onSave,
    required this.onShare,
    required this.onCommentsTap,
    required this.commentController,
    required this.onSendComment,
    required this.onLoadMoreComments,
    required this.isSaving,
    required this.isSaved,
    required this.isCheckingSaved,
    required this.isTogglingReaction,
    required this.isSharing,
    required this.commentsExpanded,
    required this.comments,
    required this.hasMoreComments,
    required this.isLoadingComments,
    required this.isSendingComment,
    required this.commentsError,
  });

  @override
  Widget build(BuildContext context) {
    if (content.isLocked) {
      return _LockedContentView(content: content, onRetry: null);
    }

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
                  onShare: onShare,
                  onCommentsTap: onCommentsTap,
                  isSaving: isSaving,
                  isSaved: isSaved,
                  isCheckingSaved: isCheckingSaved,
                  isTogglingReaction: isTogglingReaction,
                  isSharing: isSharing,
                ),
                const Divider(color: Color(0xFFEEE8E9), height: 32),
                _InlineCommentsSection(
                  content: content,
                  expanded: commentsExpanded,
                  comments: comments,
                  hasMoreComments: hasMoreComments,
                  isLoading: isLoadingComments,
                  isSending: isSendingComment,
                  error: commentsError,
                  controller: commentController,
                  onToggle: onCommentsTap,
                  onSend: onSendComment,
                  onLoadMore: onLoadMoreComments,
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

class _LockedContentView extends StatelessWidget {
  final Content? content;
  final VoidCallback? onRetry;

  const _LockedContentView({required this.content, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final item = content;
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
      children: [
        if (item != null) ...[
          Row(
            children: [
              _Badge(
                label: item.contentType?.name.toUpperCase() ?? 'CONTEUDO',
                cor: AppColors.primary,
              ),
              if (item.isJindungo) ...[
                const SizedBox(width: 8),
                const _Badge(label: 'JINDUNGO', cor: Color(0xFFB5933A)),
              ],
            ],
          ),
          const SizedBox(height: 14),
          Text(
            item.title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
              height: 1.25,
            ),
          ),
          if (item.displayImage != null) ...[
            const SizedBox(height: 18),
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: AppNetworkImage(
                url: item.displayImage,
                height: 220,
                width: double.infinity,
              ),
            ),
          ],
          if ((item.summary ?? '').isNotEmpty) ...[
            const SizedBox(height: 18),
            Text(
              item.summary!,
              style: const TextStyle(
                fontSize: 15,
                color: AppColors.textMedium,
                height: 1.55,
              ),
            ),
          ],
          const SizedBox(height: 24),
        ],
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFEEE8E9)),
          ),
          child: Column(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: const BoxDecoration(
                  color: Color(0xFFF2E6E9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.lock_outline_rounded,
                  color: AppColors.primary,
                  size: 28,
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'Conteúdo exclusivo Jindungo',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Este conteúdo requer uma subscrição ativa para aceder ao texto completo.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textMedium,
                  height: 1.45,
                ),
              ),
              if (onRetry != null) ...[
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: onRetry,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                  ),
                  child: const Text('Verificar novamente'),
                ),
              ],
            ],
          ),
        ),
      ],
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

class _InlineCommentsSection extends StatelessWidget {
  final Content content;
  final bool expanded;
  final List<Comment> comments;
  final bool hasMoreComments;
  final bool isLoading;
  final bool isSending;
  final String? error;
  final TextEditingController controller;
  final VoidCallback onToggle;
  final VoidCallback onSend;
  final VoidCallback onLoadMore;

  const _InlineCommentsSection({
    required this.content,
    required this.expanded,
    required this.comments,
    required this.hasMoreComments,
    required this.isLoading,
    required this.isSending,
    required this.error,
    required this.controller,
    required this.onToggle,
    required this.onSend,
    required this.onLoadMore,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: onToggle,
            icon: Icon(
              expanded
                  ? Icons.keyboard_arrow_up_rounded
                  : Icons.chat_bubble_outline_rounded,
            ),
            label: Text(
              expanded
                  ? 'Ocultar comentarios'
                  : 'Ver comentarios (${content.commentsCount})',
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),
        if (expanded) ...[
          const SizedBox(height: 18),
          _InlineCommentComposer(
            controller: controller,
            isSending: isSending,
            onSend: onSend,
          ),
          const SizedBox(height: 18),
          if (isLoading)
            const SizedBox(
              height: 120,
              child: LoadingState(message: 'A carregar comentarios...'),
            )
          else if (error != null)
            ErrorState(message: error!, onRetry: onToggle)
          else if (comments.isEmpty)
            const EmptyState(message: 'Ainda nao ha comentarios.')
          else ...[
            ...comments.map((comment) => _InlineCommentTile(comment: comment)),
            if (hasMoreComments) ...[
              const SizedBox(height: 8),
              Center(
                child: TextButton(
                  onPressed: onLoadMore,
                  child: const Text('Carregar mais comentarios'),
                ),
              ),
            ],
          ],
        ],
      ],
    );
  }
}

class _InlineCommentComposer extends StatelessWidget {
  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onSend;

  const _InlineCommentComposer({
    required this.controller,
    required this.isSending,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: controller,
            minLines: 1,
            maxLines: 3,
            style: const TextStyle(fontSize: 14, color: AppColors.textDark),
            decoration: InputDecoration(
              hintText: 'Adicionar comentario...',
              hintStyle: const TextStyle(
                fontSize: 14,
                color: AppColors.textLight,
              ),
              filled: true,
              fillColor: const Color(0xFFF7F3F4),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(22),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 10,
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        GestureDetector(
          onTap: isSending ? null : onSend,
          child: Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: isSending ? AppColors.textLight : AppColors.primary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isSending ? Icons.hourglass_empty_rounded : Icons.send_rounded,
              color: Colors.white,
              size: 18,
            ),
          ),
        ),
      ],
    );
  }
}

class _InlineCommentTile extends StatelessWidget {
  final Comment comment;

  const _InlineCommentTile({required this.comment});

  @override
  Widget build(BuildContext context) {
    final name = comment.user?.name ?? 'Utilizador';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primary,
            child: Text(
              initials(name),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        name,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textDark,
                        ),
                      ),
                    ),
                    Text(
                      timeAgo(comment.createdAt),
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  comment.comment,
                  style: const TextStyle(
                    fontSize: 13.5,
                    color: AppColors.textMedium,
                    height: 1.5,
                  ),
                ),
                if (comment.replies.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  ...comment.replies.map(
                    (reply) => Padding(
                      padding: const EdgeInsets.only(bottom: 8, left: 12),
                      child: Text(
                        '${reply.user?.name ?? 'Utilizador'}: ${reply.reply}',
                        style: const TextStyle(
                          fontSize: 12.5,
                          color: AppColors.textMedium,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AcoesArtigo extends StatelessWidget {
  final Content content;
  final VoidCallback onLike;
  final VoidCallback onSave;
  final VoidCallback onShare;
  final VoidCallback onCommentsTap;
  final bool isSaving;
  final bool isSaved;
  final bool isCheckingSaved;
  final bool isTogglingReaction;
  final bool isSharing;

  const _AcoesArtigo({
    required this.content,
    required this.onLike,
    required this.onSave,
    required this.onShare,
    required this.onCommentsTap,
    required this.isSaving,
    required this.isSaved,
    required this.isCheckingSaved,
    required this.isTogglingReaction,
    required this.isSharing,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        GestureDetector(
          onTap: isTogglingReaction ? null : onLike,
          child: Icon(
            isTogglingReaction
                ? Icons.hourglass_empty_rounded
                : content.likedByMe
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
        GestureDetector(
          onTap: onCommentsTap,
          child: const Icon(
            Icons.chat_bubble_outline_rounded,
            color: AppColors.textLight,
            size: 18,
          ),
        ),
        const SizedBox(width: 6),
        GestureDetector(
          onTap: onCommentsTap,
          child: Text(
            '${content.commentsCount}',
            style: const TextStyle(fontSize: 13, color: AppColors.textLight),
          ),
        ),
        const Spacer(),
        GestureDetector(
          onTap: isSharing ? null : onShare,
          child: Icon(
            isSharing ? Icons.hourglass_empty_rounded : Icons.share_outlined,
            color: AppColors.textLight,
            size: 20,
          ),
        ),
        const SizedBox(width: 16),
        GestureDetector(
          onTap: (isSaving || isCheckingSaved) ? null : onSave,
          child: Icon(
            (isSaving || isCheckingSaved)
                ? Icons.hourglass_empty_rounded
                : isSaved
                ? Icons.bookmark_rounded
                : Icons.bookmark_add_outlined,
            color: isSaved ? AppColors.primary : AppColors.textLight,
            size: 20,
          ),
        ),
      ],
    );
  }
}
