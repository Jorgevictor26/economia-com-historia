import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../Screens/login_screen.dart';
import '../theme/app_colors.dart';
import '../Screens/notificacoes_screen.dart';
import '../Screens/favoritos_screen.dart';
import '../Screens/perfil_screen.dart';
import '../Screens/ranking_global_screen.dart';
import '../services/perfil_service.dart';
import 'profile_photo_image.dart';
import 'search_modal.dart';

class AppBarPrincipal extends StatelessWidget implements PreferredSizeWidget {
  final String titulo;
  final bool mostrarNotificacoes;
  final bool mostrarPesquisa;
  final bool mostrarVoltar;
  final bool mostrarFavoritos;
  final bool mostrarPerfil;
  final bool mostrarRankingGlobal;

  const AppBarPrincipal({
    super.key,
    required this.titulo,
    this.mostrarNotificacoes = true,
    this.mostrarPesquisa = true,
    this.mostrarVoltar = false,
    this.mostrarFavoritos = false,
    this.mostrarPerfil = false,
    this.mostrarRankingGlobal = true,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  Future<void> _confirmarLogout(BuildContext context) async {
    final confirmou = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Terminar Sessão',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.textDark,
          ),
        ),
        content: const Text(
          'Tens a certeza que queres sair da tua conta?',
          style: TextStyle(
            fontSize: 14,
            color: AppColors.textMedium,
            height: 1.5,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text(
              'Cancelar',
              style: TextStyle(
                color: AppColors.textMedium,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text(
              'Sair',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmou != true || !context.mounted) return;

    await context.read<PerfilService>().logout();
    if (!context.mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  void _abrirMenu(BuildContext context) {
    final isAuthenticated = context.read<PerfilService>().isAuthenticated;

    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Menu',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 280),
      pageBuilder: (_, _, _) => const SizedBox.shrink(),
      transitionBuilder: (dialogContext, animation, _, _) {
        final slide =
            Tween<Offset>(begin: const Offset(-1, 0), end: Offset.zero).animate(
              CurvedAnimation(parent: animation, curve: Curves.easeOutCubic),
            );

        return SlideTransition(
          position: slide,
          child: Align(
            alignment: Alignment.topLeft,
            child: Material(
              color: Colors.transparent,
              child: Container(
                width: MediaQuery.of(dialogContext).size.width * 0.65,
                height: MediaQuery.of(dialogContext).size.height,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    bottomRight: Radius.circular(24),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 24,
                      offset: Offset(4, 0),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                        child: IconButton(
                          onPressed: () => Navigator.pop(dialogContext),
                          icon: const Icon(
                            Icons.close_rounded,
                            color: AppColors.primary,
                            size: 26,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child: Text(
                          'Menu',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary.withValues(alpha: 0.5),
                            fontFamily: 'Poppins',
                            letterSpacing: 1.4,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      if (mostrarPerfil) ...[
                        _MenuItem(
                          icone: Icons.person_outline_rounded,
                          label: 'Perfil',
                          onTap: () {
                            Navigator.pop(dialogContext);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const PerfilScreen(),
                              ),
                            );
                          },
                        ),
                        _Divider(),
                      ],
                      if (mostrarRankingGlobal) ...[
                        _MenuItem(
                          icone: Icons.leaderboard_outlined,
                          label: 'Ranking Global',
                          onTap: () {
                            Navigator.pop(dialogContext);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const RankingGlobalScreen(),
                              ),
                            );
                          },
                        ),
                        _Divider(),
                      ],
                      if (mostrarFavoritos) ...[
                        _MenuItem(
                          icone: Icons.bookmark_border_rounded,
                          label: 'Favoritos',
                          onTap: () {
                            Navigator.pop(dialogContext);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const FavoritosScreen(),
                              ),
                            );
                          },
                        ),
                        _Divider(),
                      ],
                      if (mostrarNotificacoes) ...[
                        _MenuItem(
                          icone: Icons.notifications_none_rounded,
                          label: 'Notificações',
                          onTap: () {
                            Navigator.pop(dialogContext);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const NotificacoesScreen(),
                              ),
                            );
                          },
                        ),
                        _Divider(),
                      ],

                      const Spacer(),
                      if (isAuthenticated) ...[
                        _Divider(),
                        _MenuItem(
                          icone: Icons.logout_rounded,
                          label: 'Terminar Sessão',
                          onTap: () {
                            Navigator.pop(dialogContext);
                            _confirmarLogout(context);
                          },
                        ),
                      ],
                      Padding(
                        padding: const EdgeInsets.fromLTRB(32, 0, 32, 32),
                        child: Text(
                          'Economia com História',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.primary.withValues(alpha: 0.35),
                            fontFamily: 'Poppins',
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final perfil = context.watch<PerfilService>();
    final usuario = perfil.usuario;

    return AppBar(
      backgroundColor: AppColors.cardBackground,
      elevation: 0,
      automaticallyImplyLeading: false,
      leading: mostrarVoltar
          ? IconButton(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(
                Icons.chevron_left_rounded,
                color: AppColors.textDark,
                size: 28,
              ),
            )
          : (mostrarFavoritos ||
                mostrarNotificacoes ||
                mostrarPerfil ||
                mostrarRankingGlobal)
          ? IconButton(
              onPressed: () => _abrirMenu(context),
              icon: const Icon(
                Icons.menu_rounded,
                color: AppColors.primary,
                size: 24,
              ),
            )
          : null,
      centerTitle: true,
      title: Text(
        titulo,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.primary,
          fontFamily: 'Poppins',
        ),
      ),
      actions: [
        if (mostrarPesquisa)
          IconButton(
            onPressed: () => SearchModal.show(context),
            icon: const Icon(
              Icons.search_rounded,
              color: AppColors.primary,
              size: 24,
            ),
          ),
        if (perfil.isAuthenticated && usuario != null)
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: _TopBarAvatar(
              name: usuario.name,
              photo: usuario.photo,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PerfilScreen()),
              ),
            ),
          ),
      ],
    );
  }
}

class _TopBarAvatar extends StatelessWidget {
  final String name;
  final String? photo;
  final VoidCallback onTap;

  const _TopBarAvatar({
    required this.name,
    required this.photo,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: 'Perfil',
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: ClipOval(
          child: SizedBox(
            width: 32,
            height: 32,
            child: ProfilePhotoImage(
              photo: photo,
              name: name,
              initialsFontSize: 11,
              iconSize: 17,
            ),
          ),
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icone;
  final String label;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icone,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        child: Row(
          children: [
            Icon(icone, color: AppColors.primary, size: 22),
            const SizedBox(width: 16),
            Text(
              label,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: AppColors.primary,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Divider(
        height: 1,
        color: AppColors.primary.withValues(alpha: 0.08),
      ),
    );
  }
}
