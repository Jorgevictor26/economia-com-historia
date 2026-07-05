import 'dart:async';

import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/content.dart';
import '../models/quiz.dart';
import '../services/quiz_service.dart';
import '../theme/app_colors.dart';
import 'conteudo_screen.dart';

class PraticarQuizScreen extends StatefulWidget {
  final Quiz quiz;
  final QuizProgress? initialProgress;

  const PraticarQuizScreen({
    super.key,
    required this.quiz,
    this.initialProgress,
  });

  @override
  State<PraticarQuizScreen> createState() => _PraticarQuizScreenState();
}

class _PraticarQuizScreenState extends State<PraticarQuizScreen> {
  final _service = QuizService();
  late DateTime _startedAt;
  late DateTime _questionStartedAt;
  Timer? _questionTimer;

  bool _isLoading = true;
  bool _isLoadInFlight = false;
  bool _isSubmitting = false;
  bool _resumePromptVisible = false;
  String? _error;
  List<Question> _questions = [];
  int _currentIndex = 0;
  String? _selectedOption;
  bool _answerFeedbackVisible = false;
  Content? _relatedContent;
  QuizProgress? _savedProgress;
  QuizResult? _result;
  final Map<int, String> _answers = {};
  final Map<int, int> _answerAlternativeIds = {};
  final Map<int, int> _answerElapsedSeconds = {};
  int? _remainingQuestionSeconds;

  @override
  void initState() {
    super.initState();
    _startedAt = DateTime.now().toUtc();
    _questionStartedAt = DateTime.now().toUtc();
    _relatedContent = widget.quiz.content;
    _load();
  }

