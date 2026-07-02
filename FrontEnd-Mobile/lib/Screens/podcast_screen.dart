import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../models/taxonomy.dart';
import '../services/content_service.dart';
import '../services/taxonomy_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import '../widgets/content_card.dart';
import '../widgets/filter_chip_bar.dart';
import 'podcast_selecionado_screen.dart';

class PodcastScreen extends StatefulWidget {
  const PodcastScreen({super.key});

  @override
  State<PodcastScreen> createState() => _PodcastScreenState();
}

class _PodcastScreenState extends State<PodcastScreen> {
  final _podcastService = PodcastService();
  final _taxonomyService = TaxonomyService();
  int? _categoriaSelecionadaId;
  bool _isLoading = true;
  String? _error;
  List<Content> _podcasts = [];
  List<Category> _categorias = [];

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
      final results = await Future.wait<Object>([
        _podcastService.getPodcasts(categoryId: _categoriaSelecionadaId),
        _taxonomyService.getCategories(),
      ]);
      if (!mounted) return;
      setState(() {
        _podcasts = (results[0] as dynamic).data as List<Content>;
        _categorias = results[1] as List<Category>;
      });
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar podcasts.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<FilterChipOption> get _categoriaOptions {
    return [
      const FilterChipOption(id: 'all', label: 'Todos'),
      ..._categorias.map(
        (categoria) =>
            FilterChipOption(id: '${categoria.id}', label: categoria.name),
      ),
    ];
  }

  Future<void> _selecionarCategoria(String id) async {
    final selectedId = id == 'all' ? null : int.tryParse(id);
    setState(() => _categoriaSelecionadaId = selectedId);
    await _load();
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
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            const SliverToBoxAdapter(child: SizedBox(height: 16)),
            SliverToBoxAdapter(
              child: AppFilterChipBar(
                options: _categoriaOptions,
                selectedId: _categoriaSelecionadaId?.toString() ?? 'all',
                onSelected: _selecionarCategoria,
                allowDeselect: true,
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
            else if (_podcasts.isEmpty)
              const SliverFillRemaining(
                child: EmptyState(
                  message: 'Ainda não há podcasts disponíveis.',
                  icon: Icons.podcasts_outlined,
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final item = _podcasts[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: AppContentCard(
                        content: item,
                        variant: ContentCardVariant.media,
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
                  }, childCount: _podcasts.length),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }
}
