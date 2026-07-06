import '../core/utils/api_client.dart';
import '../core/utils/json_helpers.dart';
import '../models/paginated_response.dart';
import '../models/quiz.dart';

class QuizService {
  final ApiClient _api;

  QuizService({ApiClient? api}) : _api = api ?? ApiClient();

  Future<PaginatedResponse<Quiz>> getQuizzes({
    int page = 1,
    String? search,
  }) async {
    final response = await _api.get(
      '/quizzes',
      query: {'page': page, 'search': search},
    );
    return PaginatedResponse.fromJson(response, Quiz.fromJson);
  }

  Future<Quiz> getQuiz(int id) async {
    final response = await _api.get('/quizzes/$id');
    return Quiz.fromJson(jsonMap(response));
  }

  Future<List<Question>> getQuestions(int quizId) async {
    final response = await _api.get('/quizzes/$quizId/questions');
    final data = ApiClient.unwrapData(response);
    if (data is List) return data.map(jsonMap).map(Question.fromJson).toList();
    return <Question>[];
  }

  Future<QuizResult> submitQuiz({
    required int quizId,
    required DateTime startedAt,
    required int elapsedSeconds,
    required Map<int, String> answers,
    Map<int, int> alternativeIds = const {},
    Map<int, int> elapsedByQuestion = const {},
  }) async {
    final response = await _api.post(
      '/quizzes/$quizId/submit',
      body: {
        'started_at': startedAt.toUtc().toIso8601String(),
        'elapsed_seconds': elapsedSeconds.clamp(0, 86400).toInt(),
        'answers': answers.entries.map((entry) {
          final alternativeId = alternativeIds[entry.key];
          final questionElapsed = elapsedByQuestion[entry.key];

          return {
            'question_id': entry.key,
            if (alternativeId != null)
              'alternative_id': alternativeId
            else
              'selected_option': entry.value,
            if (questionElapsed != null)
              'elapsed_seconds': questionElapsed.clamp(0, 86400).toInt(),
          };
        }).toList(),
      },
    );
    return QuizResult.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }

  Future<QuizResult> getResult(int quizId) async {
    final response = await _api.get('/quizzes/$quizId/result');
    return QuizResult.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }

  Future<PaginatedResponse<UserQuizResult>> getMyResults({int page = 1}) async {
    final response = await _api.get('/my-results', query: {'page': page});
    return PaginatedResponse.fromJson(response, UserQuizResult.fromJson);
  }

  Future<QuizMyResults> getMyResultsWithStats({int page = 1}) async {
    final response = await _api.get('/my-results', query: {'page': page});
    return QuizMyResults.fromJson(response);
  }

  Future<QuizUserStats> loadMyStats() async {
    final response = await _api.get('/my-results');
    return QuizUserStats.fromResultsResponse(response);
  }

  Future<List<QuizRankingEntry>> getRanking(
    int quizId, {
    int limit = 20,
  }) async {
    final response = await _api.get('/quizzes/$quizId/ranking');
    final data = ApiClient.unwrapData(response);
    if (data is! List) return <QuizRankingEntry>[];

    return data
        .take(limit)
        .toList()
        .asMap()
        .entries
        .map(
          (entry) => QuizRankingEntry.fromJson(
            jsonMap(entry.value),
            position: entry.key + 1,
          ),
        )
        .where((entry) => entry.userId > 0)
        .toList();
  }

  Future<List<QuizGlobalRankingEntry>> getGlobalRanking({
    int limit = 30,
  }) async {
    final quizzes = await _loadAllQuizzes();
    final byUser = <int, _GlobalRankingAccumulator>{};

    for (final quiz in quizzes) {
      try {
        final ranking = await getRanking(quiz.id, limit: 20);
        for (final entry in ranking) {
          final current = byUser[entry.userId];
          if (current == null) {
            byUser[entry.userId] = _GlobalRankingAccumulator.fromEntry(entry);
          } else {
            current.add(entry);
          }
        }
      } catch (_) {
        continue;
      }
    }

    final entries = byUser.values.toList()
      ..sort((a, b) {
        final score = b.totalScore.compareTo(a.totalScore);
        if (score != 0) return score;

        final xp = b.totalEarnedXp.compareTo(a.totalEarnedXp);
        if (xp != 0) return xp;

        final duration = a.totalDurationSeconds.compareTo(
          b.totalDurationSeconds,
        );
        if (duration != 0) return duration;

        return a.name.compareTo(b.name);
      });

    return [
      for (var index = 0; index < entries.length && index < limit; index++)
        entries[index].toRankingEntry(index + 1),
    ];
  }

