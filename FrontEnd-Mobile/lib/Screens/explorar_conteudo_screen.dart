import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../models/taxonomy.dart';
import '../services/content_service.dart';
import '../services/taxonomy_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
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
  int _filtroSelecionado = 0;
  List<ContentType> _tipos = [];
  List<Content> _itens = [];

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
      if (!mounted) return;
      setState(() {
        _tipos = tipos;
        _itens = conteudos.data;
      });
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar conteudos.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _selecionarFiltro(int index) async {
    setState(() {
      _filtroSelecionado = index;
      _isLoading = true;
      _error = null;
    });
    try {
      final slug = index == 0 ? null : _tipos[index - 1].slug;
      final response = await _contentService.getContents(type: slug);
      if (!mounted) return;
      setState(() => _itens = response.data);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao filtrar conteudos.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<String> get _filtros => ['Todos', ..._tipos.map((tipo) => tipo.name)];

  @override
  Widget build(BuildContext context) {
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
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(top: 16, bottom: 4),
                child: _FiltrosRow(
                  filtros: _filtros,
                  selecionado: _filtroSelecionado,
                  onSelect: _selecionarFiltro,
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
                            'Nenhum conteudo encontrado para "${_filtros[_filtroSelecionado]}".',
                      )
                    else
                      ..._itens.map((item) => _TrendingItem(content: item)),
                    const SizedBox(height: 28),
                    if (_itens.length > 1) ...[
                      const Text(
                        'Recomendado para ti',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 14),
                      _RecomendadoCard(content: _itens[1]),
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

class _FiltrosRow extends StatelessWidget {
  final List<String> filtros;
  final int selecionado;
  final ValueChanged<int> onSelect;

  const _FiltrosRow({
    required this.filtros,
    required this.selecionado,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: filtros.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final ativo = i == selecionado;
          return GestureDetector(
            onTap: () => onSelect(i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: ativo ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: ativo ? AppColors.primary : const Color(0xFFD8C1C4),
                ),
              ),
              child: Text(
                filtros[i],
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: ativo ? Colors.white : AppColors.textMedium,
                ),
              ),
            ),
          );
        },
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

class _TrendingItem extends StatelessWidget {
  final Content content;

  const _TrendingItem({required this.content});

  @override
  Widget build(BuildContext context) {
    final isPodcast = content.isPodcast;
    return Column(
      children: [
        GestureDetector(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => isPodcast
                  ? PodcastSelecionadoScreen(contentId: content.id)
                  : ConteudoScreen(contentId: content.id),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: isPodcast && content.displayImage == null
                      ? Container(
                          width: 52,
                          height: 52,
                          color: AppColors.primary,
                          child: const Icon(
                            Icons.mic_rounded,
                            color: Colors.white,
                          ),
                        )
                      : AppNetworkImage(
                          url: content.displayImage,
                          width: 52,
                          height: 52,
                        ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${content.contentType?.name.toUpperCase() ?? 'CONTEUDO'} - ${readTime(content.content)}',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isPodcast
                              ? AppColors.primary
                              : AppColors.textLight,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        content.title,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textDark,
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  isPodcast
                      ? Icons.play_circle_outline_rounded
                      : Icons.chevron_right_rounded,
                  color: AppColors.textLight,
                  size: 22,
                ),
              ],
            ),
          ),
        ),
        const Divider(color: Color(0xFFEEE8E9), height: 1),
      ],
    );
  }
}

class _RecomendadoCard extends StatelessWidget {
  final Content content;

  const _RecomendadoCard({required this.content});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ConteudoScreen(contentId: content.id),
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFEEE8E9)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: AppNetworkImage(
                url: content.displayImage,
                width: double.infinity,
                height: 160,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    content.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                  if ((content.summary ?? '').isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      content.summary!,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textMedium,
                        height: 1.4,
                      ),
                    ),
                  ],
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Icon(
                        Icons.remove_red_eye_outlined,
                        color: AppColors.textLight,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${content.viewsCount} vistas',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textMedium,
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Icon(
                        Icons.access_time_rounded,
                        color: AppColors.textLight,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        readTime(content.content),
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textMedium,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
