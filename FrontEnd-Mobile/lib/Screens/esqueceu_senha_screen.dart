import 'package:flutter/material.dart';

import '../widgets/auth_widgets.dart';
import '../theme/app_colors.dart';
import 'repor_palavra_passe.dart';

class EsqueceuSenhaScreen extends StatefulWidget {
  const EsqueceuSenhaScreen({super.key});

  @override
  State<EsqueceuSenhaScreen> createState() => _EsqueceuSenhaScreenState();
}

class _EsqueceuSenhaScreenState extends State<EsqueceuSenhaScreen> {
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final contentWidth = screenWidth > 480 ? 420.0 : screenWidth * 0.88;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ConstrainedBox(
          constraints: BoxConstraints(
            minHeight:
                MediaQuery.of(context).size.height -
                MediaQuery.of(context).padding.top -
                MediaQuery.of(context).padding.bottom,
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 24.0,
              vertical: 32.0,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 24),

                const AuthHeader(title: 'Esqueci minha senha'),

                const SizedBox(height: 12),

                SizedBox(
                  width: contentWidth,
                  child: const Text(
                    'Introduza o seu e-mail para receber um link de redefinição de palavra-passe.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textMedium,
                      height: 1.55,
                    ),
                  ),
                ),

                const SizedBox(height: 36),

                SizedBox(
                  width: contentWidth,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const FieldLabel(label: 'Endereço de E-mail'),
                      const SizedBox(height: 8),
                      AppTextField(
                        controller: _emailController,
                        hintText: 'exemplo@universidade.ao',
                        keyboardType: TextInputType.emailAddress,
                      ),

                      const SizedBox(height: 28),

                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: FilledButton(
                          // ← era ElevatedButton
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const ReporPalavraPasseScreen(),
                              ),
                            );
                          },
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(
                                8,
                              ), // ← era 14
                            ),
                            elevation: 0,
                          ),
                          child: const Text(
                            'Enviar',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                const BackToLoginLink(),

                const Spacer(), // ← empurra o footer para o fundo

                const FooterSection(),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
