import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../services/auth_service.dart';
import '../theme/app_colors.dart';
import '../widgets/auth_widgets.dart';
import 'login_screen.dart';

class ReporPalavraPasseScreen extends StatefulWidget {
  final String? emailInicial;

  const ReporPalavraPasseScreen({super.key, this.emailInicial});

  @override
  State<ReporPalavraPasseScreen> createState() =>
      _ReporPalavraPasseScreenState();
}

class _ReporPalavraPasseScreenState extends State<ReporPalavraPasseScreen> {
  late final TextEditingController _emailController;
  final _tokenController = TextEditingController();
  final _novaSenhaController = TextEditingController();
  final _confirmarSenhaController = TextEditingController();
  final _authService = AuthService();

  bool _novaSenhaVisivel = false;
  bool _confirmarSenhaVisivel = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: widget.emailInicial ?? '');
  }

  @override
  void dispose() {
    _emailController.dispose();
    _tokenController.dispose();
    _novaSenhaController.dispose();
    _confirmarSenhaController.dispose();
    super.dispose();
  }

  Future<void> _handleEnviar() async {
    final email = _emailController.text.trim();
    final token = _tokenController.text.trim();
    final novaSenha = _novaSenhaController.text;
    final confirmar = _confirmarSenhaController.text;

    if (email.isEmpty ||
        token.isEmpty ||
        novaSenha.isEmpty ||
        confirmar.isEmpty) {
      _showSnackBar('Por favor, preencha todos os campos.');
      return;
    }
    if (novaSenha.length < 8) {
      _showSnackBar('A palavra-passe deve ter no minimo 8 caracteres.');
      return;
    }
    if (novaSenha != confirmar) {
      _showSnackBar('As palavras-passe nao coincidem.');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _authService.resetPassword(
        email: email,
        token: token,
        password: novaSenha,
      );
      if (!mounted) return;
      _showSnackBar('Palavra-passe redefinida com sucesso!');
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } catch (_) {
      if (mounted) _showSnackBar('Erro inesperado. Tente novamente.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final contentWidth = screenWidth > 480 ? 420.0 : screenWidth * 0.88;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight:
                  MediaQuery.of(context).size.height -
                  MediaQuery.of(context).padding.top -
                  MediaQuery.of(context).padding.bottom,
            ),
            child: IntrinsicHeight(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 48),
                  const AuthHeader(title: 'Repor Palavra-passe'),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: contentWidth,
                    child: const Text(
                      'Use o token recebido por e-mail para definir uma nova palavra-passe.',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textMedium,
                        height: 1.55,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: contentWidth,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const FieldLabel(label: 'E-MAIL'),
                        const SizedBox(height: 8),
                        AppTextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          hintText: 'exemplo@universidade.ao',
                        ),
                        const SizedBox(height: 20),
                        const FieldLabel(label: 'TOKEN'),
                        const SizedBox(height: 8),
                        AppTextField(
                          controller: _tokenController,
                          hintText: 'Token recebido por e-mail',
                        ),
                        const SizedBox(height: 20),
                        const FieldLabel(label: 'NOVA PALAVRA-PASSE'),
                        const SizedBox(height: 8),
                        AppTextField(
                          controller: _novaSenhaController,
                          hintText: 'Palavra-passe',
                          keyboardType: TextInputType.visiblePassword,
                          obscureText: !_novaSenhaVisivel,
                          suffixIcon: IconButton(
                            icon: Icon(
                              _novaSenhaVisivel
                                  ? Icons.visibility_outlined
                                  : Icons.visibility_off_outlined,
                              color: AppColors.textMedium,
                              size: 20,
                            ),
                            onPressed: () => setState(
                              () => _novaSenhaVisivel = !_novaSenhaVisivel,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        const FieldLabel(label: 'CONFIRMAR PALAVRA-PASSE'),
                        const SizedBox(height: 8),
                        AppTextField(
                          controller: _confirmarSenhaController,
                          hintText: 'Confirmar palavra-passe',
                          keyboardType: TextInputType.visiblePassword,
                          obscureText: !_confirmarSenhaVisivel,
                          suffixIcon: IconButton(
                            icon: Icon(
                              _confirmarSenhaVisivel
                                  ? Icons.visibility_outlined
                                  : Icons.visibility_off_outlined,
                              color: AppColors.textMedium,
                              size: 20,
                            ),
                            onPressed: () => setState(
                              () => _confirmarSenhaVisivel =
                                  !_confirmarSenhaVisivel,
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: FilledButton(
                            onPressed: _isLoading ? null : _handleEnviar,
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              disabledBackgroundColor: AppColors.primary
                                  .withValues(alpha: 0.6),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Enviar'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Center(child: BackToLoginLink()),
                  const Spacer(),
                  const FooterSection(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
