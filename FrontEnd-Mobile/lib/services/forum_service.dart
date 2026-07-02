import '../core/utils/api_client.dart';
import '../core/utils/json_helpers.dart';
import '../models/forum.dart';

class ForumService {
  final ApiClient _api;

  ForumService({ApiClient? api}) : _api = api ?? ApiClient();

  Future<List<Forum>> getForums({String? search}) async {
    final response = await _api.get('/forums', query: {'search': search});
    final data = ApiClient.unwrapData(response);
    if (data is List) return data.map(jsonMap).map(Forum.fromJson).toList();
    return <Forum>[];
  }

  Future<Forum> getForum(int id) async {
    final response = await _api.get('/forums/$id');
    return Forum.fromJson(jsonMap(response));
  }

  Future<Forum> createForum({
    required String name,
    String? description,
    String? rules,
    String? category,
    String visibility = 'public',
    String contentPermission = 'public',
    bool allowAttachments = false,
    List<int> contentIds = const [],
  }) async {
    final response = await _api.post(
      '/forums',
      body: {
        'name': name,
        'description': ?description,
        'rules': ?rules,
        'category': ?category,
        'visibility': visibility,
        'content_permission': contentPermission,
        'allow_attachments': allowAttachments,
        if (contentIds.isNotEmpty) 'content_ids': contentIds,
      },
    );
    return Forum.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }

  Future<List<ForumTopic>> getTopics(int forumId, {String? search}) async {
    final response = await _api.get(
      '/forums/$forumId/topics',
      query: {'search': search},
    );
    final data = ApiClient.unwrapData(response);
    if (data is List) {
      return data.map(jsonMap).map(ForumTopic.fromJson).toList();
    }
    return <ForumTopic>[];
  }

  Future<ForumTopic> getTopic(int topicId) async {
    final response = await _api.get('/topics/$topicId');
    return ForumTopic.fromJson(jsonMap(response));
  }

  Future<ForumTopic> createTopic({
    required int forumId,
    required String title,
    required String content,
  }) async {
    final response = await _api.post(
      '/forums/$forumId/topics',
      body: {'title': title, 'content': content},
    );
    return ForumTopic.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }

  Future<List<ForumReply>> getReplies(int topicId, {String? search}) async {
    final response = await _api.get(
      '/topics/$topicId/replies',
      query: {'search': search},
    );
    final data = ApiClient.unwrapData(response);
    if (data is List) {
      return data.map(jsonMap).map(ForumReply.fromJson).toList();
    }
    return <ForumReply>[];
  }

  Future<ForumReply> replyToTopic({
    required int topicId,
    required String reply,
  }) async {
    final response = await _api.post(
      '/topics/$topicId/replies',
      body: {'reply': reply},
    );
    return ForumReply.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }
}
