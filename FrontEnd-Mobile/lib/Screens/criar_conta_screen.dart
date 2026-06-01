import 'package:flutter/material.dart';
import 'login_screen.dart';
import '../theme/app_colors.dart';
import '../widgets/auth_widgets.dart';
import 'package:economica_com_historia/shared/main_navigation_screen.dart';

class CriarContaScreen extends StatefulWidget {
  const CriarContaScreen({super.key});

  @override
  State<CriarContaScreen> createState() => _CriarContaScreenState();
}

class _CriarContaScreenState extends State<CriarContaScreen> {
  final _nomeController = TextEditingController();

  final _emailController = TextEditingController();

  final _senhaController = TextEditingController();

  bool _obscureSenha = true;

  bool _aceitouTermos = false;

  @override
  void dispose() {
    _nomeController.dispose();

    _emailController.dispose();

    _senhaController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,

            children: [
              const SizedBox(height: 16),

              const AuthHeader(title: 'Bem-Vindo a\nEconomia com História'),

              const SizedBox(height: 32),

              Container(
                width: double.infinity,

                padding: const EdgeInsets.all(24),

                decoration: BoxDecoration(
                  color: AppColors.cardBackground,

                  borderRadius: BorderRadius.circular(20),

                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF857275).withOpacity(0.10),

                      blurRadius: 20,

                      offset: const Offset(0, 4),
                    ),

                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),

                      blurRadius: 8,

                      offset: const Offset(0, 2),
                    ),
                  ],
                ),

                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,

                  children: [
                    const FieldLabel(label: 'Nome Completo'),

                    const SizedBox(height: 8),

                    AppTextField(
                      controller: _nomeController,

                      hintText: 'Ex: Manuel dos Santos',

                      keyboardType: TextInputType.name,

                      textCapitalization: TextCapitalization.words,
                    ),

                    const SizedBox(height: 20),

                    const FieldLabel(label: 'E-mail'),

                    const SizedBox(height: 8),

                    AppTextField(
                      controller: _emailController,

                      hintText: 'exemplo@dominio.ao',

                      keyboardType: TextInputType.emailAddress,
                    ),

                    const SizedBox(height: 20),

                    const FieldLabel(label: 'Palavra-passe'),

                    const SizedBox(height: 8),

                    AppTextField(
                      controller: _senhaController,

                      hintText: '••••••••',

                      obscureText: _obscureSenha,

                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureSenha
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,

                          color: AppColors.textLight,

                          size: 20,
                        ),

                        onPressed: () {
                          setState(() {
                            _obscureSenha = !_obscureSenha;
                          });
                        },
                      ),
                    ),

                    const SizedBox(height: 24),

                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,

                      children: [
                        SizedBox(
                          width: 22,
                          height: 22,

                          child: Checkbox(
                            value: _aceitouTermos,

                            onChanged: (val) {
                              setState(() {
                                _aceitouTermos = val ?? false;
                              });
                            },

                            activeColor: AppColors.primary,

                            side: const BorderSide(
                              color: AppColors.borderColor,
                              width: 1.5,
                            ),

                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),

                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                          ),
                        ),

                        const SizedBox(width: 10),

                        const Expanded(
                          child: Text(
                            'Li e aceito os Termos de Uso e a Política de Privacidade.',

                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.textMedium,
                              height: 1.5,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    SizedBox(
                      width: double.infinity,

                      height: 52,

                      child: ElevatedButton(
                        onPressed: _aceitouTermos
                            ? () {
                                Navigator.pushAndRemoveUntil(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        const MainNavigationScreen(),
                                  ),
                                  (route) => false,
                                );
                              }
                            : null,

                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,

                          disabledBackgroundColor: AppColors.inputFill,

                          foregroundColor: Colors.white,

                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),

                          elevation: 0,
                        ),

                        child: const Text(
                          'Próximo',

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

              const SizedBox(height: 28),

              LoginLink(
                onTap: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
              ),

              const SizedBox(height: 32),

              const FooterSection(),

              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
