import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'package:flutter/gestures.dart';

class AuthHeader extends StatelessWidget {
  final String title;

  const AuthHeader({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: AppColors.borderSoft,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Image.asset(
            'assets/images/Logo.png',
            width: 80,
            height: 80,
            color: AppColors.primary,
          ),
        ),

        const SizedBox(height: 20),

        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
            height: 1.3,
            letterSpacing: 0.2,
          ),
        ),
      ],
    );
  }
}

class FieldLabel extends StatelessWidget {
  final String label;

  const FieldLabel({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 13.5,
        fontWeight: FontWeight.w600,
        color: AppColors.textDark,
        letterSpacing: 0.1,
      ),
    );
  }
}

class AppTextField extends StatelessWidget {
  final TextEditingController controller;

  final String hintText;

  final TextInputType keyboardType;

  final TextCapitalization textCapitalization;

  final bool obscureText;

  final Widget? suffixIcon;

  const AppTextField({
    super.key,
    required this.controller,
    required this.hintText,
    this.keyboardType = TextInputType.text,
    this.textCapitalization = TextCapitalization.none,
    this.obscureText = false,
    this.suffixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      textCapitalization: textCapitalization,
      obscureText: obscureText,

      style: const TextStyle(fontSize: 15, color: AppColors.textDark),

      decoration: InputDecoration(
        hintText: hintText,

        hintStyle: const TextStyle(fontSize: 14.5, color: AppColors.textMedium),

        suffixIcon: suffixIcon,

        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),

        filled: true,
        fillColor: AppColors.inputFill,

        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),

          borderSide: const BorderSide(color: AppColors.borderSoft, width: 1.2),
        ),

        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),

          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
      ),
    );
  }
}

class BackToLoginLink extends StatelessWidget {
  const BackToLoginLink({super.key});

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () {
        Navigator.pop(context);
      },

      child: const Text(
        'Voltar ao login',

        style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class LoginLink extends StatelessWidget {
  final VoidCallback? onTap;

  const LoginLink({super.key, this.onTap});

  @override
  Widget build(BuildContext context) {
    return RichText(
      textAlign: TextAlign.center,

      text: TextSpan(
        style: const TextStyle(fontSize: 14, color: AppColors.textMedium),

        children: [
          const TextSpan(text: 'Já possui uma conta?  '),

          TextSpan(
            text: 'Iniciar Sessão',

            style: const TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),

            recognizer: TapGestureRecognizer()..onTap = onTap,
          ),
        ],
      ),
    );
  }
}

class FooterSection extends StatelessWidget {
  const FooterSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,

          children: const [
            FooterLink(text: 'Ajuda'),

            FooterDot(),

            FooterLink(text: 'Privacidade'),

            FooterDot(),

            FooterLink(text: 'Termos'),
          ],
        ),

        const SizedBox(height: 10),

        const Text(
          '© 2024 Economia com História: Angola',

          style: TextStyle(
            fontSize: 11.5,
            color: AppColors.textLight,
            letterSpacing: 0.1,
          ),

          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class FooterLink extends StatelessWidget {
  final String text;

  const FooterLink({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},

      child: Text(
        text,

        style: const TextStyle(
          fontSize: 12.5,
          color: AppColors.textMedium,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}

class FooterDot extends StatelessWidget {
  const FooterDot({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 10),

      child: Text(
        '·',

        style: TextStyle(fontSize: 14, color: AppColors.textLight),
      ),
    );
  }
}
