import '../core/utils/json_helpers.dart';

class AppNotification {
  final int id;
  final int userId;
  final String title;
  final String message;
  final bool isRead;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const AppNotification({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.isRead,
    this.createdAt,
    this.updatedAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: jsonInt(json['id']) ?? 0,
      userId: jsonInt(json['user_id']) ?? 0,
      title: jsonString(json['title']) ?? '',
      message: jsonString(json['message']) ?? '',
      isRead: jsonBool(json['is_read']) ?? false,
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }
}
