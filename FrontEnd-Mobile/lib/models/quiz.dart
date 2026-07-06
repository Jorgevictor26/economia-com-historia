import '../core/constants/api_constants.dart';
import '../core/utils/json_helpers.dart';
import 'content.dart';
import 'paginated_response.dart';
import 'taxonomy.dart';
import 'user.dart';

class Quiz {
  final int id;
  final int userId;
  final int contentId;
  final int? categoryId;
  final String title;
  final String? description;
  final String? status;
  final String? coverUrl;
  final String? difficulty;
  final int? xpPerQuestion;
  final int? timeLimit;
  final int questionsCount;
  final User? user;
  final Content? content;
  final Category? category;
  final List<Question> questions;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Quiz({
    required this.id,
    required this.userId,
    required this.contentId,
    this.categoryId,
    required this.title,
    this.description,
    this.status,
    this.coverUrl,
    this.difficulty,
    this.xpPerQuestion,
    this.timeLimit,
    this.questionsCount = 0,
    this.user,
    this.content,
    this.category,
    this.questions = const [],
    this.createdAt,
    this.updatedAt,
  });

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      id: jsonInt(json['id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      contentId: jsonInt(json['content_id']) ?? 0,
      categoryId: jsonInt(json['category_id']),
      title: jsonString(json['title']) ?? '',
      description: jsonString(json['description']),
      status: jsonString(json['status']),
      coverUrl: jsonString(json['cover_url']),
      difficulty: jsonString(json['difficulty']),
      xpPerQuestion: jsonInt(json['xp_per_question']),
      timeLimit: jsonInt(json['time_limit']),
      questionsCount: jsonInt(json['questions_count']) ?? 0,
      user: json['user'] != null ? User.fromJson(jsonMap(json['user'])) : null,
      content: json['content'] != null
          ? Content.fromJson(jsonMap(json['content']))
          : null,
      category: json['category'] != null
          ? Category.fromJson(jsonMap(json['category']))
          : null,
      questions: jsonList(json['questions'], Question.fromJson),
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }

  String? get displayCover =>
      ApiConstants.mediaUrl(coverUrl) ?? content?.displayImage;
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
  final int? timeSeconds;
  final int? scoreValue;
  final int? xpValue;
  final String? explanation;
  final List<QuestionOption> alternativeOptions;
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
    this.timeSeconds,
    this.scoreValue,
    this.xpValue,
    this.explanation,
    this.alternativeOptions = const [],
    this.createdAt,
    this.updatedAt,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    final alternatives = json['alternatives'];
    final alternativeOptions = alternatives is List
        ? alternatives
              .asMap()
              .entries
              .map((entry) {
                final alternative = jsonMap(entry.value);
                return QuestionOption(
                  _optionKeyForIndex(entry.key),
                  jsonString(alternative['text']) ?? '',
                  id: jsonInt(alternative['id']),
                );
              })
              .where((option) => option.text.isNotEmpty)
              .toList()
        : <QuestionOption>[];

    return Question(
      id: jsonInt(json['id']) ?? 0,
      quizId: jsonInt(json['quiz_id']) ?? 0,
      question: jsonString(json['question']) ?? '',
      optionA: jsonString(json['option_a']) ?? '',
      optionB: jsonString(json['option_b']) ?? '',
      optionC: jsonString(json['option_c']) ?? '',
      optionD: jsonString(json['option_d']) ?? '',
      correctOption: jsonString(json['correct_option']) ?? '',
      timeSeconds: jsonInt(json['time_seconds']),
      scoreValue: jsonInt(json['score']),
      xpValue: jsonInt(json['xp']),
      explanation: jsonString(json['explanation']),
      alternativeOptions: alternativeOptions,
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }

  List<QuestionOption> get options {
    if (alternativeOptions.isNotEmpty) return alternativeOptions;

    return [
      QuestionOption('a', optionA),
      QuestionOption('b', optionB),
      QuestionOption('c', optionC),
      QuestionOption('d', optionD),
    ].where((option) => option.text.isNotEmpty).toList();
  }
}

class QuestionOption {
  final String key;
  final String text;
  final int? id;

