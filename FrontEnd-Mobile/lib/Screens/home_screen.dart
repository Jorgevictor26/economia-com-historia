import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../models/forum.dart';
import '../services/perfil_service.dart';
import '../services/content_service.dart';
import '../services/forum_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import '../widgets/content_card.dart';
import '../widgets/filter_chip_bar.dart';
import 'conteudo_screen.dart';
import 'sala_de_debate_screen.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback? onIrParaForum;

  const HomeScreen({super.key, this.onIrParaForum});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _contentService = ContentService();
  final _forumService = ForumService();

  bool _isLoading = true;
  String? _error;
  List<Content> _contents = [];
  List<ContentProgress> _progressos = [];
  List<Forum> _forums = [];
  Content? _featuredJindungo;
  String? _filtroSelecionado;

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
      final conteudos = await _contentService.getContents();
      final results = await Future.wait<Object?>([
        _loadProgressos(),
        _loadForums(),
        _loadFeaturedJindungo(),
      ]);
      if (!mounted) return;
      setState(() {
        _contents = conteudos.data;
        _progressos = results[0] as List<ContentProgress>;
        _forums = results[1] as List<Forum>;
        _featuredJindungo = results[2] as Content?;
      });
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar dados.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        titulo: 'Home',
        mostrarFavoritos: true,
        mostrarPerfil: true,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const LoadingState(message: 'A carregar conteúdos...');
    }
    if (_error != null) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [ErrorState(message: _error!, onRetry: _load)],
      );
    }

    final conteudosVisiveis = _conteudosFiltrados;
    final destaqueJindungo = _filtroSelecionado == 'Jindungo'
        ? _featuredJindungo
        : null;
    final destaques = [
      ?destaqueJindungo,
      ...conteudosVisiveis.where(
        (content) => content.id != destaqueJindungo?.id,
      ),
    ].take(6).toList();
    final progressoConteudos = _progressos
        .map((progress) => progress.content)
        .whereType<Content>()
        .where(_passaNoFiltroAtual)
        .toList();
    final recentes = progressoConteudos.isNotEmpty
        ? progressoConteudos
        : conteudosVisiveis.take(4).toList();

    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              const SizedBox(height: 20),
              const _GreetingSection(),
              const SizedBox(height: 20),
              _SessionCard(
                totalConteudos: _contents.length,
                totalForuns: _forums.length,
              ),
              const SizedBox(height: 28),
              const _SectionHeader(title: 'Continuar a Estudar'),
              const SizedBox(height: 14),
              if (recentes.isEmpty)
                const EmptyState(message: 'Ainda não há conteúdos disponíveis.')
              else
                _ContentsRow(contents: recentes),
              const SizedBox(height: 28),
              const Text(
                'Explorar Conteúdo',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 12),
              AppFilterChipBar(
                options: const [
                  FilterChipOption(id: 'all', label: 'Todos'),
                  FilterChipOption(id: 'Texto', label: 'Texto'),
                  FilterChipOption(id: 'Vídeo', label: 'Vídeo'),
                  FilterChipOption(id: 'Podcast', label: 'Podcast'),
                  FilterChipOption(id: 'Jindungo', label: 'Jindungo'),
                ],
                selectedId: _filtroSelecionado ?? 'all',
                onSelected: _selecionarFiltro,
                padding: EdgeInsets.zero,
                allowDeselect: true,
              ),
              const SizedBox(height: 28),
              const _SectionHeader(title: 'Em Destaque'),
              const SizedBox(height: 14),
              if (destaques.isEmpty)
                const EmptyState(message: 'Ainda não há destaques disponíveis.')
              else
                _ContentsRow(contents: destaques),
              const SizedBox(height: 28),
              _SectionHeader(
                title: 'Comunidade',
                actionLabel: 'Ver fóruns',
                onAction: () {
                  widget.onIrParaForum?.call();
                },
              ),
              const SizedBox(height: 14),
              if (_forums.isEmpty)
                const EmptyState(message: 'Ainda não há fóruns disponíveis.')
              else
                _ForumsRow(forums: _forums.take(6).toList()),
              const SizedBox(height: 32),
            ]),
          ),
        ),
      ],
    );
  }

  Future<Content?> _loadFeaturedJindungo() async {
    try {
      return await _contentService.getFeaturedJindungo();
    } on NotFoundException {
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<List<ContentProgress>> _loadProgressos() async {
    try {
      return await _contentService.getContentProgress(limit: 4);
    } on NotFoundException {
      return <ContentProgress>[];
    }
  }

  Future<List<Forum>> _loadForums() async {
    try {
      return await _forumService.getForums();
    } on NotFoundException {
      return <Forum>[];
    }
  }

  List<Content> get _conteudosFiltrados {
    final filtro = _filtroSelecionado;
    if (filtro == null) return _contents;
    return _contents.where((content) {
      return _passaNoFiltroAtual(content);
    }).toList();
  }

  bool _passaNoFiltroAtual(Content content) {
    final filtro = _filtroSelecionado;
    if (filtro == null) return true;
    final filtroNormalizado = _normalizarFiltro(filtro);
    final slug = content.typeSlug.toLowerCase();
    final nome = (content.contentType?.name ?? '').toLowerCase();
    if (filtroNormalizado == 'podcast') return content.isPodcast;
    if (filtroNormalizado == 'jindungo') return content.isJindungo;
    return slug == filtroNormalizado || nome == filtroNormalizado;
  }

  void _selecionarFiltro(String filtro) {
    setState(() {
      _filtroSelecionado = filtro == 'all' || _filtroSelecionado == filtro
          ? null
          : filtro;
    });
  }

  String _normalizarFiltro(String filtro) {
    return filtro
        .toLowerCase()
        .replaceAll('í', 'i')
        .replaceAll('é', 'e')
        .replaceAll('ê', 'e');
  }
}

class _GreetingSection extends StatelessWidget {
  const _GreetingSection();

  @override
  Widget build(BuildContext context) {
    final perfil = context.watch<PerfilService>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Olá, ${perfil.nome}',
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'A tua jornada intelectual continua hoje.',
          style: TextStyle(fontSize: 13.5, color: AppColors.textMedium),
        ),
      ],
    );
  }
}