  @override
  void dispose() {
    _questionTimer?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    if (_isLoadInFlight) return;

    _isLoadInFlight = true;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      _relatedContent = widget.quiz.content;
      var questions = await _questionsForPractice();
      final savedProgress = await _progressToResume();
      if (savedProgress != null && savedProgress.questionOrder.isNotEmpty) {
        questions = _orderedQuestions(questions, savedProgress.questionOrder);
      }
      if (!mounted) return;
      setState(() {
        _questions = questions;
        _savedProgress = savedProgress;
        _resumePromptVisible = savedProgress != null;
        _remainingQuestionSeconds =
            savedProgress == null && questions.isNotEmpty
            ? _timeLimitForQuestion(questions.first)
            : null;
      });
      if (savedProgress == null) {
        _startQuestionTimer();
      } else {
        _questionTimer?.cancel();
      }
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar questões.');
    } finally {
      _isLoadInFlight = false;
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<List<Question>> _questionsForPractice() async {
    if (widget.quiz.questions.isNotEmpty) {
      return widget.quiz.questions;
    }

    try {
      final quiz = await _service.getQuiz(widget.quiz.id);
      _relatedContent = quiz.content ?? _relatedContent;
      if (quiz.questions.isNotEmpty) return quiz.questions;
    } on NotFoundException {
      return _service.getQuestions(widget.quiz.id);
    }

    return _service.getQuestions(widget.quiz.id);
  }

  Question get _question => _questions[_currentIndex];

  void _selecionarResposta(String option) {
    if (_answerFeedbackVisible) return;

    _questionTimer?.cancel();
    setState(() {
      _selectedOption = option;
      _answerFeedbackVisible = true;
    });
    _recordCurrentAnswer();

    final currentQuestionIndex = _currentIndex < _questions.length - 1
        ? _currentIndex + 1
        : _currentIndex;
    _guardarProgresso(currentQuestionIndex: currentQuestionIndex);
  }

  Future<void> _continuar() async {
    if (_selectedOption == null) return;

    _recordCurrentAnswer();

    if (_currentIndex < _questions.length - 1) {
      final nextIndex = _currentIndex + 1;
      _guardarProgresso(currentQuestionIndex: nextIndex);
      setState(() {
        _currentIndex = nextIndex;
        _selectedOption = _answers[_questions[nextIndex].id];
        _answerFeedbackVisible = _selectedOption != null;
        _questionStartedAt = DateTime.now().toUtc();
        _remainingQuestionSeconds = _answerFeedbackVisible
            ? null
            : _timeLimitForQuestion(_questions[nextIndex]);
      });
      if (!_answerFeedbackVisible) _startQuestionTimer();
      return;
    }
    await _submit();
  }

  Future<void> _submit() async {
    if (_selectedOption != null) {
      _recordCurrentAnswer();
    }
    if (_answers.length != _questions.length) {
      _showSnackBar('Responda a todas as perguntas antes de submeter.');
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final result = await _service.submitQuiz(
        quizId: widget.quiz.id,
        startedAt: _startedAt,
        elapsedSeconds: _elapsedSeconds,
        answers: _answers,
        alternativeIds: _answerAlternativeIds,
        elapsedByQuestion: _answerElapsedSeconds,
      );
      _guardarProgresso(completed: true);
      if (!mounted) return;
      setState(() => _result = result);
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } catch (_) {
      if (mounted) _showSnackBar('Erro ao submeter respostas.');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  int get _elapsedSeconds {
    return DateTime.now()
        .toUtc()
        .difference(_startedAt)
        .inSeconds
        .clamp(0, 86400)
        .toInt();
  }

  int get _currentQuestionElapsedSeconds {
    return DateTime.now()
        .toUtc()
        .difference(_questionStartedAt)
        .inSeconds
        .clamp(0, 86400)
        .toInt();
  }

  int? _timeLimitForQuestion(Question question) {
    final questionLimit = question.timeSeconds;
    if (questionLimit != null && questionLimit > 0) return questionLimit;

    final quizLimit = widget.quiz.timeLimit;
    if (quizLimit != null && quizLimit > 0) return quizLimit;

    return null;
  }

  void _startQuestionTimer() {
    _questionTimer?.cancel();
    if (_questions.isEmpty || _answerFeedbackVisible || _resumePromptVisible) {
      return;
    }

    final limit = _timeLimitForQuestion(_question);
    setState(() => _remainingQuestionSeconds = limit);
    if (limit == null) return;

    _questionTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted || _answerFeedbackVisible || _resumePromptVisible) {
        timer.cancel();
        return;
      }

      final current = _remainingQuestionSeconds;
      if (current == null || current <= 0) {
        timer.cancel();
        return;
      }

      setState(() => _remainingQuestionSeconds = current - 1);
    });
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _guardarProgresso({bool completed = false, int? currentQuestionIndex}) {
    if (_questions.isEmpty) return;
    final progress = completed
        ? 100
        : _answers.isEmpty
        ? 0
        : ((_answers.length / _questions.length) * 100)
              .round()
              .clamp(1, 99)
              .toInt();
    unawaited(
      _persistirProgresso(
        progress,
        currentQuestionIndex: currentQuestionIndex ?? _currentIndex,
      ),
    );
  }

  Future<void> _persistirProgresso(
    int progressPercent, {
    int? currentQuestionIndex,
  }) async {
    try {
      await _service.updateProgress(
        quizId: widget.quiz.id,
        progressPercent: progressPercent,
        currentQuestionIndex: currentQuestionIndex ?? _currentIndex,
        answeredQuestions: _answers,
        alternativeIds: _answerAlternativeIds,
        elapsedSeconds: _elapsedSeconds,
        questionOrder: _questions.map((question) => question.id).toList(),
      );
    } catch (_) {
      // O quiz continua mesmo que o progresso não consiga sincronizar agora.
    }
  }

  Future<QuizProgress?> _progressToResume() async {
    final initialProgress = widget.initialProgress;
    try {
      final progress = await _service.getQuizProgressForQuiz(widget.quiz.id);
      if (progress != null) return progress.isIncomplete ? progress : null;
    } catch (_) {
      // Mantem compatibilidade com backends sem o endpoint especifico.
    }

    if (initialProgress != null && initialProgress.isIncomplete) {
      return initialProgress;
    }

    try {
      final progresses = await _service.getQuizProgress(limit: 12);
      return progresses
          .where((progress) => progress.quizId == widget.quiz.id)
          .where((progress) => progress.isIncomplete)
          .firstOrNull;
    } catch (_) {
      return null;
    }
  }

  void _recordCurrentAnswer() {
    final selected = _selectedOption;
    if (selected == null) return;

    final selectedOption = _question.options
        .where((option) => option.key == selected)
        .firstOrNull;

    _answers[_question.id] = selected;
    _answerElapsedSeconds[_question.id] = _currentQuestionElapsedSeconds;
    if (selectedOption?.id != null) {
      _answerAlternativeIds[_question.id] = selectedOption!.id!;
    } else {
      _answerAlternativeIds.remove(_question.id);
    }
  }

  void _continueSavedProgress() {
    final progress = _savedProgress;
    if (progress == null || _questions.isEmpty) {
      setState(() => _resumePromptVisible = false);
      return;
    }

    final answers = <int, String>{};
    final alternativeIds = <int, int>{};
    final elapsedSeconds = <int, int>{};
    final answeredIds = <int>{...progress.answeredQuestionIds};

    for (final answer in progress.answers) {
      final question = _questions
          .where((item) => item.id == answer.questionId)
          .firstOrNull;
      if (question == null) continue;

      answeredIds.add(answer.questionId);
      final selectedOption =
          answer.selectedOption ??
          _optionKeyForAlternative(question, answer.alternativeId);

      if (selectedOption != null) {
        answers[answer.questionId] = selectedOption;
      }
      if (answer.alternativeId != null) {
        alternativeIds[answer.questionId] = answer.alternativeId!;
      }
      if (answer.elapsedSeconds != null) {
        elapsedSeconds[answer.questionId] = answer.elapsedSeconds!;
      }
    }

    final resumeIndex = _resumeIndexForProgress(progress, answeredIds);

    setState(() {
      _answers
        ..clear()
        ..addAll(answers);
      _answerAlternativeIds
        ..clear()
        ..addAll(alternativeIds);
      _answerElapsedSeconds
        ..clear()
        ..addAll(elapsedSeconds);
      _currentIndex = resumeIndex;
      _selectedOption = _answers[_questions[_currentIndex].id];
      _answerFeedbackVisible = _selectedOption != null;
      _startedAt = DateTime.now().toUtc().subtract(
        Duration(seconds: progress.elapsedSeconds),
      );
      _questionStartedAt = DateTime.now().toUtc();
      _remainingQuestionSeconds = _selectedOption == null
          ? _timeLimitForQuestion(_questions[_currentIndex])
          : null;
      _resumePromptVisible = false;
    });
    if (_selectedOption == null) _startQuestionTimer();
  }

  Future<void> _restartQuiz() async {
    _questionTimer?.cancel();
    setState(() {
      _answers.clear();
      _answerAlternativeIds.clear();
      _answerElapsedSeconds.clear();
      _currentIndex = 0;
      _selectedOption = null;
      _answerFeedbackVisible = false;
      _startedAt = DateTime.now().toUtc();
      _questionStartedAt = DateTime.now().toUtc();
      _remainingQuestionSeconds = _questions.isEmpty
          ? null
          : _timeLimitForQuestion(_questions.first);
      _resumePromptVisible = false;
      _result = null;
    });
    _startQuestionTimer();

    await _persistirProgresso(0, currentQuestionIndex: 0);
  }

  List<Question> _orderedQuestions(List<Question> questions, List<int> order) {
    if (order.isEmpty) return questions;

    final byId = {for (final question in questions) question.id: question};
    final ordered = order
        .map((questionId) => byId[questionId])
        .whereType<Question>()
        .toList();

    if (ordered.length != questions.length) return questions;
    return ordered;
  }

  String? _optionKeyForAlternative(Question question, int? alternativeId) {
    if (alternativeId == null) return null;

    return question.options
        .where((option) => option.id == alternativeId)
        .map((option) => option.key)
        .firstOrNull;
  }

  int _resumeIndexForProgress(QuizProgress progress, Set<int> answeredIds) {
    if (_questions.isEmpty) return 0;

    if (answeredIds.isNotEmpty) {
      final nextUnanswered = _questions.indexWhere(
        (question) => !answeredIds.contains(question.id),
      );
      if (nextUnanswered >= 0) return nextUnanswered;
    }

    final estimatedIndex =
        ((progress.progressPercent.clamp(0, 99) / 100) * _questions.length)
            .floor();
    final storedIndex = progress.currentQuestionIndex;
    final preferredIndex = storedIndex == null
        ? estimatedIndex
        : (estimatedIndex > storedIndex ? estimatedIndex : storedIndex);

    return preferredIndex.clamp(0, _questions.length - 1).toInt();
  }

  bool get _selectedAnswerIsCorrect {
    final selected = _selectedOption;
    final correct = _question.correctOption.toLowerCase();
    if (selected == null || correct.isEmpty) return false;

    return selected.toLowerCase() == correct;
  }

  String get _correctAnswerText {
    final correctKey = _question.correctOption.toLowerCase();
    if (correctKey.isEmpty) return 'Nao disponivel';

    final option = _question.options
        .where((item) => item.key.toLowerCase() == correctKey)
        .firstOrNull;

    if (option == null) return correctKey.toUpperCase();
    return '${option.key.toUpperCase()}. ${option.text}';
  }

  void _openRelatedContent() {
    final content = _relatedContent;
    if (content == null) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) =>
            ConteudoScreen(contentId: content.id, initialContent: content),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final result = _result;

    return Scaffold(
      backgroundColor: AppColors.cardBackground,
      body: SafeArea(
        child: _isLoading
            ? const LoadingState(message: 'A carregar quiz...')
            : _error != null
            ? ErrorState(message: _error!, onRetry: _load)
            : _questions.isEmpty
            ? const EmptyState(message: 'Este quiz ainda não tem questões.')
            : result != null
            ? _ResultadoQuiz(
                result: result,
                onRestart: _restartQuiz,
                onClose: () => Navigator.maybePop(context),
                relatedContent: _relatedContent,
                onOpenRelatedContent: _relatedContent == null
                    ? null
                    : _openRelatedContent,
              )
            : Column(
                children: [
                  _BarraTopo(
                    current: _currentIndex + 1,
                    total: _questions.length,
                    progress: (_currentIndex + 1) / _questions.length,
                    remainingSeconds: _remainingQuestionSeconds,
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: _resumePromptVisible
                          ? _ResumoProgressoQuiz(
                              progress: _savedProgress,
                              onContinue: _continueSavedProgress,
                              onRestart: _restartQuiz,
                            )
                          : Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 20),
                                Text(
                                  _question.question,
                                  style: const TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                    height: 1.35,
                                  ),
                                ),
                                const SizedBox(height: 24),
                                ..._question.options.map(
                                  (option) => _OpcaoCard(
                                    letra: option.key.toUpperCase(),
                                    texto: option.text,
                                    estado: _estado(option.key),
                                    onTap: _answerFeedbackVisible
                                        ? null
                                        : () => _selecionarResposta(option.key),
                                  ),
                                ),
                                if (_answerFeedbackVisible) ...[
                                  const SizedBox(height: 12),
                                  _FeedbackRespostaQuiz(
                                    isCorrect: _selectedAnswerIsCorrect,
                                    correctAnswer: _correctAnswerText,
                                    explanation: _question.explanation,
                                    relatedContent: _relatedContent,
                                    onOpenRelatedContent:
                                        _relatedContent == null
                                        ? null
                                        : _openRelatedContent,
                                  ),
                                ],
                                const SizedBox(height: 24),
                              ],
                            ),
                    ),
                  ),
                  if (!_resumePromptVisible)
                    _BotaoContinuar(
                      ativo: _selectedOption != null && !_isSubmitting,
                      isSubmitting: _isSubmitting,
                      label: _currentIndex == _questions.length - 1
                          ? 'Submeter'
                          : 'Continuar',
                      onTap: _continuar,
                    ),
                ],
              ),
      ),
    );
  }

  _EstadoOpcao _estado(String option) {
    if (!_answerFeedbackVisible) {
      return option == _selectedOption
          ? _EstadoOpcao.selecionada
          : _EstadoOpcao.neutra;
    }

    final selected = _selectedOption?.toLowerCase();
    final correct = _question.correctOption.toLowerCase();
    final normalizedOption = option.toLowerCase();

    if (correct.isEmpty) {
      return normalizedOption == selected
          ? _EstadoOpcao.selecionada
          : _EstadoOpcao.bloqueada;
    }
    if (normalizedOption == correct) return _EstadoOpcao.correta;
    if (normalizedOption == selected) return _EstadoOpcao.incorreta;
    return _EstadoOpcao.bloqueada;
  }
}

