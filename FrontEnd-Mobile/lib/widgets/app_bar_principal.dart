import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../screens/notificacoes_screen.dart';
import '../screens/favoritos_screen.dart';
import 'package:economica_com_historia/screens/favoritos_screen.dart';
import 'search_modal.dart';

class AppBarPrincipal extends StatelessWidget implements PreferredSizeWidget {
  final String titulo;
  final bool mostrarNotificacoes;
  final bool mostrarPesquisa;
  final bool mostrarVoltar;
  final bool mostrarFavoritos; // ← NOVO

  const AppBarPrincipal({
    super.key,
    required this.titulo,
    this.mostrarNotificacoes = true,
    this.mostrarPesquisa = true,
    this.mostrarVoltar = false,
    this.mostrarFavoritos = false, // ← default false
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.background,
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
          : null,
      title: Text(
        titulo,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.primary,
        ),
      ),
      actions: [
        if (mostrarFavoritos)
          IconButton(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const FavoritosScreen()),
            ),
            icon: const Icon(
              Icons.bookmark_border_rounded,
              color: AppColors.primary,
              size: 24,
            ),
          ),
        if (mostrarNotificacoes)
          IconButton(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const NotificacoesScreen()),
            ),
            icon: const Icon(
              Icons.notifications_none_rounded,
              color: AppColors.primary,
              size: 24,
            ),
          ),
        if (mostrarPesquisa)
          IconButton(
            onPressed: () => SearchModal.show(context),
            icon: const Icon(
              Icons.search_rounded,
              color: AppColors.primary,
              size: 24,
            ),
          ),
      ],
    );
  }
}
