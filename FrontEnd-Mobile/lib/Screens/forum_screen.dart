import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/forum.dart';
import '../services/forum_service.dart';
import '../services/perfil_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import 'criar_sala_debate_screen.dart';
import 'sala_de_debate_screen.dart';

class ForumScreen extends StatefulWidget {
  const ForumScreen({super.key});

  @override
  State<ForumScreen> createState() => _ForumScreenState();
}

class _ForumScreenState extends State<ForumScreen> {
  final _service = ForumService();
  bool _isLoading = true;
  String? _error;
  List<Forum> _forums = [];

  List<Forum> get _featuredForums {
    final items = [..._forums];
    items.sort(
      (a, b) => _forumEngagementScore(b).compareTo(_forumEngagementScore(a)),
    );
    return items.take(3).toList();
  }

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
      final forums = await _service.getForums();
      if (!mounted) return;
      setState(() => _forums = forums);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar foruns.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final canCreate = context.watch<PerfilService>().isAuthenticated;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        titulo: 'Forum',
        mostrarFavoritos: true,
        mostrarPerfil: true,
        mostrarVoltar: false,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          if (!canCreate) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Inicia sessao para criar um forum.'),
                behavior: SnackBarBehavior.floating,
                backgroundColor: AppColors.primary,
              ),
            );
            return;
          }
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const CriarSalaDebateScreen()),
          );
          if (mounted) _load();
        },
        backgroundColor: AppColors.primary,
        child: const Icon(
          Icons.add_comment_outlined,
          color: AppColors.cardBackground,
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 24),
                  const _SectionHeader(),
                  const SizedBox(height: 14),
                  if (_isLoading)
                    const LoadingState(message: 'A carregar foruns...')
                  else if (_error != null)
                    ErrorState(message: _error!, onRetry: _load)
                  else if (_forums.isEmpty)
                    const EmptyState(message: 'Nenhum forum disponivel.')
                  else ...[
                    _FeaturedDebatesCarousel(forums: _featuredForums),
                    const SizedBox(height: 28),
                    const Text(
                      'Salas de Debate',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 14),
                    ..._forums.map((forum) => _SalaCard(forum: forum)),
                  ],
                  const SizedBox(height: 80),
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
  const _SectionHeader();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        SizedBox(
          width: 4,
          height: 22,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: AppColors.secondary,
              borderRadius: BorderRadius.all(Radius.circular(2)),
            ),
          ),
        ),
        SizedBox(width: 10),
        Text(
          'Debates em Destaque',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }
}

class _FeaturedDebatesCarousel extends StatelessWidget {
  final List<Forum> forums;

  const _FeaturedDebatesCarousel({required this.forums});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 190,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: forums.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          return _DebateDestaque(forum: forums[index]);
        },
      ),
    );
  }
}

class _DebateDestaque extends StatelessWidget {
  final Forum forum;