class _ResumoProgressoQuiz extends StatelessWidget {
  final QuizProgress? progress;
  final VoidCallback onContinue;
  final Future<void> Function() onRestart;

  const _ResumoProgressoQuiz({
    required this.progress,
    required this.onContinue,
    required this.onRestart,
  });

  @override
  Widget build(BuildContext context) {
    final percent = progress?.progressPercent ?? 0;

    return Padding(
      padding: const EdgeInsets.only(top: 28, bottom: 28),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.sand),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink.withValues(alpha: 0.06),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'QUIZ EM PROGRESSO',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: AppColors.secondary,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Continuar quiz?',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Encontramos uma tentativa guardada com $percent% de progresso.',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textMedium,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: onContinue,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.cardBackground,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Continuar quiz',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton(
                onPressed: () => unawaited(onRestart()),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.sand),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Recomecar quiz',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeedbackRespostaQuiz extends StatelessWidget {
  final bool isCorrect;
  final String correctAnswer;
  final String? explanation;
  final Content? relatedContent;
  final VoidCallback? onOpenRelatedContent;

  const _FeedbackRespostaQuiz({
    required this.isCorrect,
    required this.correctAnswer,
    required this.explanation,
    required this.relatedContent,
    required this.onOpenRelatedContent,
  });

