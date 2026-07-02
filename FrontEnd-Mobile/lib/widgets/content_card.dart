import 'package:flutter/material.dart';

import '../core/utils/formatters.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../theme/app_colors.dart';

enum ContentCardVariant { standard, compact, horizontal, media }

class AppContentCard extends StatelessWidget {
  final Content content;
  final ContentCardVariant variant;
  final VoidCallback? onTap;
  final VoidCallback? onRemove;
  final String? footerLabel;
  final double? width;
  final bool showActions;

  const AppContentCard({
    super.key,
    required this.content,
    this.variant = ContentCardVariant.standard,
    this.onTap,
    this.onRemove,
    this.footerLabel,
    this.width,
    this.showActions = true,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: switch (variant) {
        ContentCardVariant.compact => _CardShell(
          onTap: onTap,
          child: _CompactContent(content: content),
        ),
        ContentCardVariant.horizontal => _CardShell(
          onTap: onTap,
          child: _HorizontalContent(
            content: content,
            footerLabel: footerLabel,
            onRemove: onRemove,
          ),
        ),
        ContentCardVariant.media => _MediaContent(
          content: content,
          onTap: onTap,
        ),
        ContentCardVariant.standard => _CardShell(
          onTap: onTap,
          child: _StandardContent(
            content: content,
            footerLabel: footerLabel,
            showActions: showActions,
          ),
        ),
      },
    );
  }
}

class _CardShell extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;

  const _CardShell({required this.child, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.line),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.07),
                blurRadius: 24,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: child,
          ),
        ),
      ),
    );
  }
}

class _StandardContent extends StatelessWidget {
  final Content content;
  final String? footerLabel;
  final bool showActions;

  const _StandardContent({
    required this.content,
    required this.footerLabel,
    required this.showActions,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Cover(content: content, height: 160),
        Padding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _meta(content),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppColors.secondary,
                  letterSpacing: 0.4,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                content.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                  height: 1.22,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _excerpt(content),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textMedium,
                ),
              ),
            ],
          ),
        ),
        _Footer(
          content: content,
          footerLabel: footerLabel,
          showActions: showActions,
        ),
      ],
    );
  }
}

class _CompactContent extends StatelessWidget {
  final Content content;

  const _CompactContent({required this.content});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Cover(content: content, height: 102),
        Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _typeLabel(content).toUpperCase(),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: AppColors.secondary,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                content.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _HorizontalContent extends StatelessWidget {
  final Content content;
  final String? footerLabel;
  final VoidCallback? onRemove;

  const _HorizontalContent({
    required this.content,
    required this.footerLabel,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: SizedBox(
              width: 88,
              height: 88,
              child: _Cover(content: content, height: 88, compact: true),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${_typeLabel(content).toUpperCase()} - ${_meta(content)}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.secondary,
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  content.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    height: 1.28,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  footerLabel ?? _authorLabel(content),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMedium,
                  ),
                ),
              ],
            ),
          ),
          if (onRemove != null) ...[
            const SizedBox(width: 8),
            IconButton(
              tooltip: 'Remover',
              onPressed: onRemove,
              icon: const Icon(
                Icons.bookmark_remove_rounded,
                color: AppColors.primary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _MediaContent extends StatelessWidget {
  final Content content;
  final VoidCallback? onTap;

  const _MediaContent({required this.content, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: SizedBox(
            height: 220,
            child: Stack(
              fit: StackFit.expand,
              children: [
                _CoverImage(content: content),
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.04),
                        Colors.black.withValues(alpha: 0.72),
                      ],
                      stops: const [0.25, 1],
                    ),
                  ),
                ),
                Positioned(
                  left: 14,
                  right: 14,
                  top: 14,
                  child: _Badges(content: content),
                ),
                if (content.isJindungo || content.isLocked)
                  const Positioned(right: 14, top: 14, child: _LockMark()),
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
                          fontWeight: FontWeight.w800,
                          height: 1.18,
                        ),
                      ),
                      const SizedBox(height: 7),
                      Text(
                        '${_authorLabel(content)} - ${_meta(content)}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                const Positioned(right: 16, bottom: 16, child: _PlayMark()),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Cover extends StatelessWidget {
  final Content content;
  final double height;
  final bool compact;

  const _Cover({
    required this.content,
    required this.height,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          _CoverImage(content: content),
          if (!compact)
            Positioned(
              left: 12,
              right: content.isJindungo || content.isLocked ? 58 : 12,
              top: 12,
              child: _Badges(content: content),
            ),
          if (content.isLocked)
            Container(
              color: AppColors.primary.withValues(alpha: 0.16),
              child: const Center(child: _LockMark()),
            )
          else if (content.isJindungo)
            const Positioned(right: 12, top: 12, child: _LockMark()),
        ],
      ),
    );
  }
}

