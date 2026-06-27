import '../core/utils/json_helpers.dart';

class Category {
  final int id;
  final String name;
  final String? description;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Category({
    required this.id,
    required this.name,
    this.description,
    this.createdAt,
    this.updatedAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: jsonInt(json['id']) ?? 0,
      name: jsonString(json['name']) ?? '',
      description: jsonString(json['description']),
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }
}

class ContentType {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const ContentType({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.createdAt,
    this.updatedAt,
  });

  factory ContentType.fromJson(Map<String, dynamic> json) {
    return ContentType(
      id: jsonInt(json['id']) ?? 0,
      name: jsonString(json['name']) ?? '',
      slug: jsonString(json['slug']) ?? '',
      description: jsonString(json['description']),
      createdAt: jsonDate(json['created_at']),
      updatedAt: jsonDate(json['updated_at']),
    );
  }
}
