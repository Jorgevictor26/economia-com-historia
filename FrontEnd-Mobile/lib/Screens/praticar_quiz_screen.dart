import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/widgets/api_state_widgets.dart';
import '../models/quiz.dart';
import '../services/quiz_service.dart';
import '../theme/app_colors.dart';

class PraticarQuizScreen extends StatefulWidget {
  final Quiz quiz;

  const PraticarQuizScreen({super.key, required this.quiz});

  @override
  State<PraticarQuizScreen> createState() => _PraticarQuizScreenState();
}

class _PraticarQuizScreenState extends State<PraticarQuizScreen> {
  final _service = QuizService();
  late final DateTime _startedAt;

  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _error;
  List<Question> _questions = [];
  int _currentIndex = 0;
  String? _selectedOption;
  bool _showFeedback = false;
  final Map<int, String> _answers = {};

  @override
  void initState() {
    super.initState();
    _startedAt = DateTime.now();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final questions = widget.quiz.questions.isNotEmpty
          ? widget.quiz.questions
          : await _service.getQuestions(widget.quiz.id);
      if (!mounted) return;
      setState(() => _questions = questions);
    } on AppException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Erro ao carregar questoes.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Question get _question => _questions[_currentIndex];

  void _selecionarResposta(String option) {
    if (_showFeedback) return;
    setState(() {
      _selectedOption = option;
      _answers[_question.id] = option;
      _showFeedback = true;
    });
  }

  Future<void> _continuar() async {
    if (_currentIndex < _questions.length - 1) {
      setState(() {
        _currentIndex++;
        _selectedOption = _answers[_question.id];
        _showFeedback = false;
      });
      return;
    }
    await _submit();
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    try {
      final result = await _service.submitQuiz(
        quizId: widget.quiz.id,
        startedAt: _startedAt,
        answers: _answers,
      );
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Resultado'),
          content: Text(
            'Acertaste ${result.score}/${result.totalQuestions} (${result.percentage.toStringAsFixed(1)}%).',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      if (mounted) Navigator.maybePop(context);
    } on AppException catch (e) {
      if (mounted) _showSnackBar(e.message);
    } catch (_) {
      if (mounted) _showSnackBar('Erro ao submeter respostas.');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: _isLoading
            ? const LoadingState(message: 'A carregar quiz...')
            : _error != null
            ? ErrorState(message: _error!, onRetry: _load)
            : _questions.isEmpty
            ? const EmptyState(message: 'Este quiz ainda nao tem questoes.')
            : Column(
                children: [
                  _BarraTopo(
                    current: _currentIndex + 1,
                    total: _questions.length,
                    progress: (_currentIndex + 1) / _questions.length,
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Column(
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
                              onTap: () => _selecionarResposta(option.key),
                            ),
                          ),
                          if (_showFeedback) ...[
                            const SizedBox(height: 16),
                            _FeedbackCard(
                              correct:
                                  _selectedOption == _question.correctOption,
                              explanation: _question.explanation,
                            ),
                          ],
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
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
    if (!_showFeedback) {
      return option == _selectedOption
          ? _EstadoOpcao.selecionada
          : _EstadoOpcao.neutra;
    }
    if (option == _question.correctOption) return _EstadoOpcao.correta;
    if (option == _selectedOption) return _EstadoOpcao.errada;
    return _EstadoOpcao.neutra;
  }
}

class _BarraTopo extends StatelessWidget {
  final int current;
  final int total;
  final double progress;

  const _BarraTopo({
    required this.current,
    required this.total,
    required this.progress,
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

  @override
  Widget build(BuildContext context) {
    final Color bordaColor;
    final Color fundoColor;
    final Color letraFundoColor;
    final Color textoColor;

    switch (estado) {
      case _EstadoOpcao.correta:
        bordaColor = _verdeBorda;
        fundoColor = _verdeClaro;
        letraFundoColor = _verde;
        textoColor = _verde;
        break;
      case _EstadoOpcao.errada:
        bordaColor = Colors.redAccent;
        fundoColor = const Color(0xFFFFF0F0);
        letraFundoColor = Colors.redAccent;
        textoColor = Colors.redAccent;
        break;
      case _EstadoOpcao.selecionada:
        bordaColor = AppColors.primary;
        fundoColor = const Color(0xFFF7EEF0);
        letraFundoColor = AppColors.primary;
        textoColor = AppColors.primary;
        break;
      default:
        bordaColor = const Color(0xFFDDD5D6);
        fundoColor = Colors.white;
        letraFundoColor = const Color(0xFFF0EAEA);
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
                    color: Colors.white,
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

class _FeedbackCard extends StatelessWidget {
  final bool correct;
  final String? explanation;

  const _FeedbackCard({required this.correct, this.explanation});

  @override
  Widget build(BuildContext context) {
    final color = correct ? const Color(0xFF2E7D32) : Colors.redAccent;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: correct ? const Color(0xFFF1FAF1) : const Color(0xFFFFF0F0),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.4), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                correct ? Icons.check_circle_outline : Icons.info_outline,
                color: color,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                correct ? 'Resposta correta' : 'Resposta incorreta',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
            ],
          ),
          if ((explanation ?? '').isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              explanation!,
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xFF3D3D3D),
                height: 1.6,
              ),
            ),
          ],
        ],
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
          child: isSubmitting
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    color: Colors.white,
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
