import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';

class PraticarQuizScreen extends StatefulWidget {
  const PraticarQuizScreen({super.key});

  @override
  State<PraticarQuizScreen> createState() => _PraticarQuizScreenState();
}

class _PraticarQuizScreenState extends State<PraticarQuizScreen> {
  int? _respostaSelecionada;
  final int _respostaCorreta = 1;
  bool _mostrarFeedback = false;

  static const _opcoes = [
    'A diversificação imediata para a exportação de diamantes em larga escala.',
    'A transição forçada para a "economia legítima", focada em produtos agrícolas e matérias-primas.',
    'O isolamento total do porto de Luanda face aos mercados europeus.',
  ];

  void _selecionarResposta(int index) {
    if (_mostrarFeedback) return;
    setState(() {
      _respostaSelecionada = index;
      _mostrarFeedback = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            _BarraTopo(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    const Text(
                      'Qual foi o principal impacto económico da abolição do tráfico transatlântico na estruturamercantil de Luanda?',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                        height: 1.35,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ...List.generate(
                      _opcoes.length,
                      (i) => _OpcaoCard(
                        letra: String.fromCharCode(65 + i),
                        texto: _opcoes[i],
                        estado: _calcularEstado(i),
                        onTap: () => _selecionarResposta(i),
                      ),
                    ),
                    if (_mostrarFeedback) ...[
                      const SizedBox(height: 16),
                      const _FeedbackCard(),
                    ],
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
            _BotaoContinuar(
              ativo: _respostaSelecionada != null,
              onTap: () => Navigator.maybePop(context),
            ),
          ],
        ),
      ),
    );
  }

  _EstadoOpcao _calcularEstado(int i) {
    if (!_mostrarFeedback) {
      return i == _respostaSelecionada
          ? _EstadoOpcao.selecionada
          : _EstadoOpcao.neutra;
    }
    if (i == _respostaCorreta) return _EstadoOpcao.correta;
    if (i == _respostaSelecionada) return _EstadoOpcao.errada;
    return _EstadoOpcao.neutra;
  }
}

class _BarraTopo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => Navigator.maybePop(context),
                child: const Icon(
                  Icons.close_rounded,
                  color: AppColors.textMedium,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: 12 / 20,
                    minHeight: 5,
                    backgroundColor: const Color(0xFFEEE8E9),
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            'PERGUNTA 12/20',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
              letterSpacing: 0.8,
            ),
          ),
        ],
      ),
    );
  }
}

enum _EstadoOpcao { neutra, selecionada, correta, errada }

class _OpcaoCard extends StatelessWidget {
  final String letra;
  final String texto;
  final _EstadoOpcao estado;
  final VoidCallback onTap;

  const _OpcaoCard({
    required this.letra,
    required this.texto,
    required this.estado,
    required this.onTap,
  });

  static const _verde = Color(0xFF2E7D32);
  static const _verdeClaro = Color(0xFFF1FAF1);
  static const _verdeBorda = Color(0xFF4CAF50);
  static const _verdeLetra = Color(0xFF388E3C);

  @override
  Widget build(BuildContext context) {
    final Color bordaColor;
    final Color fundoColor;
    final Color letraFundoColor;
    final Color letraTextColor;
    final Color textoColor;
    final FontWeight textoWeight;
    Widget? iconeDir;

    switch (estado) {
      case _EstadoOpcao.correta:
        bordaColor = _verdeBorda;
        fundoColor = _verdeClaro;
        letraFundoColor = _verdeLetra;
        letraTextColor = Colors.white;
        textoColor = _verde;
        textoWeight = FontWeight.w700;
        iconeDir = const Icon(
          Icons.check_circle_rounded,
          color: _verdeBorda,
          size: 22,
        );
        break;
      case _EstadoOpcao.errada:
        bordaColor = Colors.redAccent;
        fundoColor = const Color(0xFFFFF0F0);
        letraFundoColor = Colors.redAccent;
        letraTextColor = Colors.white;
        textoColor = Colors.redAccent;
        textoWeight = FontWeight.w500;
        iconeDir = null;
        break;
      case _EstadoOpcao.selecionada:
        bordaColor = AppColors.primary;
        fundoColor = const Color(0xFFF7EEF0);
        letraFundoColor = AppColors.primary;
        letraTextColor = Colors.white;
        textoColor = AppColors.primary;
        textoWeight = FontWeight.w600;
        iconeDir = null;
        break;
      default:
        bordaColor = const Color(0xFFDDD5D6);
        fundoColor = Colors.white;
        letraFundoColor = const Color(0xFFF0EAEA);
        letraTextColor = AppColors.textMedium;
        textoColor = AppColors.textMedium;
        textoWeight = FontWeight.w400;
        iconeDir = null;
    }

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
        decoration: BoxDecoration(
          color: fundoColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: bordaColor, width: 1.5),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: letraFundoColor,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  letra,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: letraTextColor,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  texto,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: textoWeight,
                    color: textoColor,
                    height: 1.45,
                  ),
                ),
              ),
            ),
            if (iconeDir != null) ...[
              const SizedBox(width: 8),
              Padding(padding: const EdgeInsets.only(top: 4), child: iconeDir),
            ],
          ],
        ),
      ),
    );
  }
}

class _FeedbackCard extends StatelessWidget {
  const _FeedbackCard();

  static const _verde = Color(0xFF2E7D32);
  static const _verdeClaro = Color(0xFFF1FAF1);
  static const _verdeBorda = Color(0xFFBCDFBC);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _verdeClaro,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _verdeBorda, width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.school_outlined, color: _verde, size: 20),
              SizedBox(width: 8),
              Text(
                'Excelente Raciocínio!',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: _verde,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Com a proibição do tráfico de escravos, a elite mercantil de Luanda viu-se obrigada a reorientar os seus capitais para o comércio de bens como o óleo de palma, marfim e cera de abelha. Este período marcou o início de uma transformação estrutural que tentou integrar o interior de Angola em circuitos comerciais produtivos, alterando permanentemente a dinâmica entre o litoral e o sertão.',
            style: TextStyle(
              fontSize: 13,
              color: Color(0xFF3D3D3D),
              height: 1.6,
            ),
          ),
          const SizedBox(height: 14),
          const Divider(color: _verdeBorda, height: 1),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () {},
            child: Row(
              children: const [
                Icon(Icons.menu_book_outlined, color: _verde, size: 16),
                SizedBox(width: 6),
                Text(
                  'Ler conteúdo relacionado',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: _verde,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BotaoContinuar extends StatelessWidget {
  final bool ativo;
  final VoidCallback onTap;

  const _BotaoContinuar({required this.ativo, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFEEE8E9))),
      ),
      child: SizedBox(
        width: double.infinity,
        height: 52,
        child: ElevatedButton(
          onPressed: ativo ? onTap : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            disabledBackgroundColor: const Color(0xFFEEE8E9),
            foregroundColor: Colors.white,
            disabledForegroundColor: AppColors.textLight,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            elevation: 0,
          ),
          child: const Text(
            'Continuar',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ),
      ),
    );
  }
}
