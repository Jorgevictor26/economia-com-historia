import 'package:flutter/material.dart';
import 'package:economica_com_historia/theme/app_colors.dart';
import 'package:economica_com_historia/Screens/praticar_quiz_screen.dart';

class SelecaoQuizScreen extends StatelessWidget {
  const SelecaoQuizScreen({super.key});

  static const _ciclosColoniais = [
    _QuizItem(
      nivel: 'INICIANTE',
      titulo: 'O Ciclo da Borracha e Marfim',
      questoes: 15,
      tempo: '10 min',
      progresso: 0.80,
      icone: Icons.swap_horiz_rounded,
      isPremium: false,
      acaoBotao: 'Continuar Quiz',
    ),
    _QuizItem(
      nivel: 'INTERMÉDIO',
      titulo: 'Comércio Transatlântico',
      questoes: 20,
      tempo: '15 min',
      progresso: 0.0,
      icone: Icons.sailing_outlined,
      isPremium: false,
      acaoBotao: 'Iniciar Agora',
    ),
  ];

  static const _historiaMonetaria = [
    _QuizItem(
      nivel: 'AVANÇADO',
      titulo: 'Do Zimbo ao Kwanza',
      questoes: 25,
      tempo: 'Expertise',
      progresso: 0.45,
      icone: Icons.point_of_sale_outlined,
      isPremium: true,
      acaoBotao: 'Retomar Desafio',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F5F5),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _AppBar()),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 12),
                  const Text(
                    'O Desafio do\nConhecimento',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Teste o seu domínio sobre a evolução económica de Angola e do mundo através de quizzes estruturados por especialistas.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textMedium,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 32),
                  _SecaoQuiz(
                    titulo: 'Ciclos Coloniais',
                    quizzes: _ciclosColoniais,
                  ),
                  const SizedBox(height: 28),
                  _SecaoQuiz(
                    titulo: 'História Monetária',
                    quizzes: _historiaMonetaria,
                  ),
                  const SizedBox(height: 28),
                  _CitacaoCard(),
                  const SizedBox(height: 36),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AppBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.maybePop(context),
            child: const Icon(
              Icons.chevron_left_rounded,
              color: AppColors.primary,
              size: 26,
            ),
          ),
          const SizedBox(width: 4),
          const Text(
            'Quiz',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
          const Spacer(),
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.notifications_none_rounded,
              color: AppColors.textDark,
            ),
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.search_rounded, color: AppColors.textDark),
          ),
        ],
      ),
    );
  }
}

class _QuizItem {
  final String nivel;
  final String titulo;
  final int questoes;
  final String tempo;
  final double progresso;
  final IconData icone;
  final bool isPremium;
  final String acaoBotao;

  const _QuizItem({
    required this.nivel,
    required this.titulo,
    required this.questoes,
    required this.tempo,
    required this.progresso,
    required this.icone,
    required this.isPremium,
    required this.acaoBotao,
  });
}

class _SecaoQuiz extends StatelessWidget {
  final String titulo;
  final List<_QuizItem> quizzes;

  const _SecaoQuiz({required this.titulo, required this.quizzes});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 4,
              height: 22,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              titulo,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textDark,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...quizzes.map((q) => _QuizCard(item: q)),
      ],
    );
  }
}

class _QuizCard extends StatelessWidget {
  final _QuizItem item;

  const _QuizCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final temProgresso = item.progresso > 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        _NivelBadge(nivel: item.nivel),
                        if (item.isPremium) ...[
                          const SizedBox(width: 6),
                          _PremiumBadge(),
                        ],
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item.titulo,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFFF0EAEA),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(item.icone, color: AppColors.primary, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(
                Icons.grid_view_rounded,
                size: 14,
                color: AppColors.textLight,
              ),
              const SizedBox(width: 5),
              Text(
                '${item.questoes} Questões',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textMedium,
                ),
              ),
              const SizedBox(width: 16),
              Icon(
                item.tempo == 'Expertise'
                    ? Icons.workspace_premium_outlined
                    : Icons.access_time_rounded,
                size: 14,
                color: AppColors.textLight,
              ),
              const SizedBox(width: 5),
              Text(
                item.tempo,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textMedium,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Progresso',
                style: TextStyle(fontSize: 13, color: AppColors.textMedium),
              ),
              Text(
                '${(item.progresso * 100).toInt()}%',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: item.progresso,
              minHeight: 4,
              backgroundColor: const Color(0xFFEEE8E9),
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: temProgresso
                ? ElevatedButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const PraticarQuizScreen(),
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      '${item.acaoBotao}  →',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  )
                : OutlinedButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const PraticarQuizScreen(),
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(
                        color: AppColors.primary,
                        width: 1.5,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      '${item.acaoBotao}  ▶',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _NivelBadge extends StatelessWidget {
  final String nivel;

  const _NivelBadge({required this.nivel});

  @override
  Widget build(BuildContext context) {
    return Text(
      nivel,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: AppColors.textLight,
        letterSpacing: 0.5,
      ),
    );
  }
}

class _PremiumBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(6),
      ),
      child: const Text(
        'PREMIUM',
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: Colors.white,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}

class _CitacaoCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Stack(
        children: [
          Image.asset(
            'images/Academy_Learning.png',
            width: double.infinity,
            height: 200,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) =>
                Container(height: 160, color: AppColors.primaryDark),
          ),
          Container(
            height: 160,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.3),
                  Colors.black.withOpacity(0.65),
                ],
              ),
            ),
          ),
          const SizedBox(
            height: 160,
            child: Center(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 24),
                child: Text(
                  '"O conhecimento é o único capital que não se deprecia."',
                  textAlign: TextAlign.left,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    height: 1.5,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
