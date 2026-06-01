import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';
import 'package:economica_com_historia/Screens/editar_perfil_screen.dart';
import 'package:economica_com_historia/widgets/app_bar_principal.dart';
import 'package:economica_com_historia/screens/login_screen.dart';

class PerfilScreen extends StatelessWidget {
  const PerfilScreen({super.key});

  static const _cursos = [
    _CursoProgresso(
      titulo: 'Comércio Trans-Saariano',
      proxima: 'As Rotas de Sal e Ouro',
      progresso: 0.75,
      icone: Icons.account_balance_outlined,
    ),
    _CursoProgresso(
      titulo: 'Moedas Coloniais em Angola',
      proxima: 'O Real Português',
      progresso: 0.33,
      icone: Icons.savings_outlined,
    ),
  ];

  static const _conquistas = [
    _Conquista(
      label: 'Primeira Lição',
      icone: Icons.star_outline_rounded,
      desbloqueada: true,
    ),
    _Conquista(
      label: 'Arquivista',
      icone: Icons.folder_special_outlined,
      desbloqueada: true,
    ),
    _Conquista(
      label: 'Orador',
      icone: Icons.record_voice_over_outlined,
      desbloqueada: true,
    ),
    _Conquista(
      label: 'Bibliotecário',
      icone: Icons.menu_book_outlined,
      desbloqueada: false,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppBarPrincipal(
        mostrarFavoritos: true,
        titulo: 'Perfil',
        mostrarVoltar: false,
        mostrarNotificacoes: true,
        mostrarPesquisa: true,
      ),
      body: CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                const SizedBox(height: 8),
                _CabecalhoPerfil(),
                const SizedBox(height: 16),
                Center(
                  child: SizedBox(
                    height: 44,
                    width: 160,
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const EditarPerfilScreen(),
                        ),
                      ),
                      icon: const Icon(Icons.edit_outlined, size: 16),
                      label: const Text('Editar Perfil'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                        textStyle: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                _EstatisticasCard(),
                const SizedBox(height: 24),
                const Text(
                  'Progresso dos Cursos',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Acompanha os teus módulos ativos',
                  style: TextStyle(fontSize: 12, color: AppColors.textMedium),
                ),
                const SizedBox(height: 14),
                ..._cursos.map((c) => _CursoCard(curso: c)),
                const SizedBox(height: 24),
                const Text(
                  'Conquistas',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: _conquistas
                      .map((c) => _ConquistaItem(conquista: c))
                      .toList(),
                ),
                const SizedBox(height: 32),
                // ── Logout ───────────────────────────────────────────────
                _LogoutButton(),
                const SizedBox(height: 32),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _CabecalhoPerfil extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.primary, width: 2),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Image.asset(
              '/images/Imagem_perfil.png',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: const Color(0xFFEEE8E9),
                child: const Icon(
                  Icons.person_rounded,
                  size: 40,
                  color: AppColors.textLight,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Estudante Académico',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.textDark,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Investigador de História Económica',
          style: TextStyle(fontSize: 13, color: AppColors.textMedium),
        ),
      ],
    );
  }
}

class _EstatisticasCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEEE8E9)),
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            _StatItem(label: 'RANKING', valor: '#14', sublabel: 'Luanda'),
            const VerticalDivider(color: Color(0xFFEEE8E9), width: 1),
            _StatItem(label: 'NÍVEL', valor: '4', sublabel: 'Académico'),
            const VerticalDivider(color: Color(0xFFEEE8E9), width: 1),
            _StatItem(label: 'PONTOS', valor: '2,850', sublabel: 'XP'),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String valor;
  final String sublabel;

  const _StatItem({
    required this.label,
    required this.valor,
    required this.sublabel,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: AppColors.textLight,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            valor,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            sublabel,
            style: const TextStyle(fontSize: 11, color: AppColors.textMedium),
          ),
        ],
      ),
    );
  }
}

class _CursoProgresso {
  final String titulo;
  final String proxima;
  final double progresso;
  final IconData icone;

  const _CursoProgresso({
    required this.titulo,
    required this.proxima,
    required this.progresso,
    required this.icone,
  });
}

class _CursoCard extends StatelessWidget {
  final _CursoProgresso curso;

  const _CursoCard({required this.curso});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEEE8E9)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFF0EAEA),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(curso.icone, color: AppColors.textLight, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      curso.titulo,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textDark,
                      ),
                    ),
                    Text(
                      '${(curso.progresso * 100).toInt()}%',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textDark,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: curso.progresso,
                    minHeight: 5,
                    backgroundColor: const Color(0xFFEEE8E9),
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      Color(0xFF4CAF50),
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Próxima: ${curso.proxima}',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textLight,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Conquista {
  final String label;
  final IconData icone;
  final bool desbloqueada;

  const _Conquista({
    required this.label,
    required this.icone,
    required this.desbloqueada,
  });
}

class _ConquistaItem extends StatelessWidget {
  final _Conquista conquista;

  const _ConquistaItem({required this.conquista});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: conquista.desbloqueada
                ? (conquista.label.contains('Arquiv')
                      ? const Color(0xFFFFF8E1)
                      : const Color(0xFFF0EAEA))
                : const Color(0xFFF5F5F5),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: conquista.desbloqueada
                  ? (conquista.label.contains('Arquiv')
                        ? const Color(0xFFB5933A)
                        : AppColors.primary.withOpacity(0.3))
                  : const Color(0xFFEEE8E9),
            ),
          ),
          child: Icon(
            conquista.icone,
            color: conquista.desbloqueada
                ? (conquista.label.contains('Arquiv')
                      ? const Color(0xFFB5933A)
                      : AppColors.primary)
                : AppColors.textLight.withOpacity(0.4),
            size: 26,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          conquista.label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: conquista.desbloqueada
                ? AppColors.textDark
                : AppColors.textLight.withOpacity(0.5),
          ),
        ),
      ],
    );
  }
}

class _LogoutButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
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
                onPressed: () => Navigator.pop(ctx),
                child: const Text(
                  'Cancelar',
                  style: TextStyle(
                    color: AppColors.textMedium,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx); // fecha o dialog
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
                  );
                },
                child: const Text(
                  'Sair',
                  style: TextStyle(
                    color: Color(0xFFB00020),
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        );
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFEEE8E9)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.logout_rounded, size: 18, color: Color(0xFFB00020)),
            SizedBox(width: 8),
            Text(
              'Terminar Sessão',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFFB00020),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