  const QuestionOption(this.key, this.text, {this.id});
}

class QuizResult {
  final int score;
  final int totalQuestions;
  final double percentage;
  final int earnedXp;
  final int correctAnswers;
  final int wrongAnswers;
  final int durationSeconds;
  final int bestScore;
  final bool isBest;
  final int? rankingPosition;
  final String? userLevel;
  final int? userTotalXp;
  final List<QuizResultAnswer> answers;

  const QuizResult({
    required this.score,
    required this.totalQuestions,
    required this.percentage,
    required this.earnedXp,
    required this.correctAnswers,
    required this.wrongAnswers,
    required this.durationSeconds,
    required this.bestScore,
    required this.isBest,
    this.rankingPosition,
    this.userLevel,
    this.userTotalXp,
    this.answers = const [],
  });

  factory QuizResult.fromJson(Map<String, dynamic> json) {
    return QuizResult(
      score: jsonInt(json['score']) ?? 0,
      totalQuestions: jsonInt(json['total_questions']) ?? 0,
      percentage: jsonDouble(json['percentage']) ?? 0,
      earnedXp: jsonInt(json['earned_xp']) ?? jsonInt(json['score']) ?? 0,
      correctAnswers: jsonInt(json['correct_answers']) ?? 0,
      wrongAnswers: jsonInt(json['wrong_answers']) ?? 0,
      durationSeconds: jsonInt(json['duration_seconds']) ?? 0,
      bestScore: jsonInt(json['best_score']) ?? jsonInt(json['score']) ?? 0,
      isBest: jsonBool(json['is_best']) ?? false,
      rankingPosition: jsonInt(json['ranking_position']),
      userLevel: jsonString(json['user_level']),
      userTotalXp: jsonInt(json['user_total_xp']),
      answers: QuizResultAnswer.listFromJson(json['answers']),
    );
  }
}

class QuizResultAnswer {
  final int questionId;
  final int? alternativeId;
  final String? selectedOption;
  final bool isCorrect;
  final int? elapsedSeconds;

  const QuizResultAnswer({
    required this.questionId,
    this.alternativeId,
    this.selectedOption,
    required this.isCorrect,
    this.elapsedSeconds,
  });

  factory QuizResultAnswer.fromJson(Map<String, dynamic> json) {
    return QuizResultAnswer(
      questionId: jsonInt(json['question_id']) ?? 0,
      alternativeId:
          jsonInt(json['quiz_alternative_id']) ??
          jsonInt(json['alternative_id']),
      selectedOption: jsonString(json['selected_option']),
      isCorrect: jsonBool(json['is_correct']) ?? false,
      elapsedSeconds: jsonInt(json['elapsed_seconds']),
    );
  }

  static List<QuizResultAnswer> listFromJson(Object? value) {
    if (value is! List) return const [];

    return value
        .map(jsonMap)
        .where((item) => item.isNotEmpty)
        .map(QuizResultAnswer.fromJson)
        .toList();
  }
}

class UserQuizResult {
  final int id;
  final int quizId;
  final int userId;
  final int score;
  final int earnedXp;
  final int totalQuestions;
  final double percentage;
  final int? rankingPosition;
  final DateTime? completedAt;
  final Quiz? quiz;

  const UserQuizResult({
    required this.id,
    required this.quizId,
    required this.userId,
    required this.score,
    required this.earnedXp,
    required this.totalQuestions,
    required this.percentage,
    this.rankingPosition,
    this.completedAt,
    this.quiz,
  });

