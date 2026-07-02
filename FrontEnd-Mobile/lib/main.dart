import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:economica_com_historia/core/utils/api_client.dart';
import 'package:economica_com_historia/Screens/login_screen.dart';
import 'package:economica_com_historia/Screens/splash_screen.dart';
import 'package:economica_com_historia/services/perfil_service.dart';
import 'package:economica_com_historia/theme/app_theme.dart';

final appNavigatorKey = GlobalKey<NavigatorState>();
final appScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  ApiClient.onUnauthorized = () {
    final context = appNavigatorKey.currentContext;
    if (context != null) {
      context.read<PerfilService>().clearLocalSession();
    }
    appScaffoldMessengerKey.currentState
      ?..clearSnackBars()
      ..showSnackBar(
        const SnackBar(content: Text('A sua sessão expirou. Inicie sessão.')),
      );
    appNavigatorKey.currentState?.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  };
  runApp(const EconomiaApp());
}

class EconomiaApp extends StatelessWidget {
  const EconomiaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => PerfilService())],
      child: MaterialApp(
        navigatorKey: appNavigatorKey,
        scaffoldMessengerKey: appScaffoldMessengerKey,
        debugShowCheckedModeBanner: false,
        title: 'Economia com História',
        theme: AppTheme.lightTheme,
        home: const SplashScreen(),
      ),
    );
  }
}
