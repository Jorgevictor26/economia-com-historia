import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:economica_com_historia/screens/splash_screen.dart';
import 'package:economica_com_historia/service/perfil_service.dart';
import 'package:economica_com_historia/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EconomiaApp());
}

class EconomiaApp extends StatelessWidget {
  const EconomiaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => PerfilService())],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Economia com Historia',
        theme: AppTheme.lightTheme,
        home: const SplashScreen(),
      ),
    );
  }
}