  factory UserQuizResult.fromJson(Map<String, dynamic> json) {
    return UserQuizResult(
      id: jsonInt(json['id']) ?? 0,
      quizId: jsonInt(json['quiz_id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      score: jsonInt(json['score']) ?? 0,
      earnedXp: jsonInt(json['earned_xp']) ?? jsonInt(json['score']) ?? 0,
      totalQuestions: jsonInt(json['total_questions']) ?? 0,
      percentage: jsonDouble(json['percentage']) ?? 0,
      rankingPosition: jsonInt(json['ranking_position']),
      completedAt: jsonDate(json['completed_at']),
      quiz: json['quiz'] != null ? Quiz.fromJson(jsonMap(json['quiz'])) : null,
    );
  }
}

class QuizUserStats {
  final int score;
  final int totalXp;
  final int completedQuizzes;
  final List<int> completedQuizIds;
  final int? rankingPosition;
  final String? level;

  const QuizUserStats({
    required this.score,
    required this.totalXp,
    required this.completedQuizzes,
    this.completedQuizIds = const [],
    this.rankingPosition,
    this.level,
  });

  static const empty = QuizUserStats(score: 0, totalXp: 0, completedQuizzes: 0);

  factory QuizUserStats.fromResultsResponse(Object? json) {
    final map = jsonMap(json);
    final stats = jsonMap(map['stats']);
    final results = (map['data'] is List)
        ? (map['data'] as List)
              .map(jsonMap)
              .where((item) => item.isNotEmpty)
              .map(UserQuizResult.fromJson)
              .toList()
        : <UserQuizResult>[];

    final completedIds = _completedQuizIds(
      stats['completed_quiz_ids'],
      results,
    );
    final score =
        jsonInt(stats['score']) ??
        results.fold<int>(0, (total, result) => total + result.score);
    final totalXp = jsonInt(stats['total_xp']) ?? score;
    final rankingPosition =
        results
            .map((result) => result.rankingPosition)
            .whereType<int>()
            .where((position) => position > 0)
            .toList()
          ..sort();

    return QuizUserStats(
      score: score,
      totalXp: totalXp,
      completedQuizzes:
          jsonInt(stats['completed_quizzes']) ?? completedIds.length,
      completedQuizIds: completedIds,
      rankingPosition: rankingPosition.isEmpty ? null : rankingPosition.first,
      level: jsonString(stats['level']),
    );
  }
}

class QuizMyResults {
  final PaginatedResponse<UserQuizResult> results;
  final QuizUserStats stats;

  const QuizMyResults({required this.results, required this.stats});

  factory QuizMyResults.fromJson(Object? json) {
    return QuizMyResults(
      results: PaginatedResponse.fromJson(json, UserQuizResult.fromJson),
      stats: QuizUserStats.fromResultsResponse(json),
    );
  }
}

class QuizRankingEntry {
  final int position;
  final int userId;
  final String name;
  final int score;
  final int earnedXp;
  final int durationSeconds;
  final DateTime? completedAt;

  const QuizRankingEntry({
    required this.position,
    required this.userId,
    required this.name,
    required this.score,
    required this.earnedXp,
    required this.durationSeconds,
    this.completedAt,
  });

  factory QuizRankingEntry.fromJson(
    Map<String, dynamic> json, {
    required int position,
  }) {
    final user = jsonMap(json['user']);

    return QuizRankingEntry(
      position: position,
      userId: jsonInt(json['user_id']) ?? jsonInt(user['id']) ?? 0,
      name: jsonString(user['name']) ?? 'Participante',
      score: jsonInt(json['score']) ?? 0,
      earnedXp: jsonInt(json['earned_xp']) ?? jsonInt(json['score']) ?? 0,
      durationSeconds: jsonInt(json['duration_seconds']) ?? 0,
      completedAt: jsonDate(json['completed_at']),
    );
  }
}

class QuizGlobalRankingEntry {
  final int position;
  final int userId;
  final String name;
  final int totalScore;
  final int totalEarnedXp;
  final int totalDurationSeconds;
  final int completedQuizzes;
  final int bestQuizPosition;
  final DateTime? lastCompletedAt;

  const QuizGlobalRankingEntry({
    required this.position,
    required this.userId,
    required this.name,
    required this.totalScore,
    required this.totalEarnedXp,
    required this.totalDurationSeconds,
    required this.completedQuizzes,
    required this.bestQuizPosition,
    this.lastCompletedAt,
  });
}

List<int> _completedQuizIds(Object? rawIds, List<UserQuizResult> results) {
  if (rawIds is List) {
    return rawIds.map(jsonInt).whereType<int>().toSet().toList();
  }

  return results
      .map((result) => result.quizId)
      .where((id) => id > 0)
      .toSet()
      .toList();
}

class QuizProgress {
  final int id;
  final int userId;
  final int quizId;
  final int progressPercent;
  final int? currentQuestionIndex;
  final int correctCount;
  final int elapsedSeconds;
  final Map<String, dynamic> answeredQuestions;
  final List<QuizProgressAnswer> answers;
  final List<int> answeredQuestionIds;
  final List<int> questionOrder;
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
    this.correctCount = 0,
    this.elapsedSeconds = 0,
    this.answeredQuestions = const {},
    this.answers = const [],
    this.answeredQuestionIds = const [],
    this.questionOrder = const [],
    this.completedAt,
    this.createdAt,
    this.updatedAt,
    this.quiz,
  });

