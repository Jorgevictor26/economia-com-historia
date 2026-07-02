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
import 'conteudo_screen.dart';
import 'podcast_selecionado_screen.dart';

class ExplorarConteudoScreen extends StatefulWidget {
  const ExplorarConteudoScreen({super.key});

  @override
  State<ExplorarConteudoScreen> createState() => _ExplorarConteudoScreenState();
}

class _ExplorarConteudoScreenState extends State<ExplorarConteudoScreen> {
  final _contentService = ContentService();
  final _taxonomyService = TaxonomyService();

  bool _isLoading = true;
  String? _error;
  String _filtroSelecionado = 'all';
  List<ContentType> _tipos = [];
  List<Content> _itens = [];
  List<Content> _sugestoes = [];

  @override
  void initState() {
    super.initState();
    _loadInitial();
  }

  Future<void> _loadInitial() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final tipos = await _taxonomyService.getContentTypes();
      final conteudos = await _contentService.getContents();
      final sugestoes = await _contentService.getSuggestions(limit: 3);
      if (!mounted) return;
      setState(() {
        _tipos = tipos;
        _itens = conteudos.data;
        _sugestoes = sugestoes;
      });
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar conteúdos.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _selecionarFiltro(String id) async {
    setState(() {
      _filtroSelecionado = id;
      _isLoading = true;
      _error = null;
    });
    try {
      final typeId = id == 'all' ? null : int.tryParse(id);
      final response = await _contentService.getContents(contentTypeId: typeId);
      if (!mounted) return;
      setState(() => _itens = response.data);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao filtrar conteúdos.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<FilterChipOption> get _filtros => [
    const FilterChipOption(id: 'all', label: 'Todos'),
    ..._tipos.map(
      (tipo) => FilterChipOption(id: '${tipo.id}', label: tipo.name),
    ),
  ];

  String get _filtroLabel {
    for (final option in _filtros) {
      if (option.id == _filtroSelecionado) return option.label;
    }
    return 'Todos';
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
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        titulo: 'Explorar Conteúdo',
        mostrarFavoritos: true,
        mostrarPerfil: true,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _loadInitial,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(top: 16, bottom: 4),
                child: AppFilterChipBar(
                  options: _filtros,
                  selectedId: _filtroSelecionado,
                  onSelected: _selecionarFiltro,
                ),
              ),
            ),
            if (_isLoading)
              const SliverFillRemaining(
                child: LoadingState(message: 'A carregar conteúdos...'),
              )
            else if (_error != null)
              SliverFillRemaining(
                child: ErrorState(message: _error!, onRetry: _loadInitial),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    const SizedBox(height: 24),
                    _SectionHeader(
                      titulo: 'Em Alta',
                      acaoLabel: '${_itens.length} itens',
                      onAcao: () {},
                    ),
                    const SizedBox(height: 12),
                    if (_itens.isEmpty)
                      EmptyState(
                        message:
                            'Nenhum conteúdo encontrado para "$_filtroLabel".',
                      )
                    else
                      ..._itens.map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: AppContentCard(
                            content: item,
                            variant: ContentCardVariant.horizontal,
                            onTap: () => _abrirConteudo(item),
                          ),
                        ),
                      ),
                    const SizedBox(height: 28),
                    if (_sugestoes.isNotEmpty || _itens.length > 1) ...[
                      const Text(
                        'Recomendado para ti',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 14),
                      AppContentCard(
                        content: _sugestoes.isNotEmpty
                            ? _sugestoes.first
                            : _itens[1],
                        onTap: () => _abrirConteudo(
                          _sugestoes.isNotEmpty ? _sugestoes.first : _itens[1],
                        ),
                      ),
                    ],
                    const SizedBox(height: 32),
                  ]),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String titulo;
  final String acaoLabel;
  final VoidCallback onAcao;

  const _SectionHeader({
    required this.titulo,
    required this.acaoLabel,
    required this.onAcao,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          titulo,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
        Text(
          acaoLabel,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }
}
