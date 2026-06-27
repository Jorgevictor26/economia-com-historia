import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../models/forum.dart';
import '../service/perfil_service.dart';
import '../services/content_service.dart';
import '../services/forum_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import 'conteudo_screen.dart';

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
  List<Forum> _forums = [];
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
      final results = await Future.wait([
        _contentService.getContents(),
        _forumService.getForums(),
      ]);
      if (!mounted) return;
      setState(() {
        _contents = (results[0] as dynamic).data as List<Content>;
        _forums = results[1] as List<Forum>;
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
        children: [ErrorState(message: _error!, onRetry: _load)],
      );
    }

    final conteudosVisiveis = _conteudosFiltrados;
    final destaque = conteudosVisiveis.isNotEmpty
        ? conteudosVisiveis.first
        : null;
    final recentes = conteudosVisiveis.take(4).toList();

    return CustomScrollView(
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
              _SectionHeader(
                title: 'Continuar a Estudar',
                actionLabel: 'Ver tudo',
                onAction: () {},
              ),
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
              _FiltrosRow(
                filtros: const ['Texto', 'Vídeo', 'Podcast', 'Jindungo'],
                selecionado: _filtroSelecionado,
                onSelect: _selecionarFiltro,
              ),
              const SizedBox(height: 28),
              const Text(
                'Destaques do Dia',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 14),
              if (destaque == null)
                const EmptyState(message: 'Ainda não há destaques disponíveis.')
              else
                _DestaqueCard(content: destaque),
              const SizedBox(height: 28),
              _SectionHeader(
                title: 'Comunidade',
                actionLabel: 'Ver foruns',
                onAction: () {
                  widget.onIrParaForum?.call();
                },
              ),
              const SizedBox(height: 14),
              if (_forums.isEmpty)
                const EmptyState(message: 'Ainda não há fóruns disponíveis.')
              else
                ..._forums.take(3).map((forum) => _ForumTile(forum: forum)),
              const SizedBox(height: 32),
            ]),
          ),
        ),
      ],
    );
  }

  List<Content> get _conteudosFiltrados {
    final filtro = _filtroSelecionado;
    if (filtro == null) return _contents;
    final filtroNormalizado = _normalizarFiltro(filtro);
    return _contents.where((content) {
      final slug = content.typeSlug.toLowerCase();
      final nome = (content.contentType?.name ?? '').toLowerCase();
      if (filtroNormalizado == 'podcast') return content.isPodcast;
      if (filtroNormalizado == 'jindungo') return content.isJindungo;
      return slug == filtroNormalizado || nome == filtroNormalizado;
    }).toList();
  }

  void _selecionarFiltro(String filtro) {
    setState(() {
      _filtroSelecionado = _filtroSelecionado == filtro ? null : filtro;
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
        Text(
          perfil.isAuthenticated
              ? 'A tua jornada intelectual continua hoje.'
              : 'Podes explorar conteúdos publicos sem conta.',
          style: const TextStyle(fontSize: 13.5, color: AppColors.textMedium),
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
    final perfil = context.watch<PerfilService>();
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
              perfil.isAuthenticated
                  ? '$totalConteudos conteúdos e $totalForuns foruns disponiveis para ${perfil.role}.'
                  : '$totalConteudos conteúdos publicos disponiveis.',
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
  final String actionLabel;
  final VoidCallback onAction;

  const _SectionHeader({
    required this.title,
    required this.actionLabel,
    required this.onAction,
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
        GestureDetector(
          onTap: onAction,
          child: Row(
            children: [
              Text(
                actionLabel,
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
        itemBuilder: (context, index) => _ContentCard(content: contents[index]),
      ),
    );
  }
}

class _ContentCard extends StatelessWidget {
  final Content content;

  const _ContentCard({required this.content});

  @override
  Widget build(BuildContext context) {
    final cardWidth = (MediaQuery.of(context).size.width - 54) / 2;
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ConteudoScreen(contentId: content.id),
        ),
      ),
      child: SizedBox(
        width: cardWidth,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: AppNetworkImage(
                url: content.displayImage,
                width: double.infinity,
                height: 105,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              content.contentType?.name.toUpperCase() ?? 'CONTEUDO',
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              content.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.textDark,
                height: 1.35,
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
  final String? selecionado;
  final ValueChanged<String> onSelect;

  const _FiltrosRow({
    required this.filtros,
    required this.selecionado,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filtros
            .map(
              (filtro) => GestureDetector(
                onTap: () => onSelect(filtro),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 10),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: selecionado == filtro
                        ? AppColors.primary
                        : AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: selecionado == filtro
                          ? AppColors.primary
                          : AppColors.borderSoft,
                      width: 1.2,
                    ),
                  ),
                  child: Text(
                    filtro,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: selecionado == filtro
                          ? Colors.white
                          : AppColors.textMedium,
                    ),
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _DestaqueCard extends StatelessWidget {
  final Content content;

  const _DestaqueCard({required this.content});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFB5933A),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                (content.contentType?.name ?? 'Recomendado').toUpperCase(),
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              content.title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                height: 1.35,
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                const Icon(
                  Icons.access_time_rounded,
                  size: 14,
                  color: Colors.white70,
                ),
                const SizedBox(width: 4),
                Text(
                  readTime(content.content),
                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                ),
                const SizedBox(width: 16),
                const Icon(
                  Icons.remove_red_eye_outlined,
                  size: 14,
                  color: Colors.white70,
                ),
                const SizedBox(width: 4),
                Text(
                  '${content.viewsCount} vistas',
                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ConteudoScreen(contentId: content.id),
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Colors.white54, width: 1.2),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: const Text('Abrir Conteúdo'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ForumTile extends StatelessWidget {
  final Forum forum;

  const _ForumTile({required this.forum});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
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
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  forum.name,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textDark,
                  ),
                ),
              ),
              Text(
                timeAgo(forum.createdAt),
                style: const TextStyle(
                  fontSize: 11.5,
                  color: AppColors.textLight,
                ),
              ),
            ],
          ),
          if ((forum.description ?? '').isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              forum.description!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 13.5,
                color: AppColors.textMedium,
                height: 1.45,
              ),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(
                Icons.forum_outlined,
                size: 18,
                color: AppColors.textLight,
              ),
              const SizedBox(width: 6),
              Text(
                '${forum.topicsCount} topicos',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textLight,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(color: AppColors.borderSoft, thickness: 1, height: 1),
        ],
      ),
    );
  }
}
