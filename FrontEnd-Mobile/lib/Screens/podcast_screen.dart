import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../services/content_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import 'podcast_selecionado_screen.dart';

class PodcastScreen extends StatefulWidget {
  const PodcastScreen({super.key});

  @override
  State<PodcastScreen> createState() => _PodcastScreenState();
}

class _PodcastScreenState extends State<PodcastScreen> {
  final _podcastService = PodcastService();
  String? _categoriaSelecionada;
  bool _isLoading = true;
  String? _error;
  List<Content> _podcasts = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final response = await _podcastService.getPodcasts();
      if (!mounted) return;
      setState(() => _podcasts = response.data);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar podcasts.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<String> get _categorias {
    final names =
        _podcasts
            .map((podcast) => podcast.category?.name)
            .whereType<String>()
            .where((name) => name.trim().isNotEmpty)
            .toSet()
            .toList()
          ..sort();
    return ['Todos', ...names];
  }

  List<Content> get _podcastsFiltrados {
    final categoria = _categoriaSelecionada;
    if (categoria == null || categoria == 'Todos') return _podcasts;
    return _podcasts
        .where((podcast) => podcast.category?.name == categoria)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        titulo: 'Podcast',
        mostrarFavoritos: true,
        mostrarNotificacoes: true,
        mostrarPesquisa: true,
        mostrarPerfil: true,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: CustomScrollView(
          slivers: [
            const SliverToBoxAdapter(child: SizedBox(height: 16)),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 44,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _categorias.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 8),
                  itemBuilder: (_, index) {
                    final categoria = _categorias[index];
                    final selecionado =
                        (categoria == 'Todos' &&
                            _categoriaSelecionada == null) ||
                        _categoriaSelecionada == categoria;

                    return InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () {
                        setState(() {
                          _categoriaSelecionada =
                              categoria == 'Todos' || selecionado
                              ? null
                              : categoria;
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: selecionado
                              ? AppColors.primary
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: selecionado
                                ? AppColors.primary
                                : const Color(0xFFD8C1C4),
                          ),
                        ),
                        child: Center(
                          child: Text(
                            categoria,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: selecionado
                                  ? Colors.white
                                  : AppColors.textMedium,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 20)),
            if (_isLoading)
              const SliverFillRemaining(
                child: LoadingState(message: 'A carregar podcasts...'),
              )
            else if (_error != null)
              SliverFillRemaining(
                child: ErrorState(message: _error!, onRetry: _load),
              )
            else if (_podcastsFiltrados.isEmpty)
              const SliverFillRemaining(
                child: EmptyState(
                  message: 'Ainda não há podcasts disponíveis.',
                  icon: Icons.podcasts_outlined,
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(
                  horizontal: PodcastLayout.pagePadding,
                ),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final item = _podcastsFiltrados[index];
                    return Padding(
                      padding: const EdgeInsets.only(
                        bottom: PodcastLayout.cardSpacing,
                      ),
                      child: _PodcastCard(
                        content: item,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => PodcastSelecionadoScreen(
                              contentId: item.id,
                              initialContent: item,
                            ),
                          ),
                        ),
                      ),
                    );
                  }, childCount: _podcastsFiltrados.length),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }
}

class PodcastLayout {
  static const double pagePadding = 16;
  static const double cardRadius = 12;
  static const double cardHeight = 220;
  static const double cardSpacing = 16;
}

class _PodcastCard extends StatelessWidget {
  final Content content;
  final VoidCallback onTap;

  const _PodcastCard({required this.content, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(PodcastLayout.cardRadius),
        onTap: onTap,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(PodcastLayout.cardRadius),
          child: SizedBox(
            height: PodcastLayout.cardHeight,
            child: Stack(
              fit: StackFit.expand,
              children: [
                AppNetworkImage(
                  url: content.displayImage,
                  fit: BoxFit.cover,
                  fallbackIcon: Icons.podcasts_rounded,
                ),
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withValues(alpha: .65),
                      ],
                      stops: const [0.45, 1],
                    ),
                  ),
                ),
                Positioned(
                  left: 16,
                  right: 70,
                  bottom: 16,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        content.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              content.author?.name ?? 'Podcast EH',
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Icon(
                            Icons.access_time_rounded,
                            size: 14,
                            color: Colors.white70,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            readTime(content.content ?? content.summary),
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Positioned(
                  right: 16,
                  bottom: 16,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: .95),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.play_arrow_rounded,
                      color: AppColors.primary,
                      size: 24,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
