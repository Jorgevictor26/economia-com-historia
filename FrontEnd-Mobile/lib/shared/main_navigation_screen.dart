import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:economica_com_historia/theme/app_colors.dart';
import 'package:economica_com_historia/Screens/home_screen.dart';
import 'package:economica_com_historia/Screens/explorar_conteudo_screen.dart';
import 'package:economica_com_historia/Screens/selecao_quiz_screen.dart';
import 'package:economica_com_historia/Screens/forum_screen.dart';
import 'package:economica_com_historia/Screens/podcast_screen.dart';
import 'package:economica_com_historia/Screens/login_screen.dart';
import 'package:economica_com_historia/services/perfil_service.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  MainNavigationScreenState createState() => MainNavigationScreenState();
}

class MainNavigationScreenState extends State<MainNavigationScreen>
    with TickerProviderStateMixin {
  int _indiceAtual = 0;

  late final List<AnimationController> _controllers;
  late final List<Animation<double>> _scaleAnims;

  List<Widget> _telas() => [
    HomeScreen(onIrParaForum: () => onTap(3)),
    const ExplorarConteudoScreen(),
    const SelecaoQuizScreen(),
    const ForumScreen(),
    const PodcastScreen(),
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
      icone: Icons.quiz_rounded,
      iconeOff: Icons.quiz_outlined,
      label: 'Quiz',
    ),
    _NavItem(
      icone: Icons.forum_rounded,
      iconeOff: Icons.forum_outlined,
      label: 'Fórum',
    ),
    _NavItem(
      icone: Icons.podcasts_rounded,
      iconeOff: Icons.podcasts_outlined,
      label: 'Podcast',
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

  void onTap(int index) {
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
    final isAuthenticated = context.watch<PerfilService>().isAuthenticated;
    if (!isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!context.mounted) return;
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (route) => false,
        );
      });
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    return Scaffold(
      body: IndexedStack(index: _indiceAtual, children: _telas()),
      bottomNavigationBar: _NavBar(
        itens: _itens,
        indiceAtual: _indiceAtual,
        scaleAnims: _scaleAnims,
        onTap: onTap,
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
            color: AppColors.primary.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 60,
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
                          width: ativo ? 40 : 30,
                          height: ativo ? 28 : 24,
                          decoration: BoxDecoration(
                            color: ativo
                                ? AppColors.primary.withValues(alpha: 0.12)
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
                                size: ativo ? 20 : 18,
                                color: ativo
                                    ? AppColors.primary
                                    : AppColors.copyMuted,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 2),
                        AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 200),
                          style: TextStyle(
                            fontSize: 9.5,
                            fontWeight: ativo
                                ? FontWeight.w700
                                : FontWeight.w400,
                            color: ativo
                                ? AppColors.primary
                                : AppColors.copyMuted,
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