  const _DebateDestaque({required this.forum});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => SalaDeDebateScreen(forum: forum)),
      ),
      child: Container(
        width: MediaQuery.of(context).size.width * 0.78,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.16),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _ForumInitialsAvatar(
                  label: initials(forum.name),
                  backgroundColor: AppColors.cardBackground,
                  foregroundColor: AppColors.primary,
                  size: 46,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _ForumBadge(label: _forumCategory(forum), inverted: true),
                      _ForumBadge(
                        label: _visibilityLabel(forum.visibility),
                        inverted: true,
                        dark: forum.visibility?.toLowerCase() == 'private',
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              forum.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w900,
                color: AppColors.cardBackground,
                height: 1.15,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _forumDescription(forum),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                color: AppColors.cardBackground.withValues(alpha: 0.72),
                height: 1.35,
              ),
            ),
            const Spacer(),
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: [
                _ForumStat(
                  icon: Icons.forum_outlined,
                  label: '${_forumTopicsCount(forum)} debates',
                  inverted: true,
                ),
                _ForumStat(
                  icon: Icons.chat_bubble_outline_rounded,
                  label: '${forum.repliesCount} respostas',
                  inverted: true,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SalaCard extends StatelessWidget {
  final Forum forum;

  const _SalaCard({required this.forum});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => SalaDeDebateScreen(forum: forum)),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.line),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink.withValues(alpha: 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _ForumInitialsAvatar(label: initials(forum.name)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          _ForumBadge(label: _forumCategory(forum)),
                          _ForumBadge(
                            label: _visibilityLabel(forum.visibility),
                            dark: forum.visibility?.toLowerCase() == 'private',
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        forum.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                          height: 1.15,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _forumDescription(forum),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12.5,
                          color: AppColors.textMedium,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.textLight,
                ),
              ],
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 14,
              runSpacing: 8,
              children: [
                _ForumStat(
                  icon: Icons.groups_rounded,
                  label: '${forum.membersCount} membros',
                ),
                _ForumStat(
                  icon: Icons.forum_outlined,
                  label: '${_forumTopicsCount(forum)} debates',
                ),
                _ForumStat(
                  icon: Icons.link_rounded,
                  label: '${_forumContentCount(forum)} conteudos',
                ),
                if (timeAgo(forum.createdAt).isNotEmpty)
                  _ForumStat(
                    icon: Icons.access_time_rounded,
                    label: timeAgo(forum.createdAt),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ForumInitialsAvatar extends StatelessWidget {
  final String label;
  final double size;
  final Color backgroundColor;
  final Color foregroundColor;

  const _ForumInitialsAvatar({
    required this.label,
    this.size = 48,
    this.backgroundColor = AppColors.blush,
    this.foregroundColor = AppColors.primary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.clip,
        style: TextStyle(
          fontSize: size <= 46 ? 14 : 15,
          fontWeight: FontWeight.w900,
          color: foregroundColor,
        ),
      ),
    );
  }
}

class _ForumBadge extends StatelessWidget {
  final String label;
  final bool inverted;
  final bool dark;

  const _ForumBadge({
    required this.label,
    this.inverted = false,
    this.dark = false,
  });

  @override
  Widget build(BuildContext context) {
    final backgroundColor = dark
        ? AppColors.textDark
        : inverted
        ? AppColors.cardBackground.withValues(alpha: 0.14)
        : AppColors.blush;
    final textColor = dark
        ? AppColors.cardBackground
        : inverted
        ? AppColors.cardBackground
        : AppColors.primary;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(999),
        border: inverted
            ? Border.all(
                color: AppColors.cardBackground.withValues(alpha: 0.12),
              )
            : null,
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: textColor,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}

class _ForumStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool inverted;

  const _ForumStat({
    required this.icon,
    required this.label,
    this.inverted = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = inverted
        ? AppColors.cardBackground.withValues(alpha: 0.72)
        : AppColors.textMedium;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 5),
        Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ],
    );
  }
}

int _forumEngagementScore(Forum forum) {
  return (forum.repliesCount * 3) +
      (_forumTopicsCount(forum) * 2) +
      forum.membersCount +
      _forumContentCount(forum);
}

int _forumTopicsCount(Forum forum) {
  return forum.topicsCount > 0 ? forum.topicsCount : forum.topics.length;
}

int _forumContentCount(Forum forum) {
  return forum.contentsCount > 0 ? forum.contentsCount : forum.contents.length;
}

String _forumCategory(Forum forum) {
  final value = forum.category?.trim();
  return value == null || value.isEmpty ? 'Forum' : value;
}

String _forumDescription(Forum forum) {
  final value = (forum.description ?? forum.rules ?? '').trim();
  return value.isEmpty ? 'Sem descricao.' : value;
}

String _visibilityLabel(String? value) {
  switch ((value ?? 'public').toLowerCase()) {
    case 'private':
      return 'Privado';
    case 'public':
      return 'Publico';
    default:
      return value ?? 'Publico';
  }
}
