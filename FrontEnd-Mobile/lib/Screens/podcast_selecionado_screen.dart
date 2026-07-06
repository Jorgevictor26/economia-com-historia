import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/comment.dart';
import '../models/content.dart';
import '../services/content_service.dart';
import '../theme/app_colors.dart';
import '../widgets/content_card.dart';
import '../widgets/inline_comments_section.dart';

class PodcastSelecionadoScreen extends StatefulWidget {
  final int? contentId;
  final Content? initialContent;

  const PodcastSelecionadoScreen({
    super.key,
    this.contentId,
    this.initialContent,
  });

  @override
  State<PodcastSelecionadoScreen> createState() =>
      _PodcastSelecionadoScreenState();
}

class _PodcastSelecionadoScreenState extends State<PodcastSelecionadoScreen> {
  static const _commentsBatchSize = 5;

  final _podcastService = PodcastService();
  final _audioPlayer = AudioPlayer();
  final _commentController = TextEditingController();
  final _replyController = TextEditingController();
  StreamSubscription<Duration>? _positionSubscription;
  StreamSubscription<Duration>? _durationSubscription;
  StreamSubscription<PlayerState>? _stateSubscription;
  StreamSubscription<void>? _completeSubscription;
  bool _isPlaying = false;
  bool _isAudioSeeking = false;
  bool _audioLoadError = false;
  bool _isTogglingReaction = false;
  bool _isSaving = false;
  bool _isSaved = false;
  bool _isCheckingSaved = false;
  bool _isSharing = false;
  bool _isLoadingComments = false;
  bool _isSendingComment = false;
  bool _isSendingReply = false;
  Duration _audioPosition = Duration.zero;
  Duration _audioDuration = Duration.zero;
  bool _isLoading = true;
  String? _error;
  String? _commentsError;
  Content? _content;
  List<Content> _relatedPodcasts = [];
  List<Comment> _allComments = [];
  int _visibleCommentsCount = 0;
  int? _replyingToCommentId;
  String? _loadedAudioUrl;

