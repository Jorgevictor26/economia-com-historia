import '../core/utils/json_helpers.dart';
import 'user.dart';

class Forum {
  final int id;
  final int userId;
  final String name;
  final String? description;
  final String? status;
  final int topicsCount;
  final User? user;
  final List<ForumTopic> topics;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Forum({
    required this.id,
    required this.userId,
    required this.name,
    this.description,
    this.status,
    this.topicsCount = 0,
    this.user,
    this.topics = const [],
    this.createdAt,
    this.updatedAt,
  });

  factory Forum.fromJson(Map<String, dynamic> json) {
    return Forum(
      id: jsonInt(json['id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      name: jsonString(json['name']) ?? '',
      description: jsonString(json['description']),
      status: jsonString(json['status']),
      topicsCount: jsonInt(json['topics_count']) ?? 0,
      user: json['user'] != null ? User.fromJson(jsonMap(json['user'])) : null,
      topics: jsonList(json['topics'], ForumTopic.fromJson),
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }
}

class ForumTopic {
  final int id;
  final int forumId;
  final int userId;
  final String title;
  final String content;
  final int repliesCount;
  final User? user;
  final List<ForumReply> replies;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const ForumTopic({
    required this.id,
    required this.forumId,
    required this.userId,
    required this.title,
    required this.content,
    this.repliesCount = 0,
    this.user,
    this.replies = const [],
    this.createdAt,
    this.updatedAt,
  });

  factory ForumTopic.fromJson(Map<String, dynamic> json) {
    return ForumTopic(
      id: jsonInt(json['id']) ?? 0,
      forumId: jsonInt(json['forum_id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      title: jsonString(json['title']) ?? '',
      content: jsonString(json['content']) ?? '',
      repliesCount: jsonInt(json['replies_count']) ?? 0,
      user: json['user'] != null ? User.fromJson(jsonMap(json['user'])) : null,
      replies: jsonList(json['replies'], ForumReply.fromJson),
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }
}

class ForumReply {
  final int id;
  final int topicId;
  final int userId;
  final String reply;
  final User? user;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const ForumReply({
    required this.id,
    required this.topicId,
    required this.userId,
    required this.reply,
    this.user,
    this.createdAt,
    this.updatedAt,
  });

  factory ForumReply.fromJson(Map<String, dynamic> json) {
    return ForumReply(
      id: jsonInt(json['id']) ?? 0,
      topicId: jsonInt(json['topic_id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      reply: jsonString(json['reply']) ?? '',
      user: json['user'] != null ? User.fromJson(jsonMap(json['user'])) : null,
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }
}
