import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/quiz.dart';
import '../services/quiz_service.dart';
import '../theme/app_colors.dart';
import '../widgets/app_bar_principal.dart';
import 'praticar_quiz_screen.dart';

class SelecaoQuizScreen extends StatefulWidget {
  const SelecaoQuizScreen({super.key});

  @override
  State<SelecaoQuizScreen> createState() => _SelecaoQuizScreenState();
}

class _SelecaoQuizScreenState extends State<SelecaoQuizScreen> {
  final _service = QuizService();

  bool _isLoading = true;
  String? _error;
  List<Quiz> _quizzes = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final response = await _service.getQuizzes();
      if (!mounted) return;
      setState(() => _quizzes = response.data);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar quizzes.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F5F5),
      appBar: const AppBarPrincipal(
        titulo: 'Quiz',
        mostrarFavoritos: true,
        mostrarPerfil: true,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
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
                    'Teste o seu dominio sobre a evolucao economica de Angola e do mundo.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textMedium,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 28),
                  if (_isLoading)
                    const LoadingState(message: 'A carregar quizzes...')
                  else if (_error != null)
                    ErrorState(message: _error!, onRetry: _load)
                  else if (_quizzes.isEmpty)
                    const EmptyState(message: 'Nenhum quiz disponível.')
                  else
                    _SecaoQuiz(
                      titulo: 'Quizzes disponiveis',
                      quizzes: _quizzes,
                    ),
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

class _SecaoQuiz extends StatelessWidget {
  final String titulo;
  final List<Quiz> quizzes;

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
        ...quizzes.map((quiz) => _QuizCard(quiz: quiz)),
      ],
    );
  }
}

class _QuizCard extends StatelessWidget {
  final Quiz quiz;

  const _QuizCard({required this.quiz});

  @override
  Widget build(BuildContext context) {
    final questionsCount = quiz.questionsCount > 0
        ? quiz.questionsCount
        : quiz.questions.length;
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            quiz.content?.contentType?.name.toUpperCase() ?? 'QUIZ',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textLight,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            quiz.title,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
              height: 1.2,
            ),
          ),
          if ((quiz.description ?? '').isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              quiz.description!,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textMedium,
                height: 1.4,
              ),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(
                Icons.quiz_outlined,
                size: 14,
                color: AppColors.textLight,
              ),
              const SizedBox(width: 5),
              Text(
                '$questionsCount questões',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textMedium,
                ),
              ),
              const SizedBox(width: 16),
              const Icon(
                Icons.access_time_rounded,
                size: 14,
                color: AppColors.textLight,
              ),
              const SizedBox(width: 5),
              Text(
                quiz.timeLimit == null ? 'Sem limite' : '${quiz.timeLimit} min',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textMedium,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => PraticarQuizScreen(quiz: quiz),
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
              child: const Text(
                'Iniciar agora',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