  @override
  void initState() {
    super.initState();
    _content = widget.initialContent;
    _bindAudioPlayer();
    _load();
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    _durationSubscription?.cancel();
    _stateSubscription?.cancel();
    _completeSubscription?.cancel();
    _commentController.dispose();
    _replyController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final id = widget.contentId ?? widget.initialContent?.id;
    if (id == null || id == 0) {
      setState(() {
        _isLoading = false;
        _error = 'Podcast inválido.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final podcast = await _podcastService.getPodcast(id);
      final related = await _loadRelatedPodcasts(podcast);
      final isSaved = podcast.isLocked ? false : await _isContentSaved(id);
      if (!mounted) return;
      setState(() {
        _content = podcast;
        _relatedPodcasts = related;
        _isSaved = isSaved;
        _commentsError = null;
        _allComments = [];
        _visibleCommentsCount = 0;
        _replyingToCommentId = null;
      });
      unawaited(_loadComments());
      await _resetAudioFor(podcast.displayAudio);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar podcast.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<List<Content>> _loadRelatedPodcasts(Content podcast) async {
    final related = <int, Content>{};

    if (podcast.categoryId != null) {
      final byCategory = await _podcastService.getPodcasts(
        categoryId: podcast.categoryId,
      );
      for (final item in byCategory.data) {
        if (item.id != podcast.id) related[item.id] = item;
      }
    }

    if (related.length < 3) {
      final allPodcasts = await _podcastService.getPodcasts();
      for (final item in allPodcasts.data) {
        if (item.id != podcast.id) related[item.id] = item;
        if (related.length >= 3) break;
      }
    }

    return related.values.take(3).toList();
  }

  Future<bool> _isContentSaved(int contentId) async {
    if (mounted) setState(() => _isCheckingSaved = true);
    try {
      var page = 1;
      while (true) {
        final response = await _podcastService.getSavedContents(page: page);
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

  Future<void> _toggleLikePodcast() async {
    final content = _content;
    if (content == null || content.isLocked || _isTogglingReaction) return;
    setState(() => _isTogglingReaction = true);
    try {
      final result = await _podcastService.toggleReaction(
        contentId: content.id,
      );
      if (!mounted) return;
      setState(() {
        _content = content.copyWith(
          likedByMe: result.reacted,
          reactionsCount: result.reactionsCount,
        );
      });
      _showSnackBar(result.reacted ? 'Gosto adicionado.' : 'Gosto removido.');
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } catch (_) {
      if (mounted) _showSnackBar('Nao foi possivel atualizar o gosto.');
    } finally {
      if (mounted) setState(() => _isTogglingReaction = false);
    }
  }

  Future<void> _toggleSavePodcast() async {
    final content = _content;
    if (content == null || content.isLocked || _isSaving) return;
    setState(() => _isSaving = true);
    try {
      if (_isSaved) {
        await _podcastService.removeSavedContent(content.id);
      } else {
        await _podcastService.saveContent(content.id);
      }
      if (!mounted) return;
      setState(() => _isSaved = !_isSaved);
      _showSnackBar(_isSaved ? 'Podcast guardado.' : 'Podcast removido.');
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } catch (_) {
      if (mounted) _showSnackBar('Nao foi possivel guardar o podcast.');
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _sharePodcast() async {
    final content = _content;
    if (content == null || content.isLocked || _isSharing) return;
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

  Future<void> _loadComments() async {
    final content = _content;
    if (content == null || _isLoadingComments) return;
    setState(() {
      _isLoadingComments = true;
      _commentsError = null;
    });
    try {
      final comments = await _podcastService.getComments(content.id);
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
      await _podcastService.addComment(contentId: content.id, comment: text);
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
      await _podcastService.replyToComment(commentId: commentId, reply: text);
      _replyController.clear();
      if (mounted) setState(() => _replyingToCommentId = null);
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
    if (_isLoadingComments) return;
    if (_visibleCommentsCount >= _allComments.length) return;
    setState(() {
      final next = _visibleCommentsCount + _commentsBatchSize;
      _visibleCommentsCount = next > _allComments.length
          ? _allComments.length
          : next;
    });
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.primary),
    );
  }

  void _openRelatedPodcast(Content podcast) {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => PodcastSelecionadoScreen(
          contentId: podcast.id,
          initialContent: podcast,
        ),
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
              child: _isLoading
                  ? const LoadingState(message: 'A carregar podcast...')
                  : _error != null
                  ? ErrorState(message: _error!, onRetry: _load)
                  : content == null
                  ? const EmptyState(message: 'Podcast não encontrado.')
                  : SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 16),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(18),
                                  decoration: BoxDecoration(
                                    color: AppColors.cardBackground,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: AppColors.line),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.primary.withValues(
                                          alpha: 0.05,
                                        ),
                                        blurRadius: 16,
                                        offset: const Offset(0, 8),
                                      ),
                                    ],
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        content.title,
                                        style: const TextStyle(
                                          fontSize: 22,
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.textDark,
                                        ),
                                      ),
                                      if ((content.summary ?? '')
                                          .isNotEmpty) ...[
                                        const SizedBox(height: 12),
                                        Text(
                                          content.summary!,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            color: AppColors.textMedium,
                                            height: 1.5,
                                          ),
                                        ),
                                      ],
                                      const SizedBox(height: 16),
                                      _BarraProgresso(
                                        progresso: _audioProgress,
                                        enabled:
                                            content.displayAudio != null &&
                                            _audioDuration > Duration.zero,
                                        onChanged: _previewAudioSeek,
                                        onChangeEnd: _seekAudioToFraction,
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            _formatMediaDuration(
                                              _audioPosition,
                                            ),
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.textLight,
                                            ),
                                          ),
                                          Text(
                                            content.displayAudio == null ||
                                                    _audioDuration <=
                                                        Duration.zero
                                                ? 'audio indisponivel'
                                                : _formatMediaDuration(
                                                    _audioDuration,
                                                  ),
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.textLight,
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (_audioLoadError) ...[
                                        const SizedBox(height: 10),
                                        _AudioErrorBanner(onRetry: _retryAudio),
                                      ],
                                      const SizedBox(height: 20),
                                      _Controlos(
                                        isPlaying: _isPlaying,
                                        audioAvailable:
                                            content.displayAudio != null,
                                        canSeek: _audioDuration > Duration.zero,
                                        onPlayPause: _togglePlayPause,
                                        onSkipBackward: () => _skipAudio(
                                          const Duration(seconds: -10),
                                        ),
                                        onSkipForward: () => _skipAudio(
                                          const Duration(seconds: 10),
                                        ),
                                      ),
                                      const Divider(
                                        color: AppColors.line,
                                        height: 28,
                                      ),
                                      _PodcastActionBar(
                                        content: content,
                                        isLiking: _isTogglingReaction,
                                        isSaved: _isSaved,
                                        isSaving: _isSaving || _isCheckingSaved,
                                        isSharing: _isSharing,
                                        onLike: _toggleLikePodcast,
                                        onShare: _sharePodcast,
                                        onSave: _toggleSavePodcast,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 28),
                                _RelatedPodcastsSection(
                                  items: _relatedPodcasts,
                                  onOpen: _openRelatedPodcast,
                                ),
                                const SizedBox(height: 28),
                                InlineCommentsSection(
                                  content: content,
                                  expanded: true,
                                  alwaysExpanded: true,
                                  comments: _allComments
                                      .take(_visibleCommentsCount)
                                      .toList(),
                                  hasMoreComments:
                                      _visibleCommentsCount <
                                      _allComments.length,
                                  isLoading: _isLoadingComments,
                                  isSending: _isSendingComment,
                                  error: _commentsError,
                                  controller: _commentController,
                                  replyController: _replyController,
                                  onToggle: () {},
                                  onSend: _sendComment,
                                  onRetry: _loadComments,
                                  onLoadMore: _revealMoreComments,
                                  onToggleReply: _toggleReplyComposer,
                                  onSendReply: (commentId) =>
                                      unawaited(_sendReply(commentId)),
                                  replyingToCommentId: _replyingToCommentId,
                                  isSendingReply: _isSendingReply,
                                ),
                                const SizedBox(height: 32),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _bindAudioPlayer() {
    _positionSubscription = _audioPlayer.onPositionChanged.listen((position) {
      if (!mounted || _isAudioSeeking) return;
      setState(() => _audioPosition = position);
    });
    _durationSubscription = _audioPlayer.onDurationChanged.listen((duration) {
      if (!mounted) return;
      setState(() => _audioDuration = duration);
    });
    _stateSubscription = _audioPlayer.onPlayerStateChanged.listen((state) {
      if (!mounted) return;
      setState(() => _isPlaying = state == PlayerState.playing);
    });
    _completeSubscription = _audioPlayer.onPlayerComplete.listen((_) {
      if (!mounted) return;
      setState(() {
        _isPlaying = false;
        _audioPosition = _audioDuration;
      });
      _guardarProgresso(1);
    });
  }

  Future<void> _resetAudioFor(String? url) async {
    if (_loadedAudioUrl == url) return;
    await _audioPlayer.stop();
    if (!mounted) return;
    setState(() {
      _loadedAudioUrl = null;
      _isPlaying = false;
      _audioLoadError = false;
      _audioPosition = Duration.zero;
      _audioDuration = Duration.zero;
    });
  }

  Future<void> _togglePlayPause() async {
    final url = _content?.displayAudio;
    if (url == null || url.trim().isEmpty) return;
    try {
      if (_isPlaying) {
        await _audioPlayer.pause();
        return;
      }
      if (_loadedAudioUrl != url) {
        await _audioPlayer.play(UrlSource(url));
        if (!mounted) return;
        _loadedAudioUrl = url;
      } else {
        await _audioPlayer.resume();
      }
      if (mounted) setState(() => _audioLoadError = false);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isPlaying = false;
        _audioLoadError = true;
      });
    }
  }

  Future<void> _retryAudio() async {
    await _audioPlayer.stop();
    if (!mounted) return;
    setState(() {
      _loadedAudioUrl = null;
      _audioLoadError = false;
      _audioPosition = Duration.zero;
    });
    await _togglePlayPause();
  }

  Future<void> _skipAudio(Duration offset) async {
    if (_audioDuration <= Duration.zero) return;
    final next = _audioPosition + offset;
    await _seekAudioTo(
      Duration(
        milliseconds: next.inMilliseconds
            .clamp(0, _audioDuration.inMilliseconds)
            .toInt(),
      ),
    );
  }

  void _previewAudioSeek(double value) {
    if (_audioDuration <= Duration.zero) return;
    setState(() {
      _isAudioSeeking = true;
      _audioPosition = Duration(
        milliseconds: (_audioDuration.inMilliseconds * value).round(),
      );
    });
  }

  Future<void> _seekAudioToFraction(double value) async {
    if (_audioDuration <= Duration.zero) return;
    final position = Duration(
      milliseconds: (_audioDuration.inMilliseconds * value).round(),
    );
    await _seekAudioTo(position);
    _guardarProgresso(value);
  }

  Future<void> _seekAudioTo(Duration position) async {
    try {
      await _audioPlayer.seek(position);
      if (!mounted) return;
      setState(() {
        _audioPosition = position;
        _isAudioSeeking = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isAudioSeeking = false);
    }
  }

  double get _audioProgress {
    if (_audioDuration <= Duration.zero) return 0;
    return (_audioPosition.inMilliseconds / _audioDuration.inMilliseconds)
        .clamp(0, 1)
        .toDouble();
  }

  void _guardarProgresso(double value) {
    final content = _content;
    if (content == null || content.isLocked) return;

    unawaited(_persistirProgresso(content.id, (value * 100).round()));
  }

  Future<void> _persistirProgresso(int contentId, int progressPercent) async {
    try {
      await _podcastService.updateProgress(
        contentId: contentId,
        progressPercent: progressPercent,
      );
    } catch (_) {
      // Mantém o player fluido mesmo se a ligação falhar temporariamente.
    }
  }
}

String _formatMediaDuration(Duration duration) {
  final totalSeconds = duration.inSeconds < 0 ? 0 : duration.inSeconds;
  final minutes = totalSeconds ~/ 60;
  final seconds = totalSeconds % 60;
  return '$minutes:${seconds.toString().padLeft(2, '0')}';
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
            'Podcast',
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

class _BarraProgresso extends StatelessWidget {
  final double progresso;
  final bool enabled;
  final ValueChanged<double> onChanged;
  final ValueChanged<double> onChangeEnd;

  const _BarraProgresso({
    required this.progresso,
    required this.enabled,
    required this.onChanged,
    required this.onChangeEnd,
  });

  @override
  Widget build(BuildContext context) {
    return SliderTheme(
      data: SliderTheme.of(context).copyWith(
        activeTrackColor: AppColors.primary,
        inactiveTrackColor: AppColors.line,
        thumbColor: AppColors.primary,
        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
        overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
        trackHeight: 3,
      ),
      child: Slider(
        value: progresso,
        onChanged: enabled ? onChanged : null,
        onChangeEnd: enabled ? onChangeEnd : null,
      ),
    );
  }
}

class _AudioErrorBanner extends StatelessWidget {
  final VoidCallback onRetry;

  const _AudioErrorBanner({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.soft,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.line),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.error_outline_rounded,
            color: AppColors.primary,
            size: 20,
          ),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              'Nao foi possivel carregar o audio.',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textMedium,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          TextButton(onPressed: onRetry, child: const Text('Tentar novamente')),
        ],
      ),
    );
  }
}

class _Controlos extends StatelessWidget {
  final bool isPlaying;
  final bool audioAvailable;
  final bool canSeek;
  final VoidCallback onPlayPause;
  final VoidCallback onSkipBackward;
  final VoidCallback onSkipForward;

