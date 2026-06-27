// Indicador de progresso em pontos para o onboarding
// O ponto ativo é maior e mais escuro

import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class DotIndicator extends StatelessWidget {
  final int total;
  final int atual;

  const DotIndicator({super.key, required this.total, required this.atual});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(total, (index) {
        final isAtivo = index == atual;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: isAtivo ? 28 : 10,
          height: 6,
          decoration: BoxDecoration(
            color: isAtivo
                ? AppColors.primary
                : AppColors.primary.withValues(alpha: 0.35),
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}