  @override
  Widget build(BuildContext context) {
    final color = isCorrect ? AppColors.success : AppColors.textBordeaux;
    final backgroundColor = isCorrect ? AppColors.successSoft : AppColors.blush;
    final content = relatedContent;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isCorrect ? Icons.check_circle_rounded : Icons.cancel_rounded,
                color: color,
                size: 24,
              ),
              const SizedBox(width: 8),
              Text(
                isCorrect ? 'Acertou!' : 'Ainda nao.',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text.rich(
            TextSpan(
              text: 'Resposta certa: ',
              children: [
                TextSpan(
                  text: correctAnswer,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ],
            ),
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textDark,
              height: 1.5,
            ),
          ),
          if ((explanation ?? '').trim().isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              explanation!.trim(),
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textMedium,
                height: 1.5,
              ),
            ),
          ],
          if (content != null && onOpenRelatedContent != null) ...[
            const SizedBox(height: 12),
            Text(
              'Encontra isto em: ${content.title}',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textMedium,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 6),
            TextButton.icon(
              onPressed: onOpenRelatedContent,
              icon: const Icon(Icons.menu_book_rounded, size: 18),
              label: const Text('Ver conteudo relacionado'),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.primary,
                padding: EdgeInsets.zero,
                textStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ResultadoQuiz extends StatelessWidget {
  final QuizResult result;
  final Future<void> Function() onRestart;
  final VoidCallback onClose;
  final Content? relatedContent;
  final VoidCallback? onOpenRelatedContent;

  const _ResultadoQuiz({
    required this.result,
    required this.onRestart,
    required this.onClose,
    required this.relatedContent,
    required this.onOpenRelatedContent,
  });

  @override
  Widget build(BuildContext context) {
    final duration = result.durationSeconds;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: IconButton(
              onPressed: onClose,
              icon: const Icon(Icons.close_rounded),
              color: AppColors.textMedium,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'QUIZ CONCLUIDO',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: AppColors.secondary,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${result.score} pontos',
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Terminou com ${result.correctAnswers} acertos e ${result.wrongAnswers} erros.',
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textMedium,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 22),
          GridView.count(
            crossAxisCount: 2,
            childAspectRatio: 1.35,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _ResultadoStatCard(
                label: 'Aproveitamento',
                value: '${result.percentage.toStringAsFixed(0)}%',
              ),
              _ResultadoStatCard(
                label: 'Tempo gasto',
                value: _formatDuration(duration),
              ),
              _ResultadoStatCard(
                label: 'Pontuacao obtida',
                value: '${result.score} pts',
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () => unawaited(onRestart()),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.cardBackground,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Refazer quiz',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: onClose,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.sand),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Ver outros quizzes',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
            ),
          ),
          if (relatedContent != null && onOpenRelatedContent != null) ...[
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton(
                onPressed: onOpenRelatedContent,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.sand),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Voltar aos conteudos',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDuration(int seconds) {
    final safeSeconds = seconds.clamp(0, 86400).toInt();
    final minutes = safeSeconds ~/ 60;
    final remainingSeconds = safeSeconds % 60;
    return '$minutes:${remainingSeconds.toString().padLeft(2, '0')}';
  }
}

class _ResultadoStatCard extends StatelessWidget {
  final String label;
  final String value;

  const _ResultadoStatCard({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.sand),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: AppColors.textMedium,
              letterSpacing: 0.6,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _BarraTopo extends StatelessWidget {
  final int current;
  final int total;
  final double progress;
  final int? remainingSeconds;

  const _BarraTopo({
    required this.current,
    required this.total,
    required this.progress,
    required this.remainingSeconds,
  });

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
                    value: progress,
                    minHeight: 5,
                    backgroundColor: AppColors.line,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              _QuizTimerPill(seconds: remainingSeconds),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'PERGUNTA $current/$total',
            style: const TextStyle(
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

class _QuizTimerPill extends StatelessWidget {
  final int? seconds;

  const _QuizTimerPill({required this.seconds});

  @override
  Widget build(BuildContext context) {
    final value = seconds;
    final isLow = value != null && value <= 5;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isLow ? AppColors.blush : AppColors.soft,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: isLow ? AppColors.textBordeaux : AppColors.line,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.timer_outlined,
            size: 15,
            color: isLow ? AppColors.textBordeaux : AppColors.primary,
          ),
          const SizedBox(width: 5),
          Text(
            value == null ? 'Sem limite' : '${value}s',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: isLow ? AppColors.textBordeaux : AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

enum _EstadoOpcao { neutra, selecionada, correta, incorreta, bloqueada }

class _OpcaoCard extends StatelessWidget {
  final String letra;
  final String texto;
  final _EstadoOpcao estado;
  final VoidCallback? onTap;

  const _OpcaoCard({
    required this.letra,
    required this.texto,
    required this.estado,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final Color bordaColor;
    final Color fundoColor;
    final Color letraFundoColor;
    final Color textoColor;

    switch (estado) {
      case _EstadoOpcao.correta:
        bordaColor = AppColors.success;
        fundoColor = AppColors.successSoft;
        letraFundoColor = AppColors.success;
        textoColor = AppColors.success;
        break;
      case _EstadoOpcao.incorreta:
        bordaColor = AppColors.textBordeaux;
        fundoColor = AppColors.blush;
        letraFundoColor = AppColors.textBordeaux;
        textoColor = AppColors.textBordeaux;
        break;
      case _EstadoOpcao.selecionada:
        bordaColor = AppColors.primary;
        fundoColor = AppColors.blush;
        letraFundoColor = AppColors.primary;
        textoColor = AppColors.primary;
        break;
      case _EstadoOpcao.bloqueada:
        bordaColor = AppColors.line;
        fundoColor = AppColors.soft;
        letraFundoColor = AppColors.muted;
        textoColor = AppColors.textLight;
        break;
      default:
        bordaColor = AppColors.line;
        fundoColor = AppColors.cardBackground;
        letraFundoColor = AppColors.blush;
        textoColor = AppColors.textMedium;
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
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: letraFundoColor,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  letra,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.cardBackground,
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
                    color: textoColor,
                    height: 1.45,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BotaoContinuar extends StatelessWidget {
  final bool ativo;
  final bool isSubmitting;
  final String label;
  final VoidCallback onTap;

  const _BotaoContinuar({
    required this.ativo,
    required this.isSubmitting,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 24),
      decoration: const BoxDecoration(
        color: AppColors.cardBackground,
        border: Border(top: BorderSide(color: AppColors.line)),
      ),
      child: SizedBox(
        width: double.infinity,
        height: 52,
        child: ElevatedButton(
          onPressed: ativo ? onTap : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            disabledBackgroundColor: AppColors.line,
            foregroundColor: AppColors.cardBackground,
            disabledForegroundColor: AppColors.textLight,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            elevation: 0,
          ),
          child: isSubmitting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    color: AppColors.cardBackground,
                    strokeWidth: 2,
                  ),
                )
              : Text(
                  label,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
        ),
      ),
    );
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull {
    final iterator = this.iterator;
    if (!iterator.moveNext()) return null;
    return iterator.current;
  }
}
