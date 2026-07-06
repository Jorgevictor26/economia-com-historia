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
  static const _difficultyFilters = ['Todos', 'Facil', 'Medio', 'Dificil'];

  final _service = QuizService();

  bool _isLoading = true;
  String? _error;
  String _selectedDifficulty = 'Todos';
  List<Quiz> _quizzes = [];
  Map<int, QuizProgress> _progressByQuizId = {};
  QuizUserStats _stats = QuizUserStats.empty;

  @override
  void initState() {
    super.initState();
    _load();
  }

  List<Quiz> get _filteredQuizzes {
    final selected = _difficultyKey(_selectedDifficulty);
    if (selected == 'todos') return _quizzes;

    return _quizzes
        .where((quiz) => _difficultyKey(quiz.difficulty) == selected)
        .toList();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final response = await _service.getQuizzes();
      var progressByQuizId = <int, QuizProgress>{};
      var stats = QuizUserStats.empty;

      try {
        final progresses = await _service.getQuizProgress(limit: 12);
        progressByQuizId = {
          for (final progress in progresses) progress.quizId: progress,
        };
      } catch (_) {
        progressByQuizId = {};
      }

      try {
        stats = await _service.loadMyStats();
      } catch (_) {
        stats = QuizUserStats.empty;
      }

      if (!mounted) return;
      setState(() {
        _quizzes = response.data;
        _progressByQuizId = progressByQuizId;
        _stats = stats;
      });
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
    final filteredQuizzes = _filteredQuizzes;

    return Scaffold(
      backgroundColor: AppColors.soft,
      appBar: const AppBarPrincipal(
        titulo: 'Quiz',
        mostrarPesquisa: false,
        mostrarRankingGlobal: true,
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
                  const SizedBox(height: 24),
                  if (_isLoading)
                    const LoadingState(message: 'A carregar quizzes...')
                  else if (_error != null)
                    ErrorState(message: _error!, onRetry: _load)
                  else if (_quizzes.isEmpty)
                    const EmptyState(message: 'Nenhum quiz disponivel.')
                  else ...[
                    _DifficultyFilters(
                      filters: _difficultyFilters,
                      selected: _selectedDifficulty,
                      onSelected: (value) {
                        setState(() => _selectedDifficulty = value);
                      },
                    ),
                    const SizedBox(height: 16),
                    _QuizStatsBlock(stats: _stats),
                    const SizedBox(height: 22),
                    if (filteredQuizzes.isEmpty)
                      const EmptyState(
                        message: 'Nenhum quiz encontrado para este filtro.',
                      )
                    else
                      _SecaoQuiz(
                        titulo: 'Quizzes disponiveis',
                        quizzes: filteredQuizzes,
                        progressByQuizId: _progressByQuizId,
                        onQuizClosed: _load,
                      ),
                  ],
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

class _DifficultyFilters extends StatelessWidget {
  final List<String> filters;
  final String selected;
  final ValueChanged<String> onSelected;

  const _DifficultyFilters({
    required this.filters,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filters.map((filter) {
          final isSelected = filter == selected;

          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: OutlinedButton(
              onPressed: () => onSelected(filter),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(0, 42),
                padding: const EdgeInsets.symmetric(horizontal: 18),
                foregroundColor: isSelected
                    ? AppColors.cardBackground
                    : AppColors.textMedium,
                backgroundColor: isSelected
                    ? AppColors.primary
                    : AppColors.cardBackground,
                side: BorderSide(
                  color: isSelected
                      ? AppColors.primary
                      : AppColors.line,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Text(
                filter,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _QuizStatsBlock extends StatelessWidget {
  final QuizUserStats stats;

  const _QuizStatsBlock({required this.stats});

  @override
  Widget build(BuildContext context) {
    final items = [
      _StatItem(
        icon: Icons.military_tech_outlined,
        label: 'Pontuacao (XP)',
        value: '${stats.totalXp} XP',
      ),
      _StatItem(
        icon: Icons.leaderboard_outlined,
        label: 'Ranking',
        value: stats.rankingPosition == null
            ? 'Sem ranking'
            : '#${stats.rankingPosition}',
      ),
      _StatItem(
        icon: Icons.emoji_events_outlined,
        label: 'Completados',
        value: '${stats.completedQuizzes}',
      ),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.line),
        boxShadow: [
          BoxShadow(
            color: AppColors.ink.withValues(alpha: 0.04),
            blurRadius: 14,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'As tuas estatisticas',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: items
                .map(
                  (item) => Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(
                        right: item == items.last ? 0 : 8,
                      ),
                      child: _StatTile(item: item),
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _StatItem {
  final IconData icon;
  final String label;
  final String value;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
  });
}

class _StatTile extends StatelessWidget {
  final _StatItem item;

  const _StatTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 96),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.soft,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(item.icon, color: AppColors.primary, size: 23),
          const SizedBox(height: 8),
          Text(
            item.label,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: AppColors.textMedium,
              height: 1.15,
            ),
          ),
          const SizedBox(height: 5),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              item.value,
              maxLines: 1,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: AppColors.textDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SecaoQuiz extends StatelessWidget {
  final String titulo;
  final List<Quiz> quizzes;
  final Map<int, QuizProgress> progressByQuizId;
  final Future<void> Function() onQuizClosed;

  const _SecaoQuiz({
    required this.titulo,
    required this.quizzes,
    required this.progressByQuizId,
    required this.onQuizClosed,
  });

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
        ...quizzes.map(
          (quiz) => _QuizCard(
            quiz: quiz,
            progress: progressByQuizId[quiz.id],
            onQuizClosed: onQuizClosed,
          ),
        ),
      ],
    );
  }
}

class _QuizCard extends StatelessWidget {
  final Quiz quiz;
  final QuizProgress? progress;
  final Future<void> Function() onQuizClosed;

  const _QuizCard({
    required this.quiz,
    required this.onQuizClosed,
    this.progress,
  });

  @override
  Widget build(BuildContext context) {
    final questionsCount = quiz.questionsCount > 0
        ? quiz.questionsCount
        : quiz.questions.length;
    final progressPercent = (progress?.progressPercent ?? 0)
        .clamp(0, 100)
        .toInt();
    final hasIncompleteProgress = progress?.isIncomplete ?? false;
    final actionLabel = hasIncompleteProgress
        ? 'Continuar quiz'
        : 'Iniciar agora';
    final difficultyLabel = _difficultyLabel(quiz.difficulty);
    final categoryLabel =
        quiz.category?.name ??
        quiz.content?.category?.name ??
        quiz.content?.contentType?.name ??
        'Quiz';
    final summary =
        quiz.description ??
        quiz.content?.summary ??
        'Teste os conhecimentos deste conteudo.';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.line),
        boxShadow: [
          BoxShadow(
            color: AppColors.ink.withValues(alpha: 0.06),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _QuizCover(
            imageUrl: quiz.displayCover,
            categoryLabel: categoryLabel,
            difficultyLabel: difficultyLabel,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _CategoryBadge(label: categoryLabel),
                const SizedBox(height: 8),
                Text(
                  quiz.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    height: 1.12,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  summary,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMedium,
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 12),
                _ProgressBlock(progressPercent: progressPercent),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: AppColors.line)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      const Icon(
                        Icons.quiz_outlined,
                        size: 15,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          '$questionsCount perguntas',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textMedium,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                ConstrainedBox(
                  constraints: const BoxConstraints(
                    minWidth: 108,
                    maxWidth: 136,
                  ),
                  child: SizedBox(
                    height: 38,
                    child: ElevatedButton(
                      onPressed: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => PraticarQuizScreen(
                              quiz: quiz,
                              initialProgress: progress?.isIncomplete == true
                                  ? progress
                                  : null,
                            ),
                          ),
                        );
                        if (!context.mounted) return;
                        await onQuizClosed();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: AppColors.cardBackground,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(9),
                        ),
                        elevation: 0,
                      ),
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Text(
                          actionLabel,
                          maxLines: 1,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
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

class _QuizCover extends StatelessWidget {
  final String? imageUrl;
  final String categoryLabel;
  final String difficultyLabel;

  const _QuizCover({
    required this.imageUrl,
    required this.categoryLabel,
    required this.difficultyLabel,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 108,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (imageUrl == null)
            _DefaultQuizCover(
              categoryLabel: categoryLabel,
              difficultyLabel: difficultyLabel,
            )
          else
            Image.network(
              imageUrl!,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => _DefaultQuizCover(
                categoryLabel: categoryLabel,
                difficultyLabel: difficultyLabel,
              ),
            ),
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.ink.withValues(alpha: 0.02),
                  AppColors.ink.withValues(alpha: 0.50),
                ],
              ),
            ),
          ),
          Positioned(
            left: 14,
            top: 12,
            child: _DifficultyBadge(label: difficultyLabel),
          ),
        ],
      ),
    );
  }
}

class _DefaultQuizCover extends StatelessWidget {
  final String categoryLabel;
  final String difficultyLabel;

  const _DefaultQuizCover({
    required this.categoryLabel,
    required this.difficultyLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: AppColors.blush,
      child: Align(
        alignment: Alignment.bottomLeft,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.quiz_rounded, color: AppColors.primary, size: 28),
            const SizedBox(height: 6),
            Text(
              categoryLabel,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              difficultyLabel,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.textMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DifficultyBadge extends StatelessWidget {
  final String label;

  const _DifficultyBadge({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.cardBackground.withValues(alpha: 0.94),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: AppColors.primary,
        ),
      ),
    );
  }
}

class _CategoryBadge extends StatelessWidget {
  final String label;

  const _CategoryBadge({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.blush,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label.toUpperCase(),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: AppColors.accentGold,
        ),
      ),
    );
  }
}

class _ProgressBlock extends StatelessWidget {
  final int progressPercent;

  const _ProgressBlock({required this.progressPercent});

  @override
  Widget build(BuildContext context) {
    final normalized = progressPercent.clamp(0, 100).toInt();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: normalized / 100,
            minHeight: 6,
            backgroundColor: AppColors.blush,
            valueColor: AlwaysStoppedAnimation<Color>(
              _progressColor(normalized),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Progresso atual',
              style: TextStyle(fontSize: 11, color: AppColors.textLight),
            ),
            Text(
              '$normalized%',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

Color _progressColor(int progressPercent) {
  if (progressPercent >= 100) return AppColors.primaryHover;
  if (progressPercent >= 50) return AppColors.accentGold;
  return AppColors.primary;
}

String _difficultyKey(String? value) {
  final normalized = (value ?? '').trim().toLowerCase();
  if (normalized == 'todos') return 'todos';
  if (normalized.contains('facil')) return 'facil';
  if (normalized.contains('medio') || normalized.contains('media')) {
    return 'medio';
  }
  if (normalized.contains('dificil')) return 'dificil';
  return normalized;
}

String _difficultyLabel(String? value) {
  switch (_difficultyKey(value)) {
    case 'facil':
      return 'Facil';
    case 'medio':
      return 'Medio';
    case 'dificil':
      return 'Dificil';
    default:
      return 'Quiz';
  }
}