  const _Controlos({
    required this.isPlaying,
    required this.audioAvailable,
    required this.canSeek,
    required this.onPlayPause,
    required this.onSkipBackward,
    required this.onSkipForward,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          onPressed: audioAvailable && canSeek ? onSkipBackward : null,
          icon: const Icon(Icons.replay_10_rounded),
          color: AppColors.textDark,
          disabledColor: AppColors.textLight,
          iconSize: 32,
        ),
        const SizedBox(width: 20),
        GestureDetector(
          onTap: audioAvailable ? onPlayPause : null,
          child: Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: audioAvailable ? AppColors.primary : AppColors.textLight,
              shape: BoxShape.circle,
            ),
            child: Icon(
              isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
              color: AppColors.cardBackground,
              size: 30,
            ),
          ),
        ),
        const SizedBox(width: 20),
        IconButton(
          onPressed: audioAvailable && canSeek ? onSkipForward : null,
          icon: const Icon(Icons.forward_10_rounded),
          color: AppColors.textDark,
          disabledColor: AppColors.textLight,
          iconSize: 32,
        ),
      ],
    );
  }
}

class _PodcastActionBar extends StatelessWidget {
  final Content content;
  final bool isLiking;
  final bool isSaved;
  final bool isSaving;
  final bool isSharing;
  final VoidCallback onLike;
  final VoidCallback onShare;
  final VoidCallback onSave;