class _SessionCard extends StatelessWidget {
  final int totalConteudos;
  final int totalForuns;

  const _SessionCard({required this.totalConteudos, required this.totalForuns});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderSoft, width: 1),
      ),
      child: Row(
        children: [
          const Icon(Icons.insights_rounded, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              '$totalConteudos conteúdos e $totalForuns fóruns disponíveis hoje.',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  const _SectionHeader({
    required this.title,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
        if (actionLabel != null && onAction != null)
          GestureDetector(
            onTap: onAction,
            child: Row(
              children: [
                Text(
                  actionLabel!,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(
                  Icons.arrow_forward_rounded,
                  size: 15,
                  color: AppColors.primary,
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _ContentsRow extends StatelessWidget {
  final List<Content> contents;

  const _ContentsRow({required this.contents});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 185,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        clipBehavior: Clip.none,
        itemCount: contents.length,
        separatorBuilder: (_, _) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final content = contents[index];
          final cardWidth = (MediaQuery.of(context).size.width - 54) / 2;
          return AppContentCard(
            content: content,
            variant: ContentCardVariant.compact,
            width: cardWidth,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ConteudoScreen(contentId: content.id),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ForumsRow extends StatelessWidget {
  final List<Forum> forums;

  const _ForumsRow({required this.forums});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 150,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        clipBehavior: Clip.none,
        itemCount: forums.length,
        separatorBuilder: (_, _) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final forum = forums[index];
          final width = (MediaQuery.of(context).size.width * 0.78)
              .clamp(260.0, 330.0)
              .toDouble();

          return _ForumTile(
            forum: forum,
            width: width,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => SalaDeDebateScreen(forum: forum),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ForumTile extends StatelessWidget {
  final Forum forum;
  final double width;
  final VoidCallback onTap;

  const _ForumTile({
    required this.forum,
    required this.width,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final description = forum.description?.trim() ?? '';

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        width: width,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.line),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink.withValues(alpha: 0.04),
              blurRadius: 12,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: AppColors.primary,
                  child: Text(
                    initials(forum.user?.name ?? forum.name),
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.cardBackground,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    forum.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textDark,
                    ),
                  ),
                ),
                const Icon(
                  Icons.chevron_right_rounded,
                  size: 20,
                  color: AppColors.primary,
                ),
              ],
            ),
            if (description.isNotEmpty) ...[
              const SizedBox(height: 9),
              Text(
                description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textMedium,
                  height: 1.35,
                ),
              ),
            ],
            const Spacer(),
            Row(
              children: [
                const Icon(
                  Icons.forum_outlined,
                  size: 17,
                  color: AppColors.textLight,
                ),
                const SizedBox(width: 6),
                Text(
                  '${forum.topicsCount} tópicos',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textLight,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Spacer(),
                Text(
                  timeAgo(forum.createdAt),
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppColors.textLight,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
