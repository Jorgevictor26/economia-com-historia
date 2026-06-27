import '../core/utils/json_helpers.dart';
import 'user.dart';

class Comment {
  final int id;
  final int userId;
  final int contentId;
  final String comment;
  final DateTime? hiddenAt;
  final DateTime? createdAt;
  final User? user;
  final List<CommentReply> replies;

  const Comment({
    required this.id,
    required this.userId,
    required this.contentId,
    required this.comment,
    this.hiddenAt,
    this.createdAt,
    this.user,
    this.replies = const [],
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: jsonInt(json['id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      contentId: jsonInt(json['content_id']) ?? 0,
      comment: jsonString(json['comment']) ?? '',
      hiddenAt: jsonDate(json['hidden_at']),
      createdAt: jsonDate(json['created_at']),
      user: json['user'] != null ? User.fromJson(jsonMap(json['user'])) : null,
      replies: jsonList(json['replies'], CommentReply.fromJson),
    );
  }
}

class CommentReply {
  final int id;
  final int commentId;
  final int userId;
  final String reply;
  final DateTime? createdAt;
  final User? user;

  const CommentReply({
    required this.id,
    required this.commentId,
    required this.userId,
    required this.reply,
    this.createdAt,
    this.user,
  });

  factory CommentReply.fromJson(Map<String, dynamic> json) {
    return CommentReply(
      id: jsonInt(json['id']) ?? 0,
      commentId: jsonInt(json['comment_id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      reply: jsonString(json['reply']) ?? '',
      createdAt: jsonDate(json['created_at']),
      user: json['user'] != null ? User.fromJson(jsonMap(json['user'])) : null,
    );
  }
}

class ReactionSummary {
  final String reactionType;
  final int count;

  const ReactionSummary({required this.reactionType, required this.count});

  factory ReactionSummary.fromJson(Map<String, dynamic> json) {
    return ReactionSummary(
      reactionType: jsonString(json['reaction_type']) ?? '',
      count: jsonInt(json['count']) ?? 0,
    );
  }
}

class ToggleReactionResult {
  final bool reacted;
  final int reactionsCount;

  const ToggleReactionResult({
    required this.reacted,
    required this.reactionsCount,
  });

  factory ToggleReactionResult.fromJson(Map<String, dynamic> json) {
    return ToggleReactionResult(
      reacted: jsonBool(json['reacted']) ?? false,
      reactionsCount: jsonInt(json['reactions_count']) ?? 0,
    );
  }
}
