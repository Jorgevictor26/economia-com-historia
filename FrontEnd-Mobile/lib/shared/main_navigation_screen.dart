import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:economica_com_historia/theme/app_colors.dart';
import 'package:economica_com_historia/Screens/home_screen.dart';
import 'package:economica_com_historia/Screens/explorar_conteudo_screen.dart';
import 'package:economica_com_historia/Screens/selecao_quiz_screen.dart';
import 'package:economica_com_historia/Screens/forum_screen.dart';
import 'package:economica_com_historia/Screens/podcast_screen.dart'; // ← NOVA
import 'package:economica_com_historia/Screens/perfil_screen.dart';
import 'package:economica_com_historia/Screens/podcast_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen>
    with TickerProviderStateMixin {
  int _indiceAtual = 0;

  late final List<AnimationController> _controllers;
  late final List<Animation<double>> _scaleAnims;

  static const _telas = [
    HomeScreen(),
    ExplorarConteudoScreen(),
    SelecaoQuizScreen(),
    ForumScreen(),
    PodcastScreen(), // ← NOVA
    PerfilScreen(),
  ];

  static const _itens = [
    _NavItem(
      icone: Icons.home_rounded,
      iconeOff: Icons.home_outlined,
      label: 'Início',
    ),
    _NavItem(
      icone: Icons.auto_stories_rounded,
      iconeOff: Icons.auto_stories_outlined,
      label: 'Conteúdo',
    ),
    _NavItem(
      icone: Icons.lightbulb_rounded,
      iconeOff: Icons.lightbulb_outline_rounded,
      label: 'Quiz',
    ),
    _NavItem(
      icone: Icons.forum_rounded,
      iconeOff: Icons.forum_outlined,
      label: 'Fórum',
    ),
    _NavItem(
      // ← NOVO
      icone: Icons.podcasts_rounded,
      iconeOff: Icons.podcasts_outlined,
      label: 'Podcast',
    ),
    _NavItem(
      icone: Icons.person_rounded,
      iconeOff: Icons.person_outline_rounded,
      label: 'Perfil',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      _itens.length,
      (i) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 220),
      ),
    );
    _scaleAnims = _controllers
        .map(
          (c) => Tween<double>(
            begin: 1.0,
            end: 1.18,
          ).animate(CurvedAnimation(parent: c, curve: Curves.easeOutBack)),
        )
        .toList();

    _controllers[0].forward();
  }

  void _onTap(int index) {
    if (index == _indiceAtual) return;
    HapticFeedback.lightImpact();
    _controllers[_indiceAtual].reverse();
    setState(() => _indiceAtual = index);
    _controllers[index].forward();
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _indiceAtual, children: _telas),
      bottomNavigationBar: _NavBar(
        itens: _itens,
        indiceAtual: _indiceAtual,
        scaleAnims: _scaleAnims,
        onTap: _onTap,
      ),
    );
  }
}

class _NavItem {
  final IconData icone;
  final IconData iconeOff;
  final String label;

  const _NavItem({
    required this.icone,
    required this.iconeOff,
    required this.label,
  });
}

class _NavBar extends StatelessWidget {
  final List<_NavItem> itens;
  final int indiceAtual;
  final List<Animation<double>> scaleAnims;
  final ValueChanged<int> onTap;

  const _NavBar({
    required this.itens,
    required this.indiceAtual,
    required this.scaleAnims,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.08),
            blurRadius: 24,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 60, // ← reduzido de 64 para caber 6 itens
          child: Row(
            children: List.generate(itens.length, (i) {
              final ativo = i == indiceAtual;
              return Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => onTap(i),
                  child: ScaleTransition(
                    scale: scaleAnims[i],
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          curve: Curves.easeInOut,
                          width: ativo ? 40 : 30, // ← reduzido
                          height: ativo ? 28 : 24, // ← reduzido
                          decoration: BoxDecoration(
                            color: ativo
                                ? AppColors.primary.withOpacity(0.12)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: AnimatedSwitcher(
                              duration: const Duration(milliseconds: 200),
                              transitionBuilder: (child, anim) =>
                                  ScaleTransition(scale: anim, child: child),
                              child: Icon(
                                ativo ? itens[i].icone : itens[i].iconeOff,
                                key: ValueKey('$i-$ativo'),
                                size: ativo ? 20 : 18, // ← reduzido
                                color: ativo
                                    ? AppColors.primary
                                    : const Color(0xFFB0959A),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 2),
                        AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 200),
                          style: TextStyle(
                            fontSize: 9.5, // ← reduzido de 10.5
                            fontWeight: ativo
                                ? FontWeight.w700
                                : FontWeight.w400,
                            color: ativo
                                ? AppColors.primary
                                : const Color(0xFFB0959A),
                            fontFamily: 'Poppins',
                          ),
                          child: Text(itens[i].label),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
