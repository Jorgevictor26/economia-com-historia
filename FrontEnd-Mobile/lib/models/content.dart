import '../core/constants/api_constants.dart';
import '../core/utils/json_helpers.dart';
import 'taxonomy.dart';
import 'user.dart';

class Content {
  final int id;
  final int? userId;
  final int? categoryId;
  final int? contentTypeId;
  final String title;
  final String? summary;
  final String? content;
  final String? image;
  final String? video;
  final String? imageUrl;
  final String? videoUrl;
  final String? audioUrl;
  final String? documentUrl;
  final String? visibility;
  final String? authorPhotoUrl;
  final bool? canAccess;
  final int viewsCount;
  final int reactionsCount;
  final int commentsCount;
  final bool likedByMe;
  final User? author;
  final Category? category;
  final ContentType? contentType;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Content({
    required this.id,
    this.userId,
    this.categoryId,
    this.contentTypeId,
    required this.title,
    this.summary,
    this.content,
    this.image,
    this.video,
    this.imageUrl,
    this.videoUrl,
    this.audioUrl,
    this.documentUrl,
    this.visibility,
    this.authorPhotoUrl,
    this.canAccess,
    this.viewsCount = 0,
    this.reactionsCount = 0,
    this.commentsCount = 0,
    this.likedByMe = false,
    this.author,
    this.category,
    this.contentType,
    this.createdAt,
    this.updatedAt,
  });

  factory Content.fromJson(Map<String, dynamic> json) {
    return Content(
      id: jsonInt(json['id']) ?? 0,
      userId: jsonInt(json['user_id']),
      categoryId: jsonInt(json['category_id']),
      contentTypeId: jsonInt(json['content_type_id']),
      title: jsonString(json['title']) ?? '',
      summary: jsonString(json['summary']),
      content: jsonString(json['content']),
      image: jsonString(json['image']),
      video: jsonString(json['video']),
      imageUrl: jsonString(json['image_url']),
      videoUrl: jsonString(json['video_url']),
      audioUrl: jsonString(json['audio_url']),
      documentUrl: jsonString(json['document_url']),
      visibility: jsonString(json['visibility']),
      authorPhotoUrl: jsonString(json['author_photo_url']),
      canAccess: jsonBool(json['can_access']),
      viewsCount: jsonInt(json['views_count']) ?? 0,
      reactionsCount: jsonInt(json['reactions_count']) ?? 0,
      commentsCount: jsonInt(json['comments_count']) ?? 0,
      likedByMe: jsonBool(json['liked_by_me']) ?? false,
      author: json['author'] != null
          ? User.fromJson(jsonMap(json['author']))
          : json['user'] != null
          ? User.fromJson(jsonMap(json['user']))
          : null,
      category: json['category'] != null
          ? Category.fromJson(jsonMap(json['category']))
          : null,
      contentType: json['content_type'] != null
          ? ContentType.fromJson(jsonMap(json['content_type']))
          : null,
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }

  String? get displayImage => ApiConstants.mediaUrl(imageUrl ?? image);

  String? get displayVideo => ApiConstants.mediaUrl(videoUrl ?? video);

  String? get displayAudio => ApiConstants.mediaUrl(audioUrl);

  String get typeSlug => contentType?.slug ?? '';

  bool get isPodcast => typeSlug.contains('podcast') || displayAudio != null;

  bool get isVideo => typeSlug == 'video' || displayVideo != null;

  bool get isJindungo => typeSlug == 'jindungo';

  bool get isLocked => canAccess == false;
}

class ContentProgress {
  final int id;
  final int userId;
  final int contentId;
  final int progressPercent;
  final int? lastPositionSeconds;
  final DateTime? completedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final Content? content;

  const ContentProgress({
    required this.id,
    required this.userId,
    required this.contentId,
    required this.progressPercent,
    this.lastPositionSeconds,
    this.completedAt,
    this.createdAt,
    this.updatedAt,
    this.content,
  });

  factory ContentProgress.fromJson(Map<String, dynamic> json) {
    return ContentProgress(
      id: jsonInt(json['id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      contentId: jsonInt(json['content_id']) ?? 0,
      progressPercent: jsonInt(json['progress_percent']) ?? 0,
      lastPositionSeconds: jsonInt(json['last_position_seconds']),
      completedAt: jsonDate(json['completed_at']),
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
      content: json['content'] != null
          ? Content.fromJson(jsonMap(json['content']))
          : null,
    );
  }
}

class SavedContent {
  final int id;
  final int userId;
  final int contentId;
  final DateTime? createdAt;
  final Content? content;

  const SavedContent({
    required this.id,
    required this.userId,
    required this.contentId,
    this.createdAt,
    this.content,
  });

  factory SavedContent.fromJson(Map<String, dynamic> json) {
    return SavedContent(
      id: jsonInt(json['id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      contentId: jsonInt(json['content_id']) ?? 0,
      createdAt: jsonDate(json['created_at']),
      content: json['content'] != null
          ? Content.fromJson(jsonMap(json['content']))
          : null,
    );
  }
}
