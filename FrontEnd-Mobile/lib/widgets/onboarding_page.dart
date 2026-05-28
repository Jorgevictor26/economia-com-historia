import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class OnboardingPageData {
  final String titulo;
  final String subtitulo;
  final String labelBotao;
  final String imagemAsset;
  final bool mostrarIcone;
  final String? tituloTopo;
  final bool textoNoTopo;

  const OnboardingPageData({
    required this.titulo,
    required this.subtitulo,
    required this.labelBotao,
    required this.imagemAsset,
    this.mostrarIcone = false,
    this.tituloTopo,
    this.textoNoTopo = false,
  });
}

class OnboardingPage extends StatelessWidget {
  final OnboardingPageData data;
  final VoidCallback onAvancar;

  const OnboardingPage({
    super.key,
    required this.data,
    required this.onAvancar,
  });

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;

    final bool pagina1 = data.textoNoTopo;
    final bool pagina3 = data.mostrarIcone;

    return Stack(
      fit: StackFit.expand,
      children: [
        // ───────────────── BACKGROUND ─────────────────
        Image.asset(
          data.imagemAsset,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) {
            return Container(color: const Color(0xFFF3EEEE));
          },
        ),

        // ───────────────── OVERLAY ─────────────────
        Container(color: Colors.white.withOpacity(0.48)),

        // ───────────────── CONTENT ─────────────────
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                // =====================================================
                // PÁGINA 1
                // =====================================================
                if (pagina1) ...[
                  SizedBox(height: screenHeight * 0.08),

                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      data.titulo,
                      style: const TextStyle(
                        fontSize: 42,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                        height: 1.0,
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),

                  Align(
                    alignment: Alignment.centerLeft,
                    child: SizedBox(
                      width: 220,
                      child: Text(
                        data.subtitulo,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w400,
                          color: AppColors.primaryDark,
                          height: 1.35,
                        ),
                      ),
                    ),
                  ),

                  const Spacer(),
                ],

                // =====================================================
                // PÁGINA 2
                // =====================================================
                if (!pagina1 && !pagina3) ...[
                  SizedBox(height: screenHeight * 0.28),

                  Text(
                    data.titulo,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                      height: 1.35,
                    ),
                  ),

                  const SizedBox(height: 90),

                  SizedBox(
                    width: 260,
                    child: Text(
                      data.subtitulo,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w400,
                        color: AppColors.primaryDark,
                        height: 1.4,
                      ),
                    ),
                  ),

                  const Spacer(),
                ],

                // =====================================================
                // PÁGINA 3
                // =====================================================
                if (pagina3) ...[
                  SizedBox(height: screenHeight * 0.06),

                  Text(
                    data.tituloTopo ?? '',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),

                  SizedBox(height: screenHeight * 0.08),

                  Image.asset(
                    'assets/images/Logo.png',
                    width: 95,
                    height: 95,
                    color: Colors.white,
                    colorBlendMode: BlendMode.srcIn,
                  ),

                  SizedBox(height: screenHeight * 0.08),

                  Text(
                    data.titulo,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                      height: 1.2,
                    ),
                  ),

                  const SizedBox(height: 55),

                  Text(
                    data.subtitulo,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w400,
                      color: AppColors.primaryDark,
                    ),
                  ),

                  const Spacer(),
                ],

                // ───────────────── BOTÃO ─────────────────
                Align(
                  alignment: Alignment.centerRight,
                  child: SizedBox(
                    width: pagina1 ? 185 : 160,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: onAvancar,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Text(
                        data.labelBotao,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 95),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
