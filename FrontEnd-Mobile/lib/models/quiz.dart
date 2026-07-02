import '../core/utils/json_helpers.dart';
import 'content.dart';
import 'user.dart';

class Quiz {
  final int id;
  final int userId;
  final int contentId;
  final String title;
  final String? description;
  final int? timeLimit;
  final int questionsCount;
  final User? user;
  final Content? content;
  final List<Question> questions;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Quiz({
    required this.id,
    required this.userId,
    required this.contentId,
    required this.title,
    this.description,
    this.timeLimit,
    this.questionsCount = 0,
    this.user,
    this.content,
    this.questions = const [],
    this.createdAt,
    this.updatedAt,
  });

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      id: jsonInt(json['id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      contentId: jsonInt(json['content_id']) ?? 0,
      title: jsonString(json['title']) ?? '',
      description: jsonString(json['description']),
      timeLimit: jsonInt(json['time_limit']),
      questionsCount: jsonInt(json['questions_count']) ?? 0,
      user: json['user'] != null ? User.fromJson(jsonMap(json['user'])) : null,
      content: json['content'] != null
          ? Content.fromJson(jsonMap(json['content']))
          : null,
      questions: jsonList(json['questions'], Question.fromJson),
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }
}

class Question {
  final int id;
  final int quizId;
  final String question;
  final String optionA;
  final String optionB;
  final String optionC;
  final String optionD;
  final String correctOption;
  final String? explanation;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Question({
    required this.id,
    required this.quizId,
    required this.question,
    required this.optionA,
    required this.optionB,
    required this.optionC,
    required this.optionD,
    required this.correctOption,
    this.explanation,
    this.createdAt,
    this.updatedAt,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: jsonInt(json['id']) ?? 0,
      quizId: jsonInt(json['quiz_id']) ?? 0,
      question: jsonString(json['question']) ?? '',
      optionA: jsonString(json['option_a']) ?? '',
      optionB: jsonString(json['option_b']) ?? '',
      optionC: jsonString(json['option_c']) ?? '',
      optionD: jsonString(json['option_d']) ?? '',
      correctOption: jsonString(json['correct_option']) ?? '',
      explanation: jsonString(json['explanation']),
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }

  List<QuestionOption> get options => [
    QuestionOption('a', optionA),
    QuestionOption('b', optionB),
    QuestionOption('c', optionC),
    QuestionOption('d', optionD),
  ].where((option) => option.text.isNotEmpty).toList();
}

class QuestionOption {
  final String key;
  final String text;

  const QuestionOption(this.key, this.text);
}

class QuizResult {
  final int score;
  final int totalQuestions;
  final double percentage;
  final int correctAnswers;
  final int wrongAnswers;

  const QuizResult({
    required this.score,
    required this.totalQuestions,
    required this.percentage,
    required this.correctAnswers,
    required this.wrongAnswers,
  });

  factory QuizResult.fromJson(Map<String, dynamic> json) {
    return QuizResult(
      score: jsonInt(json['score']) ?? 0,
      totalQuestions: jsonInt(json['total_questions']) ?? 0,
      percentage: jsonDouble(json['percentage']) ?? 0,
      correctAnswers: jsonInt(json['correct_answers']) ?? 0,
      wrongAnswers: jsonInt(json['wrong_answers']) ?? 0,
    );
  }
}

class UserQuizResult {
  final int id;
  final int quizId;
  final int userId;
  final int score;
  final int totalQuestions;
  final double percentage;
  final DateTime? completedAt;
  final Quiz? quiz;

  const UserQuizResult({
    required this.id,
    required this.quizId,
    required this.userId,
    required this.score,
    required this.totalQuestions,
    required this.percentage,
    this.completedAt,
    this.quiz,
  });

  factory UserQuizResult.fromJson(Map<String, dynamic> json) {
    return UserQuizResult(
      id: jsonInt(json['id']) ?? 0,
      quizId: jsonInt(json['quiz_id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      score: jsonInt(json['score']) ?? 0,
      totalQuestions: jsonInt(json['total_questions']) ?? 0,
      percentage: jsonDouble(json['percentage']) ?? 0,
      completedAt: jsonDate(json['completed_at']),
      quiz: json['quiz'] != null ? Quiz.fromJson(jsonMap(json['quiz'])) : null,
    );
  }
}

class QuizProgress {
  final int id;
  final int userId;
  final int quizId;
  final int progressPercent;
  final int? currentQuestionIndex;
  final Map<String, dynamic> answeredQuestions;
  final DateTime? completedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final Quiz? quiz;

  const QuizProgress({
    required this.id,
    required this.userId,
    required this.quizId,
    required this.progressPercent,
    this.currentQuestionIndex,
    this.answeredQuestions = const {},
    this.completedAt,
    this.createdAt,
    this.updatedAt,
    this.quiz,
  });

  factory QuizProgress.fromJson(Map<String, dynamic> json) {
    return QuizProgress(
      id: jsonInt(json['id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      quizId: jsonInt(json['quiz_id']) ?? 0,
      progressPercent: jsonInt(json['progress_percent']) ?? 0,
      currentQuestionIndex: jsonInt(json['current_question_index']),
      answeredQuestions: jsonMap(json['answered_questions']),
      completedAt: jsonDate(json['completed_at']),
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
      quiz: json['quiz'] != null ? Quiz.fromJson(jsonMap(json['quiz'])) : null,
    );
  }
}
