import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:economica_com_historia/shared/main_navigation_screen.dart';
import '../widgets/onboarding_page.dart';
import '../widgets/dot_indicator.dart';
import 'criar_conta_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();

  int _paginaAtual = 0;

  static const paginas = [
    OnboardingPageData(
      titulo: 'Bem-Vindo',
      subtitulo: 'Estamos felizes por você estar aqui.',
      labelBotao: 'Vamos começar',
      imagemAsset: 'assets/images/Fundo_splashScreen.png',
      textoNoTopo: true,
    ),

    OnboardingPageData(
      titulo: 'Descubra tudo sobre\nEconomia com História\nAngolana',
      subtitulo: 'O passado explica o\ndinheiro de hoje.',
      labelBotao: 'Continue',
      imagemAsset: 'assets/images/Fundo_splashScreen.png',
    ),

    OnboardingPageData(
      titulo: 'Construindo conexões,\ncompartilhando\nsaberes',
      subtitulo: 'Junte-se a Comunidade',
      labelBotao: 'Criar Conta',
      imagemAsset: 'assets/images/Fundo_splashScreen.png',
      mostrarIcone: true,
      tituloTopo: 'Economia com História',
    ),
  ];

  Future<void> _avancar() async {
    if (_paginaAtual < paginas.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      final prefs = await SharedPreferences.getInstance();

      await prefs.setBool('onboarding_done', true);

      if (!mounted) return;

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const CriarContaScreen()),
        (route) => false,
      );
    }
  }

  @override
  void initState() {
    super.initState();

    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // ───────────────── PAGE VIEW ─────────────────
          PageView.builder(
            controller: _pageController,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: paginas.length,
            onPageChanged: (index) {
              setState(() {
                _paginaAtual = index;
              });
            },
            itemBuilder: (context, index) {
              return OnboardingPage(data: paginas[index], onAvancar: _avancar);
            },
          ),

          // ───────────────── DOTS ─────────────────
          Positioned(
            bottom: 38,
            left: 0,
            right: 0,
            child: DotIndicator(total: paginas.length, atual: _paginaAtual),
          ),
        ],
      ),
    );
  }
}