  const _PodcastActionBar({
    required this.content,
    required this.isLiking,
    required this.isSaved,
    required this.isSaving,
    required this.isSharing,
    required this.onLike,
    required this.onShare,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _PodcastActionButton(
            icon: content.likedByMe
                ? Icons.favorite_rounded
                : Icons.favorite_border_rounded,
            label: 'Gostar',
            value: '${content.reactionsCount}',
            active: content.likedByMe,
            busy: isLiking,
            onTap: content.isLocked ? null : onLike,
          ),
        ),
        Expanded(
          child: _PodcastActionButton(
            icon: Icons.share_outlined,
            label: 'Partilhar',
            busy: isSharing,
            onTap: content.isLocked ? null : onShare,
          ),
        ),
        Expanded(
          child: _PodcastActionButton(
            icon: isSaved
                ? Icons.bookmark_rounded
                : Icons.bookmark_border_rounded,
            label: 'Guardar',
            active: isSaved,
            busy: isSaving,
            onTap: content.isLocked ? null : onSave,
          ),
        ),
      ],
    );
  }
}

class _PodcastActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? value;
  final bool active;
  final bool busy;
  final VoidCallback? onTap;

  const _PodcastActionButton({
    required this.icon,
    required this.label,
    this.value,
    this.active = false,
    this.busy = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.primary : AppColors.textMedium;

    return InkWell(
      onTap: busy ? null : onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              busy ? Icons.hourglass_empty_rounded : icon,
              size: 22,
              color: busy ? AppColors.textLight : color,
            ),
            const SizedBox(height: 5),
            Text(
              value == null ? label : '$label $value',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: busy ? AppColors.textLight : color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RelatedPodcastsSection extends StatelessWidget {
  final List<Content> items;
  final ValueChanged<Content> onOpen;

  const _RelatedPodcastsSection({required this.items, required this.onOpen});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Relacionados',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AppColors.textDark,
          ),
        ),
        const SizedBox(height: 14),
        if (items.isEmpty)
          const EmptyState(
            message: 'Ainda nao ha podcasts relacionados.',
            icon: Icons.podcasts_outlined,
          )
        else
          ...items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: AppContentCard(
                content: item,
                variant: ContentCardVariant.horizontal,
                showActions: false,
                onTap: () => onOpen(item),
              ),
            ),
          ),
      ],
    );
  }
}
