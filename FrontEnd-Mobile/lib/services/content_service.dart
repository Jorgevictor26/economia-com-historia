import '../core/utils/api_client.dart';
import '../core/utils/json_helpers.dart';
import '../models/comment.dart';
import '../models/content.dart';
import '../models/paginated_response.dart';

class ContentService {
  final ApiClient _api;

  ContentService({ApiClient? api}) : _api = api ?? ApiClient();

  Future<PaginatedResponse<Content>> getContents({
    int page = 1,
    String? type,
    int? categoryId,
    int? contentTypeId,
    String? search,
  }) async {
    final response = await _api.get(
      '/contents',
      query: {
        'page': page,
        'type': type,
        'category_id': categoryId,
        'content_type_id': contentTypeId,
        'search': search,
      },
    );
    return PaginatedResponse.fromJson(response, Content.fromJson);
  }

  Future<Content> getContent(int id) async {
    final response = await _api.get('/contents/$id');
    return Content.fromJson(jsonMap(response));
  }

  Future<List<Comment>> getComments(int contentId, {String? search}) async {
    final response = await _api.get(
      '/comments/content/$contentId',
      query: {'search': search},
    );
    final data = ApiClient.unwrapData(response);
    if (data is List) return data.map(jsonMap).map(Comment.fromJson).toList();
    return <Comment>[];
  }

  Future<Comment> addComment({
    required int contentId,
    required String comment,
  }) async {
    final response = await _api.post(
      '/comments',
      body: {'content_id': contentId, 'comment': comment},
    );
    return Comment.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }

  Future<CommentReply> replyToComment({
    required int commentId,
    required String reply,
  }) async {
    final response = await _api.post(
      '/comments/$commentId/reply',
      body: {'reply': reply},
    );
    return CommentReply.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }

  Future<ToggleReactionResult> toggleReaction({
    required int contentId,
    String reactionType = 'like',
  }) async {
    final response = await _api.post(
      '/reactions',
      body: {'content_id': contentId, 'reaction_type': reactionType},
    );
    return ToggleReactionResult.fromJson(
      jsonMap(ApiClient.unwrapData(response)),
    );
  }

  Future<List<ReactionSummary>> getReactionCounts(int contentId) async {
    final response = await _api.get('/reactions/content/$contentId/count');
    final data = ApiClient.unwrapData(response);
    if (data is List) {
      return data.map(jsonMap).map(ReactionSummary.fromJson).toList();
    }
    return <ReactionSummary>[];
  }

  Future<PaginatedResponse<SavedContent>> getSavedContents({
    int page = 1,
  }) async {
    final response = await _api.get(
      '/my-saved-contents',
      query: {'page': page},
    );
    return PaginatedResponse.fromJson(response, SavedContent.fromJson);
  }

  Future<SavedContent> saveContent(int contentId) async {
    final response = await _api.post(
      '/saved-contents',
      body: {'content_id': contentId},
    );
    return SavedContent.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }

  Future<void> removeSavedContent(int contentId) async {
    await _api.delete('/saved-contents/$contentId');
  }
}

class PodcastService {
  final ContentService _contents;

  PodcastService({ContentService? contents})
    : _contents = contents ?? ContentService();

  Future<PaginatedResponse<Content>> getPodcasts({
    int page = 1,
    String? search,
  }) {
    return _contents.getContents(page: page, type: 'podcast', search: search);
  }

  Future<Content> getPodcast(int id) => _contents.getContent(id);
}
