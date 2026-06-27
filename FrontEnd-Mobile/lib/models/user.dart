import '../core/utils/json_helpers.dart';

class User {
  final int id;
  final String name;
  final String email;
  final String? photo;
  final String? bio;
  final String? status;
  final DateTime? jindungoSubscriptionExpiresAt;
  final List<Role> roles;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.photo,
    this.bio,
    this.status,
    this.jindungoSubscriptionExpiresAt,
    this.roles = const [],
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: jsonInt(json['id']) ?? 0,
      name: jsonString(json['name']) ?? '',
      email: jsonString(json['email']) ?? '',
      photo: jsonString(json['photo']),
      bio: jsonString(json['bio']),
      status: jsonString(json['status']),
      jindungoSubscriptionExpiresAt: jsonDate(
        json['jindungo_subscription_expires_at'],
      ),
      roles: jsonList(json['roles'], Role.fromJson),
    );
  }

  String get primaryRole {
    if (roles.isEmpty) return 'user';
    return roles.first.name;
  }

  bool get isSuspended => status != null && status != 'active';

  bool get hasActiveJindungoSubscription {
    final expires = jindungoSubscriptionExpiresAt;
    return expires != null && expires.isAfter(DateTime.now());
  }

  bool get canCreateContent {
    final normalized = roles.map((role) => role.normalizedName).toSet();
    return normalized.contains('writer') ||
        normalized.contains('admin') ||
        normalized.contains('superadmin');
  }

  bool hasRole(String role) {
    final normalized = role.toLowerCase().replaceAll(RegExp(r'[\s_-]'), '');
    return roles.any((item) => item.normalizedName == normalized);
  }
}

class Role {
  final int id;
  final String name;
  final String? description;

  const Role({required this.id, required this.name, this.description});

  factory Role.fromJson(Map<String, dynamic> json) {
    return Role(
      id: jsonInt(json['id']) ?? 0,
      name: jsonString(json['name']) ?? 'user',
      description: jsonString(json['description']),
    );
  }

  String get normalizedName =>
      name.toLowerCase().replaceAll(RegExp(r'[\s_-]'), '');
}
