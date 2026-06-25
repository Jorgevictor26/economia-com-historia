// Ponto de entrada do app
// Lê SharedPreferences antes de iniciar para decidir a tela inicial
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:economica_com_historia/theme/app_theme.dart';
import 'package:economica_com_historia/screens/splash_screen.dart';
import 'package:economica_com_historia/screens/login_screen.dart';
import 'package:economica_com_historia/screens/criar_conta_screen.dart';
import 'package:economica_com_historia/Screens/Explorar_conteudo_screen.dart';
import 'package:economica_com_historia/Screens/criar_sala_debate_screen.dart';
import 'package:economica_com_historia/Screens/editar_perfil_screen.dart';
import 'package:economica_com_historia/Screens/perfil_screen.dart';
import 'package:economica_com_historia/Screens/praticar_quiz_screen.dart';
import 'package:economica_com_historia/Screens/favoritos_screen.dart';
import 'package:economica_com_historia/Screens/selecao_quiz_screen.dart';
import 'package:economica_com_historia/Screens/discussao_screen.dart';
import 'package:economica_com_historia/Screens/notificacoes_screen.dart';
import 'package:economica_com_historia/Screens/podcast_screen.dart';
import 'package:economica_com_historia/Screens/conteudo_screen.dart';
import 'package:economica_com_historia/Screens/podcast_selecionado_screen.dart';
import 'package:economica_com_historia/Screens/sala_de_debate_screen.dart';
import 'package:economica_com_historia/Screens/forum_screen.dart';
import 'package:economica_com_historia/shared/main_navigation_screen.dart';

Future<void> main() async {
  // Obrigatório antes de acessar plugins nativos
  WidgetsFlutterBinding.ensureInitialized();

  runApp(const EconomiaApp());
}

class EconomiaApp extends StatelessWidget {
  const EconomiaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Economia com História',
      theme: AppTheme.lightTheme,

      // SplashScreen é sempre o ponto de entrada —
      // ela mesma decide para onde navegar depois dos 2s
      home: const SplashScreen(),
      //home: const LoginScreen(),
      //home: const ExplorarConteudoScreen(),
      //home: const CriarSalaDebateScreen(),
      //home: const EditarPerfilScreen(),
      //home: const PerfilScreen(),
      //home: const PraticarQuizScreen(),
      //home: const FavoritosScreen(),
      //home: const SelecaoQuizScreen(),
      //home: const CriarSalaDebateScreen(),
      //home: const DiscussaoScreen(),
      //home: const ForumScreen(),
      //home: const NotificacoesScreen(),
      //home: const PodcastScreen(),
      //home: const PodcastSelecionadoScreen(),
      //home: const ConteudoScreen(),
      //home: const MainNavigationScreen(),
    );
  }
}
