import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';

class PodcastSelecionadoScreen extends StatefulWidget {
  const PodcastSelecionadoScreen({super.key});

  @override
  State<PodcastSelecionadoScreen> createState() =>
      _PodcastSelecionadoScreenState();
}

class _PodcastSelecionadoScreenState extends State<PodcastSelecionadoScreen> {
  bool _isPlaying = false;
  double _progresso = 12 / 46.33;

  static const _maisPodcasts = [
    _MiniPodcast(
      titulo: 'Economia sem Makas',
      autor: 'Helena Panzo',
      info: 'Hoje • 23 min',
      imagemAsset: 'assets/images/Microeconomia_Colonial.png',
    ),
    _MiniPodcast(
      titulo: 'Economia sem Makas',
      autor: 'Helena Panzo',
      info: 'Hoje • 23 min',
      imagemAsset: 'assets/images/Microeconomia_Colonial.png',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _AppBar(),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _CapaPlayer(),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 16),
                          const Text(
                            'As ruas do Lubango',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textDark,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'TEM A PALAVRA',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                              letterSpacing: 0.6,
                            ),
                          ),
                          const SizedBox(height: 16),
                          _BarraProgresso(
                            progresso: _progresso,
                            onChanged: (v) => setState(() => _progresso = v),
                          ),
                          const SizedBox(height: 6),
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '12:00',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textLight,
                                ),
                              ),
                              Text(
                                '-34:20',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textLight,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          _Controlos(
                            isPlaying: _isPlaying,
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
                          ..._maisPodcasts.map(
                            (p) => _MiniPodcastTile(item: p),
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
}

class _AppBar extends StatelessWidget {
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
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          height: 300,
          width: double.infinity,
          child: Image.asset(
            'assets/images/As_ruas_de_Lubango.png',
            fit: BoxFit.cover,
          ),
        ),
      ),
    );
  }
}

class _BarraProgresso extends StatelessWidget {
  final double progresso;
  final ValueChanged<double> onChanged;

  const _BarraProgresso({required this.progresso, required this.onChanged});

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
      child: Slider(value: progresso, onChanged: onChanged),
    );
  }
}

class _Controlos extends StatelessWidget {
  final bool isPlaying;
  final VoidCallback onPlayPause;

  const _Controlos({required this.isPlaying, required this.onPlayPause});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.shuffle_rounded, color: AppColors.textLight, size: 22),
        const SizedBox(width: 28),
        const Icon(
          Icons.skip_previous_rounded,
          color: AppColors.textDark,
          size: 32,
        ),
        const SizedBox(width: 20),
        GestureDetector(
          onTap: onPlayPause,
          child: Container(
            width: 56,
            height: 56,
            decoration: const BoxDecoration(
              color: AppColors.primary,
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
        const SizedBox(width: 28),
        const Icon(Icons.repeat_rounded, color: AppColors.textLight, size: 22),
      ],
    );
  }
}

class _MiniPodcast {
  final String titulo;
  final String autor;
  final String info;
  final String imagemAsset;

  const _MiniPodcast({
    required this.titulo,
    required this.autor,
    required this.info,
    required this.imagemAsset,
  });
}

class _MiniPodcastTile extends StatelessWidget {
  final _MiniPodcast item;

  const _MiniPodcastTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Image.asset(
              item.imagemAsset,
              width: 52,
              height: 52,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                width: 52,
                height: 52,
                color: const Color(0xFFEEE8E9),
                child: const Icon(
                  Icons.podcasts_rounded,
                  color: AppColors.textLight,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.titulo,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${item.autor} • ${item.info}',
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
    );
  }
}
