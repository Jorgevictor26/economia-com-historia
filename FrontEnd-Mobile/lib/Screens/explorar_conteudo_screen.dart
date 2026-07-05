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
  List<Content> _emAlta = [];
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
      final data = await _loadContentData(_filtroSelecionado);
      if (!mounted) return;
      setState(() {
        _tipos = tipos;
        _itens = data.items;
        _emAlta = data.trending;
        _sugestoes = data.suggestions;
      });
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar conteudos.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<_ContentData> _loadContentData(String filterId) async {
    final typeId = filterId == 'all' ? null : int.tryParse(filterId);
    final conteudos = await _contentService.getContents(
      contentTypeId: typeId,
      perPage: 30,
    );
    final emAlta = await _contentService.getTrendingContents(
      contentTypeId: typeId,
      perPage: 12,
    );
    final sugestoes = await _contentService.getSuggestions(limit: 12);

    return _ContentData(
      items: conteudos.data,
      trending: emAlta.data,
      suggestions: sugestoes,
    );
  }

  Future<void> _selecionarFiltro(String id) async {
    setState(() {
      _filtroSelecionado = id;
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await _loadContentData(id);
      if (!mounted) return;
      setState(() {
        _itens = data.items;
        _emAlta = data.trending;
        _sugestoes = data.suggestions;
      });
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao filtrar conteudos.');
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

  List<_ContentSectionData> get _sections {
    final trending = _dedupe(_emAlta.where(_matchesSelectedFilter));
    final recommendationSource = _dedupe([
      ..._sugestoes.where(_matchesSelectedFilter),
      ..._itens.where(_matchesSelectedFilter),
    ]);
    final trendingIds = trending.map((content) => content.id).toSet();
    var recommended = recommendationSource
        .where((content) => !trendingIds.contains(content.id))
        .take(10)
        .toList();

    if (recommended.isEmpty) {
      recommended = recommendationSource.take(10).toList();
    }

    final sections = <_ContentSectionData>[
      if (trending.isNotEmpty)
        _ContentSectionData(
          title: _filtroSelecionado == 'all'
              ? 'Em Alta'
              : '$_filtroLabel em alta',
          items: trending,
        ),
      if (recommended.isNotEmpty)
        _ContentSectionData(
          title: _filtroSelecionado == 'all'
              ? 'Recomendado para ti'
              : '$_filtroLabel recomendado',
          items: recommended,
        ),
    ];

    final grouped = <String, List<Content>>{};
    for (final content in _itens.where(_matchesSelectedFilter)) {
      final title =
          content.category?.name ??
          content.contentType?.name ??
          'Outros conteudos';
      grouped.putIfAbsent(title, () => <Content>[]).add(content);
    }

    final entries = grouped.entries.toList()
      ..sort((a, b) => a.key.compareTo(b.key));
    for (final entry in entries) {
      sections.add(
        _ContentSectionData(title: entry.key, items: _dedupe(entry.value)),
      );
    }

    return sections;
  }

  bool _matchesSelectedFilter(Content content) {
    if (_filtroSelecionado == 'all') return true;
    final typeId = int.tryParse(_filtroSelecionado);
    return typeId != null && content.contentTypeId == typeId;
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
    final sections = _sections;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        titulo: 'Explorar Conteudo',
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
                child: LoadingState(message: 'A carregar conteudos...'),
              )
            else if (_error != null)
              SliverFillRemaining(
                child: ErrorState(message: _error!, onRetry: _loadInitial),
              )
            else if (sections.isEmpty)
              SliverFillRemaining(
                child: EmptyState(
                  message: 'Nenhum conteudo encontrado para "$_filtroLabel".',
                ),
              )
            else
              SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  final section = sections[index];
                  return _HorizontalContentSection(
                    section: section,
                    onOpen: _abrirConteudo,
                  );
                }, childCount: sections.length),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }
}

class _HorizontalContentSection extends StatelessWidget {
  final _ContentSectionData section;
  final ValueChanged<Content> onOpen;

  const _HorizontalContentSection({
    required this.section,
    required this.onOpen,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: _SectionHeader(
              titulo: section.title,
              acaoLabel: '${section.items.length} itens',
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 206,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: section.items.length,
              separatorBuilder: (_, _) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final item = section.items[index];
                return AppContentCard(
                  content: item,
                  variant: ContentCardVariant.compact,
                  width: 168,
                  onTap: () => onOpen(item),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String titulo;
  final String acaoLabel;

  const _SectionHeader({required this.titulo, required this.acaoLabel});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(
          child: Text(
            titulo,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Text(
          acaoLabel,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textMedium,
          ),
        ),
      ],
    );
  }
}

class _ContentData {
  final List<Content> items;
  final List<Content> trending;
  final List<Content> suggestions;

  const _ContentData({
    required this.items,
    required this.trending,
    required this.suggestions,
  });
}

class _ContentSectionData {
  final String title;
  final List<Content> items;

  const _ContentSectionData({required this.title, required this.items});
}

List<Content> _dedupe(Iterable<Content> contents) {
  final byId = <int, Content>{};
  for (final content in contents) {
    byId.putIfAbsent(content.id, () => content);
  }
  return byId.values.toList();
}
