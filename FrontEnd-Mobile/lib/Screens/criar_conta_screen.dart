import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../config/google_auth_config.dart';
import '../core/exceptions/app_exceptions.dart';
import '../services/perfil_service.dart';
import '../shared/main_navigation_screen.dart';
import '../theme/app_colors.dart';
import '../widgets/auth_widgets.dart';
import 'login_screen.dart';

class CriarContaScreen extends StatefulWidget {
  const CriarContaScreen({super.key});

  @override
  State<CriarContaScreen> createState() => _CriarContaScreenState();
}

class _CriarContaScreenState extends State<CriarContaScreen> {
  final _nomeController = TextEditingController();
  final _emailController = TextEditingController();
  final _senhaController = TextEditingController();
  final _googleSignIn = buildGoogleSignIn();

  bool _obscureSenha = true;
  bool _aceitouTermos = false;
  bool _isLoading = false;
  bool _isGoogleLoading = false;

  @override
  void dispose() {
    _nomeController.dispose();
    _emailController.dispose();
    _senhaController.dispose();
    super.dispose();
  }

  Future<void> _registrar() async {
    final nome = _nomeController.text.trim();
    final email = _emailController.text.trim();
    final senha = _senhaController.text;

    if (nome.isEmpty || email.isEmpty || senha.isEmpty) {
      _showSnackBar('Preencha todos os campos.');
      return;
    }
    if (senha.length < 8) {
      _showSnackBar('A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!_aceitouTermos) {
      _showSnackBar('Aceite os termos para continuar.');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await context.read<PerfilService>().registrar(
        name: nome,
        email: email,
        password: senha,
      );
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
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

  Future<void> _handleGoogle() async {
    if (_isLoading || _isGoogleLoading) return;
    if (!_aceitouTermos) {
      _showSnackBar('Aceite os termos para continuar.');
      return;
    }

    setState(() => _isGoogleLoading = true);
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) return;

      final auth = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null || idToken.isEmpty) {
        _showSnackBar('Não foi possível validar a conta Google.');
        return;
      }

      if (!mounted) return;
      await context.read<PerfilService>().loginWithGoogle(idToken);
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
        (route) => false,
      );
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } on PlatformException catch (e) {
      debugPrint('Platform auth error: ${e.code} ${e.message}');
      if (mounted) _showSnackBar(_platformAuthErrorMessage(e));
    } catch (_) {
      if (mounted) _showSnackBar('Erro ao registar com Google.');
    } finally {
      if (mounted) setState(() => _isGoogleLoading = false);
    }
  }

  String _platformAuthErrorMessage(PlatformException error) {
    final raw = '${error.code} ${error.message ?? ''}'.toLowerCase();
    if (raw.contains('network')) {
      return 'Sem conexao a internet. Verifique a rede e tente novamente.';
    }
    if (raw.contains('10') || raw.contains('sign_in_failed')) {
      return 'Nao foi possivel validar a configuracao Google deste dispositivo.';
    }
    return 'Nao foi possivel autenticar com Google. Tente novamente.';
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 16),
              const AuthHeader(title: 'Bem-Vindo a\nEconomia com História'),
              const SizedBox(height: 32),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
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
                      hintText: 'Palavra-passe',
                      obscureText: _obscureSenha,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureSenha
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: AppColors.textLight,
                          size: 20,
                        ),
                        onPressed: () =>
                            setState(() => _obscureSenha = !_obscureSenha),
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
                            onChanged: (value) =>
                                setState(() => _aceitouTermos = value ?? false),
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
                            'Li e aceito os Termos de Uso e a Politica de Privacidade.',
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
                        onPressed: (_aceitouTermos && !_isLoading)
                            ? _registrar
                            : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          disabledBackgroundColor: AppColors.disabledBackground,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          elevation: 0,
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
                            : const Text(
                                'Proximo',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    Row(
                      children: [
                        const Expanded(
                          child: Divider(color: AppColors.borderSoft),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            'OU REGISTAR COM',
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textLight,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                        const Expanded(
                          child: Divider(color: AppColors.borderSoft),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: OutlinedButton.icon(
                        onPressed: (_isLoading || _isGoogleLoading)
                            ? null
                            : _handleGoogle,
                        icon: _isGoogleLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppColors.primary,
                                ),
                              )
                            : Image.asset(
                                'assets/images/Google.png',
                                width: 20,
                                height: 20,
                              ),
                        label: Text(
                          _isGoogleLoading ? 'A entrar...' : 'Google',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textDark,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          backgroundColor: AppColors.cardBackground,
                          side: const BorderSide(
                            color: AppColors.borderSoft,
                            width: 1.2,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              LoginLink(
                onTap: () => Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                ),
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
