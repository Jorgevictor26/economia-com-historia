import 'package:flutter/material.dart';
import '../widgets/auth_widgets.dart';
import '../theme/app_colors.dart';

class ReporPalavraPasseScreen extends StatefulWidget {
  const ReporPalavraPasseScreen({super.key});

  @override
  State<ReporPalavraPasseScreen> createState() =>
      _ReporPalavraPasseScreenState();
}

class _ReporPalavraPasseScreenState extends State<ReporPalavraPasseScreen> {
  final TextEditingController _novaSenhaController = TextEditingController();
  final TextEditingController _confirmarSenhaController =
      TextEditingController();

  bool _novaSenhaVisivel = false;
  bool _confirmarSenhaVisivel = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _novaSenhaController.dispose();
    _confirmarSenhaController.dispose();
    super.dispose();
  }

  Future<void> _handleEnviar() async {
    final novaSenha = _novaSenhaController.text;
    final confirmar = _confirmarSenhaController.text;

    if (novaSenha.isEmpty || confirmar.isEmpty) {
      _showSnackBar('Por favor, preencha todos os campos.');
      return;
    }

    if (novaSenha.length < 8) {
      _showSnackBar('A palavra-passe deve ter no mínimo 8 caracteres.');
      return;
    }

    if (!RegExp(r'^(?=.*[a-zA-Z])(?=.*\d).{8,}$').hasMatch(novaSenha)) {
      _showSnackBar('A palavra-passe deve conter letras e números.');
      return;
    }

    if (novaSenha != confirmar) {
      _showSnackBar('As palavras-passe não coincidem.');
      return;
    }

    setState(() => _isLoading = true);

    try {
      // TODO: Integrar com o serviço de autenticação
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        _showSnackBar('Palavra-passe redefinida com sucesso!', isSuccess: true);
      }
    } catch (_) {
      if (mounted) _showSnackBar('Ocorreu um erro. Tente novamente.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSnackBar(String message, {bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isSuccess ? AppColors.primary : Colors.redAccent,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight:
                  MediaQuery.of(context).size.height -
                  MediaQuery.of(context).padding.top -
                  MediaQuery.of(context).padding.bottom,
            ),
            child: IntrinsicHeight(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 48),

                  // ── Ícone + Título ──────────────────────────────────────
                  const AuthHeader(title: 'Repor Palavra-passe'),

                  const SizedBox(height: 12),

                  // ── Texto descritivo ────────────────────────────────────
                  const Text(
                    'Defina uma nova palavra-passe para a sua conta.',
                    textAlign: TextAlign.left,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textMedium,
                      height: 1.55,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // ── Campo: Nova Palavra-passe ────────────────────────────
                  const FieldLabel(label: 'NOVA PALAVRA-PASSE'),
                  const SizedBox(height: 8),
                  AppTextField(
                    controller: _novaSenhaController,
                    hintText: '••••••••',
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
                  const SizedBox(height: 6),

                  // ── Hint de validação ────────────────────────────────────
                  const Text(
                    'Mínimo de 8 caracteres (letras e números).',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textLight,
                      height: 1.4,
                    ),
                  ),

                  const SizedBox(height: 20),

                  // ── Campo: Confirmar Palavra-passe ───────────────────────
                  const FieldLabel(label: 'CONFIRMAR PALAVRA-PASSE'),
                  const SizedBox(height: 8),
                  AppTextField(
                    controller: _confirmarSenhaController,
                    hintText: '••••••••',
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
                        () => _confirmarSenhaVisivel = !_confirmarSenhaVisivel,
                      ),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ── Botão principal: Enviar ──────────────────────────────
                  FilledButton(
                    onPressed: _isLoading ? null : _handleEnviar,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      disabledBackgroundColor: AppColors.primary.withOpacity(
                        0.6,
                      ),
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(52),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      textStyle: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.3,
                        fontFamily: 'Poppins',
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

                  const SizedBox(height: 16),

                  // ── Link: Voltar ao Início de Sessão ─────────────────────
                  const Center(child: BackToLoginLink()),

                  const Spacer(),

                  // ── Footer ───────────────────────────────────────────────
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
