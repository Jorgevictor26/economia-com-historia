import 'dart:async';

import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:video_player/video_player.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/comment.dart';
import '../models/content.dart';
import '../services/content_service.dart';
import '../theme/app_colors.dart';
import '../widgets/inline_comments_section.dart';

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
  final _replyController = TextEditingController();
  final _scrollController = ScrollController();
  Content? _content;
  VideoPlayerController? _videoController;
  String? _videoUrl;
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
  bool _isSendingReply = false;
  bool _isVideoReady = false;
  bool _isVideoPlaying = false;
  bool _videoLoadError = false;
  String? _commentsError;
  List<Comment> _allComments = [];
  int _visibleCommentsCount = 0;
  int? _replyingToCommentId;
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
    _replyController.dispose();
    _videoController?.removeListener(_handleVideoStateChanged);
    _videoController?.dispose();
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
        _replyingToCommentId = null;
      });
      unawaited(_configureVideo(content));
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

  void _toggleReplyComposer(int commentId) {
    setState(() {
      if (_replyingToCommentId == commentId) {
        _replyingToCommentId = null;
        _replyController.clear();
      } else {
        _replyingToCommentId = commentId;
        _replyController.clear();
      }
    });
  }

  Future<void> _sendReply(int commentId) async {
    final text = _replyController.text.trim();
    if (text.isEmpty || _isSendingReply) return;
    setState(() => _isSendingReply = true);
    try {
      await _service.replyToComment(commentId: commentId, reply: text);
      _replyController.clear();
      if (mounted) {
        setState(() => _replyingToCommentId = null);
      }
      await _loadComments();
      if (mounted) _showSnackBar('Resposta publicada.');
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } catch (_) {
      if (mounted) _showSnackBar('Erro ao enviar resposta.');
    } finally {
      if (mounted) setState(() => _isSendingReply = false);
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

  Future<void> _configureVideo(Content content) async {
    final url = content.displayVideo;
    if (url == _videoUrl && _videoController != null) return;

    _videoController?.removeListener(_handleVideoStateChanged);
    await _videoController?.dispose();
    _videoController = null;
    _videoUrl = url;

    if (url == null || url.trim().isEmpty || content.isLocked) {
      if (!mounted) return;
      setState(() {
        _isVideoReady = false;
        _isVideoPlaying = false;
        _videoLoadError = false;
      });
      return;
    }

    final controller = VideoPlayerController.networkUrl(Uri.parse(url));
    _videoController = controller;
    controller.addListener(_handleVideoStateChanged);

    if (mounted) {
      setState(() {
        _isVideoReady = false;
        _isVideoPlaying = false;
        _videoLoadError = false;
      });
    }

    try {
      await controller.initialize();
      await controller.setLooping(false);
      if (!mounted || _videoController != controller) {
        await controller.dispose();
        return;
      }
      setState(() {
        _isVideoReady = true;
        _videoLoadError = false;
      });
    } catch (_) {
      if (!mounted || _videoController != controller) return;
      setState(() {
        _isVideoReady = false;
        _isVideoPlaying = false;
        _videoLoadError = true;
      });
    }
  }

  void _handleVideoStateChanged() {
    final controller = _videoController;
    if (!mounted || controller == null) return;
    final value = controller.value;
    final nextPlaying = value.isPlaying;
    final nextError = value.hasError;
    if (_isVideoPlaying != nextPlaying || _videoLoadError != nextError) {
      setState(() {
        _isVideoPlaying = nextPlaying;
        _videoLoadError = nextError;
      });
      return;
    }
    if (_isVideoReady) setState(() {});
  }

  Future<void> _toggleVideoPlayback() async {
    final controller = _videoController;
    if (controller == null || !_isVideoReady || _videoLoadError) return;
    if (controller.value.isPlaying) {
      await controller.pause();
    } else {
      await controller.play();
    }
  }

  Future<void> _seekVideoBy(Duration offset) async {
    final controller = _videoController;
    if (controller == null || !_isVideoReady || _videoLoadError) return;
    final value = controller.value;
    final duration = value.duration;
    final next = value.position + offset;
    await controller.seekTo(
      Duration(
        milliseconds: next.inMilliseconds
            .clamp(0, duration.inMilliseconds)
            .toInt(),
      ),
    );
  }

  Future<void> _seekVideoTo(double milliseconds) async {
    final controller = _videoController;
    if (controller == null || !_isVideoReady || _videoLoadError) return;
    await controller.seekTo(Duration(milliseconds: milliseconds.round()));
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
                        onRetryComments: _loadComments,
                        onLoadMoreComments: _revealMoreComments,
                        onToggleReply: _toggleReplyComposer,
                        onSendReply: _sendReply,
                        videoController: _videoController,
                        onToggleVideoPlayback: _toggleVideoPlayback,
                        onSeekVideoBy: _seekVideoBy,
                        onSeekVideoTo: _seekVideoTo,
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
                        isSendingReply: _isSendingReply,
                        isVideoReady: _isVideoReady,
                        isVideoPlaying: _isVideoPlaying,
                        videoLoadError: _videoLoadError,
                        replyingToCommentId: _replyingToCommentId,
                        replyController: _replyController,
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
  final VoidCallback onRetryComments;
  final VoidCallback onLoadMoreComments;
  final ValueChanged<int> onToggleReply;
  final ValueChanged<int> onSendReply;
  final VideoPlayerController? videoController;
  final Future<void> Function() onToggleVideoPlayback;
  final Future<void> Function(Duration offset) onSeekVideoBy;
  final Future<void> Function(double milliseconds) onSeekVideoTo;
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
  final bool isSendingReply;
  final bool isVideoReady;
  final bool isVideoPlaying;
  final bool videoLoadError;
  final int? replyingToCommentId;
  final TextEditingController replyController;
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
    required this.onRetryComments,
    required this.onLoadMoreComments,
    required this.onToggleReply,
    required this.onSendReply,
    required this.videoController,
    required this.onToggleVideoPlayback,
    required this.onSeekVideoBy,
    required this.onSeekVideoTo,
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
    required this.isSendingReply,
    required this.isVideoReady,
    required this.isVideoPlaying,
    required this.videoLoadError,
    required this.replyingToCommentId,
    required this.replyController,
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
                      const _Badge(
                        label: 'JINDUNGO',
                        cor: AppColors.accentGold,
                      ),
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
          if (content.displayVideo != null) ...[
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: _InlineVideoPlayer(
                controller: videoController,
                isReady: isVideoReady,
                isPlaying: isVideoPlaying,
                hasError: videoLoadError,
                onTogglePlayback: onToggleVideoPlayback,
                onSeekBackward: () =>
                    onSeekVideoBy(const Duration(seconds: -10)),
                onSeekForward: () => onSeekVideoBy(const Duration(seconds: 10)),
                onSeekTo: onSeekVideoTo,
              ),
            ),
          ] else if (content.displayImage != null)
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
                const Divider(color: AppColors.line, height: 32),
                InlineCommentsSection(
                  content: content,
                  expanded: commentsExpanded,
                  comments: comments,
                  hasMoreComments: hasMoreComments,
                  isLoading: isLoadingComments,
                  isSending: isSendingComment,
                  error: commentsError,
                  controller: commentController,
                  replyController: replyController,
                  onToggle: onCommentsTap,
                  onSend: onSendComment,
                  onRetry: onRetryComments,
                  onLoadMore: onLoadMoreComments,
                  onToggleReply: onToggleReply,
                  onSendReply: onSendReply,
                  replyingToCommentId: replyingToCommentId,
                  isSendingReply: isSendingReply,
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
                const _Badge(label: 'JINDUNGO', cor: AppColors.accentGold),
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
            border: Border.all(color: AppColors.line),
          ),
          child: Column(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: const BoxDecoration(
                  color: AppColors.blush,
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

class _InlineVideoPlayer extends StatelessWidget {
  final VideoPlayerController? controller;
  final bool isReady;
  final bool isPlaying;
  final bool hasError;
  final Future<void> Function() onTogglePlayback;
  final Future<void> Function() onSeekBackward;
  final Future<void> Function() onSeekForward;
  final Future<void> Function(double milliseconds) onSeekTo;

  const _InlineVideoPlayer({
    required this.controller,
    required this.isReady,
    required this.isPlaying,
    required this.hasError,
    required this.onTogglePlayback,
    required this.onSeekBackward,
    required this.onSeekForward,
    required this.onSeekTo,
  });

  @override
  Widget build(BuildContext context) {
    final player = controller;
    if (hasError) {
      return _MediaFallback(
        icon: Icons.videocam_off_outlined,
        title: 'Nao foi possivel carregar o video',
        subtitle: 'Confirma a ligacao ou tenta novamente mais tarde.',
      );
    }
    if (player == null || !isReady) {
      return const _MediaFallback(
        icon: Icons.play_circle_outline_rounded,
        title: 'A preparar video',
        subtitle: 'O player esta a carregar o conteudo.',
        loading: true,
      );
    }

    final value = player.value;
    final duration = value.duration;
    final position = value.position;
    final max = duration.inMilliseconds <= 0
        ? 1.0
        : duration.inMilliseconds.toDouble();
    final current = position.inMilliseconds.clamp(0, max.toInt()).toDouble();

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.textDark,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          AspectRatio(
            aspectRatio: value.aspectRatio <= 0 ? 16 / 9 : value.aspectRatio,
            child: Stack(
              alignment: Alignment.center,
              children: [
                VideoPlayer(player),
                Positioned.fill(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.18),
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.24),
                        ],
                      ),
                    ),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _MediaCircleButton(
                      icon: Icons.replay_10_rounded,
                      onTap: onSeekBackward,
                      label: 'Recuar 10 segundos',
                    ),
                    const SizedBox(width: 14),
                    _MediaCircleButton(
                      icon: isPlaying
                          ? Icons.pause_rounded
                          : Icons.play_arrow_rounded,
                      onTap: onTogglePlayback,
                      label: isPlaying ? 'Pausar video' : 'Reproduzir video',
                      large: true,
                    ),
                    const SizedBox(width: 14),
                    _MediaCircleButton(
                      icon: Icons.forward_10_rounded,
                      onTap: onSeekForward,
                      label: 'Avancar 10 segundos',
                    ),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
            child: Column(
              children: [
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    activeTrackColor: Colors.white,
                    inactiveTrackColor: Colors.white.withValues(alpha: 0.26),
                    thumbColor: Colors.white,
                    trackHeight: 3,
                    thumbShape: const RoundSliderThumbShape(
                      enabledThumbRadius: 5,
                    ),
                    overlayShape: const RoundSliderOverlayShape(
                      overlayRadius: 10,
                    ),
                  ),
                  child: Slider(
                    min: 0,
                    max: max,
                    value: current,
                    onChanged: onSeekTo,
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _formatMediaDuration(position),
                      style: const TextStyle(
                        fontSize: 11,
                        color: Colors.white70,
                      ),
                    ),
                    Text(
                      _formatMediaDuration(duration),
                      style: const TextStyle(
                        fontSize: 11,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MediaCircleButton extends StatelessWidget {
  final IconData icon;
  final Future<void> Function() onTap;
  final String label;
  final bool large;

  const _MediaCircleButton({
    required this.icon,
    required this.onTap,
    required this.label,
    this.large = false,
  });

  @override
  Widget build(BuildContext context) {
    final size = large ? 58.0 : 46.0;
    return Semantics(
      button: true,
      label: label,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: large ? 0.72 : 0.52),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Colors.white, size: large ? 34 : 26),
        ),
      ),
    );
  }
}

class _MediaFallback extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool loading;

  const _MediaFallback({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.soft,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        children: [
          if (loading)
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                strokeWidth: 2.4,
                color: AppColors.primary,
              ),
            )
          else
            Icon(icon, color: AppColors.primary, size: 34),
          const SizedBox(height: 12),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textMedium,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

String _formatMediaDuration(Duration duration) {
  final totalSeconds = duration.inSeconds < 0 ? 0 : duration.inSeconds;
  final minutes = totalSeconds ~/ 60;
  final seconds = totalSeconds % 60;
  return '$minutes:${seconds.toString().padLeft(2, '0')}';
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
