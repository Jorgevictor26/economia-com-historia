import '../core/utils/json_helpers.dart';
import 'content.dart';
import 'user.dart';

class Forum {
  final int id;
  final int userId;
  final String name;
  final String? description;
  final String? rules;
  final String? category;
  final String? imageUrl;
  final String? visibility;
  final String? contentPermission;
  final bool allowAttachments;
  final String? status;
  final int topicsCount;
  final User? user;
  final List<Content> contents;
  final List<ForumTopic> topics;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Forum({
    required this.id,
    required this.userId,
    required this.name,
    this.description,
    this.rules,
    this.category,
    this.imageUrl,
    this.visibility,
    this.contentPermission,
    this.allowAttachments = false,
    this.status,
    this.topicsCount = 0,
    this.user,
    this.contents = const [],
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
      rules: jsonString(json['rules']),
      category: jsonString(json['category']),
      imageUrl: jsonString(json['image_url']),
      visibility: jsonString(json['visibility']),
      contentPermission: jsonString(json['content_permission']),
      allowAttachments: jsonBool(json['allow_attachments']) ?? false,
      status: jsonString(json['status']),
      topicsCount: jsonInt(json['topics_count']) ?? 0,
      user: json['user'] != null ? User.fromJson(jsonMap(json['user'])) : null,
      contents: jsonList(json['contents'], Content.fromJson),
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
  final Forum? forum;
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
    this.forum,
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
      forum: json['forum'] != null
          ? Forum.fromJson(jsonMap(json['forum']))
          : null,
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