class _CoverImage extends StatelessWidget {
  final Content content;

  const _CoverImage({required this.content});

  @override
  Widget build(BuildContext context) {
    return AppNetworkImage(
      url: content.displayImage,
      fit: BoxFit.cover,
      fallbackIcon: content.isPodcast
          ? Icons.podcasts_rounded
          : content.isVideo
          ? Icons.play_circle_outline_rounded
          : Icons.auto_stories_outlined,
    );
  }
}

class _Badges extends StatelessWidget {
  final Content content;

  const _Badges({required this.content});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 7,
      runSpacing: 7,
      children: [
        _Badge(
          label: content.isJindungo ? 'Jindungo' : _categoryLabel(content),
          foreground: AppColors.primary,
          background: Colors.white.withValues(alpha: 0.92),
        ),
        _Badge(
          label: _typeLabel(content),
          foreground: AppColors.secondary,
          background: AppColors.blush.withValues(alpha: 0.95),
        ),
      ],
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color foreground;
  final Color background;

  const _Badge({
    required this.label,
    required this.foreground,
    required this.background,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Text(
        label.toUpperCase(),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: foreground,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _Footer extends StatelessWidget {
  final Content content;
  final String? footerLabel;
  final bool showActions;

  const _Footer({
    required this.content,
    required this.footerLabel,
    required this.showActions,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.line)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      child: Row(
        children: [
          CircleAvatar(
            radius: 15,
            backgroundColor: AppColors.blush,
            child: Text(
              initials(content.author?.name),
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              footerLabel ?? _authorLabel(content),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.textMedium,
              ),
            ),
          ),
          if (showActions) ...[
            const SizedBox(width: 8),
            _TinyStat(
              icon: content.likedByMe
                  ? Icons.favorite_rounded
                  : Icons.favorite_border_rounded,
              value: content.reactionsCount,
              active: content.likedByMe,
            ),
            const SizedBox(width: 10),
            _TinyStat(
              icon: Icons.chat_bubble_outline_rounded,
              value: content.commentsCount,
            ),
          ],
        ],
      ),
    );
  }
}

class _TinyStat extends StatelessWidget {
  final IconData icon;
  final int value;
  final bool active;

  const _TinyStat({
    required this.icon,
    required this.value,
    this.active = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: active ? AppColors.primary : AppColors.textLight,
        ),
        const SizedBox(width: 3),
        Text(
          '$value',
          style: TextStyle(
            fontSize: 12,
            color: active ? AppColors.primary : AppColors.textMedium,
          ),
        ),
      ],
    );
  }
}

class _LockMark extends StatelessWidget {
  const _LockMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 42,
      height: 42,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 12,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: const Icon(Icons.lock_rounded, color: AppColors.primary, size: 22),
    );
  }
}

class _PlayMark extends StatelessWidget {
  const _PlayMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.96),
        shape: BoxShape.circle,
      ),
      child: const Icon(
        Icons.play_arrow_rounded,
        color: AppColors.primary,
        size: 26,
      ),
    );
  }
}

String _categoryLabel(Content content) {
  return content.category?.name ?? 'Conteúdo';
}

String _typeLabel(Content content) {
  return content.contentType?.name ??
      (content.isPodcast
          ? 'Podcast'
          : content.isVideo
          ? 'Vídeo'
          : 'Artigo');
}

String _authorLabel(Content content) {
  return content.author?.name ?? 'Economia com História';
}

String _meta(Content content) {
  final time = readTime(content.content ?? content.summary);
  if (content.viewsCount > 0) return '$time - ${content.viewsCount} vistas';
  return time;
}

String _excerpt(Content content) {
  final value = content.summary ?? content.content ?? '';
  return value.trim().isEmpty ? 'Sem resumo disponível.' : value.trim();
}