  Future<List<Quiz>> _loadAllQuizzes() async {
    final quizzes = <Quiz>[];
    var page = 1;

    while (page <= 10) {
      final response = await getQuizzes(page: page);
      quizzes.addAll(response.data);
      if (!response.hasMore || response.data.isEmpty) break;
      page++;
    }

    return quizzes;
  }

  Future<List<QuizProgress>> getQuizProgress({int limit = 6}) async {
    final response = await _api.get('/quiz-progress', query: {'limit': limit});
    final data = ApiClient.unwrapData(response);
    if (data is List) {
      return data.map(jsonMap).map(QuizProgress.fromJson).toList();
    }
    return <QuizProgress>[];
  }

  Future<QuizProgress?> getQuizProgressForQuiz(int quizId) async {
    final response = await _api.get('/quizzes/$quizId/progress');
    final data = ApiClient.unwrapData(response);
    if (data == null) return null;

    return QuizProgress.fromJson(jsonMap(data));
  }

  Future<QuizProgress> updateProgress({
    required int quizId,
    required int progressPercent,
    int? currentQuestionIndex,
    Map<int, String> answeredQuestions = const {},
    Map<int, int> alternativeIds = const {},
    int? correctCount,
    int? elapsedSeconds,
    List<int> questionOrder = const [],
  }) async {
    final response = await _api.put(
      '/quizzes/$quizId/progress',
      body: {
        'progress_percent': progressPercent.clamp(0, 100).toInt(),
        'current_question_index': ?currentQuestionIndex,
        'correct_count': ?correctCount,
        if (elapsedSeconds != null)
          'elapsed_seconds': elapsedSeconds.clamp(0, 86400).toInt(),
        if (answeredQuestions.isNotEmpty)
          'answered_questions': answeredQuestions.entries
              .map(
                (entry) => {
                  'question_id': entry.key,
                  if (alternativeIds[entry.key] != null)
                    'alternative_id': alternativeIds[entry.key],
                  'selected_option': entry.value,
                },
              )
              .toList(),
        if (questionOrder.isNotEmpty) 'question_order': questionOrder,
      },
    );
    return QuizProgress.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }
}

class _GlobalRankingAccumulator {
  final int userId;
  final String name;
  int totalScore;
  int totalEarnedXp;
  int totalDurationSeconds;
  int completedQuizzes;
  int bestQuizPosition;
  DateTime? lastCompletedAt;

  _GlobalRankingAccumulator({
    required this.userId,
    required this.name,
    required this.totalScore,
    required this.totalEarnedXp,
    required this.totalDurationSeconds,
    required this.completedQuizzes,
    required this.bestQuizPosition,
    this.lastCompletedAt,
  });

  factory _GlobalRankingAccumulator.fromEntry(QuizRankingEntry entry) {
    return _GlobalRankingAccumulator(
      userId: entry.userId,
      name: entry.name,
      totalScore: entry.score,
      totalEarnedXp: entry.earnedXp,
      totalDurationSeconds: entry.durationSeconds,
      completedQuizzes: 1,
      bestQuizPosition: entry.position,
      lastCompletedAt: entry.completedAt,
    );
  }

  void add(QuizRankingEntry entry) {
    totalScore += entry.score;
    totalEarnedXp += entry.earnedXp;
    totalDurationSeconds += entry.durationSeconds;
    completedQuizzes += 1;
    bestQuizPosition = bestQuizPosition < entry.position
        ? bestQuizPosition
        : entry.position;
    lastCompletedAt = _latestDate(lastCompletedAt, entry.completedAt);
  }

  QuizGlobalRankingEntry toRankingEntry(int position) {
    return QuizGlobalRankingEntry(
      position: position,
      userId: userId,
      name: name,
      totalScore: totalScore,
      totalEarnedXp: totalEarnedXp,
      totalDurationSeconds: totalDurationSeconds,
      completedQuizzes: completedQuizzes,
      bestQuizPosition: bestQuizPosition,
      lastCompletedAt: lastCompletedAt,
    );
  }
}

DateTime? _latestDate(DateTime? current, DateTime? next) {
  if (current == null) return next;
  if (next == null) return current;
  return next.isAfter(current) ? next : current;
}
