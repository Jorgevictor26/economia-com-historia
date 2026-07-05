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
    final screenWidth = MediaQuery.of(context).size.width;

    final sw = screenWidth / 390;
    final sh = screenHeight / 844;

    final bool pagina1 = data.textoNoTopo;
    final bool pagina3 = data.mostrarIcone;

    return Stack(
      fit: StackFit.expand,
      children: [
        // ───────────────── BACKGROUND ─────────────────
        Image.asset(
          data.imagemAsset,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) {
            return Container(color: AppColors.blush);
          },
        ),

        // ───────────────── OVERLAY ─────────────────
        Container(color: Colors.white.withValues(alpha: 0.48)),

        // ───────────────── CONTENT ─────────────────
        SafeArea(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 24 * sw),
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
                      style: TextStyle(
                        fontSize: 42 * sw,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                        height: 1.0,
                      ),
                    ),
                  ),

                  SizedBox(height: 40 * sh),

                  Align(
                    alignment: Alignment.centerLeft,
                    child: SizedBox(
                      width: 220 * sw,
                      child: Text(
                        data.subtitulo,
                        style: TextStyle(
                          fontSize: 18 * sw,
                          fontWeight: FontWeight.w400,
                          color: AppColors.textBordeaux,
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
                    style: TextStyle(
                      fontSize: 26 * sw,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                      height: 1.35,
                    ),
                  ),

                  SizedBox(height: 90 * sh),

                  Align(
                    alignment: Alignment.centerRight,
                    child: SizedBox(
                      width: 220 * sw,
                      child: Text(
                        data.subtitulo,
                        textAlign: TextAlign.left,
                        style: TextStyle(
                          fontSize: 18 * sw,
                          fontWeight: FontWeight.w400,
                          color: AppColors.textBordeaux,
                          height: 1.4,
                        ),
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
                    style: TextStyle(
                      fontSize: 18 * sw,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),

                  SizedBox(height: screenHeight * 0.08),

                  Image.asset(
                    'assets/images/Logo.png',
                    width: 95 * sw,
                    height: 95 * sw,
                    color: Colors.white,
                    colorBlendMode: BlendMode.srcIn,
                  ),

                  SizedBox(height: screenHeight * 0.08),

                  Text(
                    data.titulo,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28 * sw,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                      height: 1.2,
                    ),
                  ),

                  SizedBox(height: 55 * sh),

                  Text(
                    data.subtitulo,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 18 * sw,
                      fontWeight: FontWeight.w400,
                      color: AppColors.textBordeaux,
                    ),
                  ),

                  const Spacer(),
                ],

                // ───────────────── BOTÃO ─────────────────
                Align(
                  alignment: Alignment.centerRight,
                  child: SizedBox(
                    width: (pagina1 ? 185 : 160) * sw,
                    height: 56 * sh,
                    child: ElevatedButton(
                      onPressed: onAvancar,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: Text(
                        data.labelBotao,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 16 * sw,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),

                SizedBox(height: 95 * sh),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
