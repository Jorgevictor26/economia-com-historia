import 'dart:async';

import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../services/content_service.dart';
import '../theme/app_colors.dart';

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
  final _podcastService = PodcastService();
  bool _isPlaying = false;
  double _progresso = 0;
  bool _isLoading = true;
  String? _error;
  Content? _content;
  List<Content> _maisPodcasts = [];

  @override
  void initState() {
    super.initState();
    _content = widget.initialContent;
    _load();
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
      final more = await _podcastService.getPodcasts();
      if (!mounted) return;
      setState(() {
        _content = podcast;
        _maisPodcasts = more.data
            .where((item) => item.id != podcast.id)
            .take(3)
            .toList();
      });
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar podcast.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
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
                          _CapaPlayer(content: content),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 16),
                                Text(
                                  content.title,
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textDark,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  content.author?.name.toUpperCase() ??
                                      content.contentType?.name.toUpperCase() ??
                                      'PODCAST',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                    letterSpacing: 0.6,
                                  ),
                                ),
                                if ((content.summary ?? '').isNotEmpty) ...[
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
                                  progresso: _progresso,
                                  onChanged: (v) =>
                                      setState(() => _progresso = v),
                                  onChangeEnd: _guardarProgresso,
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text(
                                      '00:00',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textLight,
                                      ),
                                    ),
                                    Text(
                                      content.displayAudio == null
                                          ? 'áudio indisponível'
                                          : readTime(content.content),
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textLight,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 20),
                                _Controlos(
                                  isPlaying: _isPlaying,
                                  audioAvailable: content.displayAudio != null,
                                  onPlayPause: () =>
                                      setState(() => _isPlaying = !_isPlaying),
                                ),
                                const SizedBox(height: 28),
                                const Text(
                                  'Mais Podcasts',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textDark,
                                  ),
                                ),
                                const SizedBox(height: 14),
                                if (_maisPodcasts.isEmpty)
                                  const EmptyState(
                                    message:
                                        'Ainda não há outros podcasts disponíveis.',
                                    icon: Icons.podcasts_outlined,
                                  )
                                else
                                  ..._maisPodcasts.map(
                                    (podcast) => _MiniPodcastTile(
                                      item: podcast,
                                      onTap: () => Navigator.pushReplacement(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) =>
                                              PodcastSelecionadoScreen(
                                                contentId: podcast.id,
                                                initialContent: podcast,
                                              ),
                                        ),
                                      ),
                                    ),
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

class _CapaPlayer extends StatelessWidget {
  final Content content;

  const _CapaPlayer({required this.content});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          height: 300,
          width: double.infinity,
          child: AppNetworkImage(
            url: content.displayImage,
            fit: BoxFit.cover,
            fallbackIcon: Icons.podcasts_rounded,
          ),
        ),
      ),
    );
  }
}

class _BarraProgresso extends StatelessWidget {
  final double progresso;
  final ValueChanged<double> onChanged;
  final ValueChanged<double> onChangeEnd;

  const _BarraProgresso({
    required this.progresso,
    required this.onChanged,
    required this.onChangeEnd,
  });

  @override
  Widget build(BuildContext context) {
    return SliderTheme(
      data: SliderTheme.of(context).copyWith(
        activeTrackColor: AppColors.primary,
        inactiveTrackColor: const Color(0xFFEEE8E9),
        thumbColor: AppColors.primary,
        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
        overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
        trackHeight: 3,
      ),
      child: Slider(
        value: progresso,
        onChanged: onChanged,
        onChangeEnd: onChangeEnd,
      ),
    );
  }
}

class _Controlos extends StatelessWidget {
  final bool isPlaying;
  final bool audioAvailable;
  final VoidCallback onPlayPause;

  const _Controlos({
    required this.isPlaying,
    required this.audioAvailable,
    required this.onPlayPause,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(
          Icons.skip_previous_rounded,
          color: AppColors.textDark,
          size: 32,
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
              color: Colors.white,
              size: 30,
            ),
          ),
        ),
        const SizedBox(width: 20),
        const Icon(
          Icons.skip_next_rounded,
          color: AppColors.textDark,
          size: 32,
        ),
      ],
    );
  }
}

class _MiniPodcastTile extends StatelessWidget {
  final Content item;
  final VoidCallback onTap;

  const _MiniPodcastTile({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: AppNetworkImage(
                url: item.displayImage,
                width: 52,
                height: 52,
                fallbackIcon: Icons.podcasts_rounded,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '${item.author?.name ?? 'Podcast EH'} - ${readTime(item.content)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textMedium,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFD8C1C4)),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.play_arrow_rounded,
                color: AppColors.primary,
                size: 18,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