  factory QuizProgress.fromJson(Map<String, dynamic> json) {
    final answers = QuizProgressAnswer.listFromJson(json['answered_questions']);
    final answeredQuestionIds = _answeredQuestionIds(
      json['answered_questions'],
      answers,
    );

    return QuizProgress(
      id: jsonInt(json['id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      quizId: jsonInt(json['quiz_id']) ?? 0,
      progressPercent: jsonInt(json['progress_percent']) ?? 0,
      currentQuestionIndex: jsonInt(json['current_question_index']),
      correctCount: jsonInt(json['correct_count']) ?? 0,
      elapsedSeconds: jsonInt(json['elapsed_seconds']) ?? 0,
      answeredQuestions: {
        for (final answer in answers)
          answer.questionId.toString(): answer.selectedOption,
      },
      answers: answers,
      answeredQuestionIds: answeredQuestionIds,
      questionOrder: _intList(json['question_order']),
      completedAt: jsonDate(json['completed_at']),
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
      quiz: json['quiz'] != null ? Quiz.fromJson(jsonMap(json['quiz'])) : null,
    );
  }

  bool get isIncomplete => progressPercent > 0 && progressPercent < 100;

  Map<int, String> get answerMap => {
    for (final answer in answers)
      if (answer.selectedOption != null)
        answer.questionId: answer.selectedOption!,
  };
}

class QuizProgressAnswer {
  final int questionId;
  final int? alternativeId;
  final String? selectedOption;
  final int? elapsedSeconds;

  const QuizProgressAnswer({
    required this.questionId,
    this.alternativeId,
    this.selectedOption,
    this.elapsedSeconds,
  });

  factory QuizProgressAnswer.fromJson(Map<String, dynamic> json) {
    return QuizProgressAnswer(
      questionId: jsonInt(json['question_id']) ?? 0,
      alternativeId: jsonInt(json['alternative_id']),
      selectedOption: jsonString(json['selected_option']),
      elapsedSeconds: jsonInt(json['elapsed_seconds']),
    );
  }

  static List<QuizProgressAnswer> listFromJson(Object? value) {
    if (value is List) {
      return value
          .map(jsonMap)
          .where((item) => item.isNotEmpty)
          .map(QuizProgressAnswer.fromJson)
          .where((answer) => answer.questionId > 0)
          .toList();
    }

    if (value is Map) {
      return value.entries
          .map(
            (entry) => QuizProgressAnswer(
              questionId: jsonInt(entry.key) ?? 0,
              selectedOption: jsonString(entry.value),
            ),
          )
          .where((answer) => answer.questionId > 0)
          .toList();
    }

    return const [];
  }
}

String _optionKeyForIndex(int index) {
  final safeIndex = index.clamp(0, 3).toInt();
  return const ['a', 'b', 'c', 'd'][safeIndex];
}

List<int> _intList(Object? value) {
  if (value is! List) return const [];

  return value.map(jsonInt).whereType<int>().toList();
}

List<int> _answeredQuestionIds(
  Object? value,
  List<QuizProgressAnswer> parsedAnswers,
) {
  final ids = <int>{
    for (final answer in parsedAnswers)
      if (answer.questionId > 0) answer.questionId,
  };

  if (value is List) {
    for (final item in value) {
      if (item is Map) {
        final id = jsonInt(item['question_id']);
        if (id != null && id > 0) ids.add(id);
        continue;
      }

      final id = jsonInt(item);
      if (id != null && id > 0) ids.add(id);
    }
  } else if (value is Map) {
    for (final key in value.keys) {
      final id = jsonInt(key);
      if (id != null && id > 0) ids.add(id);
    }
  }

  return ids.toList();
}
