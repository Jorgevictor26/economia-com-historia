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
    required Map<int, String> answers,
  }) async {
    final response = await _api.post(
      '/quizzes/$quizId/submit',
      body: {
        'started_at': startedAt.toIso8601String(),
        'answers': answers.entries
            .map(
              (entry) => {
                'question_id': entry.key,
                'selected_option': entry.value,
              },
            )
            .toList(),
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
}
