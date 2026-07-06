import 'package:shared_preferences/shared_preferences.dart';

import '../../models/user.dart';

class SessionStorage {
  static const _tokenKey = 'auth_token';
  static const _tokenTypeKey = 'token_type';
  static const _userIdKey = 'user_id';
  static const _userNameKey = 'user_name';
  static const _userEmailKey = 'user_email';
  static const _userRoleKey = 'user_role';
  static const _userStatusKey = 'user_status';
  static const _userPhotoKey = 'user_photo';

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<String?> getTokenType() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenTypeKey) ?? 'Bearer';
  }

  Future<void> saveAuth({
    required String token,
    required String tokenType,
    required User user,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_tokenTypeKey, tokenType);
    await saveUser(user);
  }

  Future<void> saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_userIdKey, user.id);
    await prefs.setString(_userNameKey, user.name);
    await prefs.setString(_userEmailKey, user.email);
    await prefs.setString(_userRoleKey, user.primaryRole);
    await prefs.setString(_userStatusKey, user.status ?? '');
    final photo = user.photo?.trim();
    if (photo == null || photo.isEmpty) {
      await prefs.remove(_userPhotoKey);
    } else {
      await prefs.setString(_userPhotoKey, photo);
    }
  }

  Future<CachedUser?> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getInt(_userIdKey);
    final name = prefs.getString(_userNameKey);
    final email = prefs.getString(_userEmailKey);
    if (id == null || name == null || email == null) return null;
    return CachedUser(
      id: id,
      name: name,
      email: email,
      role: prefs.getString(_userRoleKey) ?? 'user',
      status: prefs.getString(_userStatusKey),
      photo: prefs.getString(_userPhotoKey),
    );
  }

  Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_tokenTypeKey);
    await prefs.remove(_userIdKey);
    await prefs.remove(_userNameKey);
    await prefs.remove(_userEmailKey);
    await prefs.remove(_userRoleKey);
    await prefs.remove(_userStatusKey);
    await prefs.remove(_userPhotoKey);
  }
}

class CachedUser {
  final int id;
  final String name;
  final String email;
  final String role;
  final String? status;
  final String? photo;

  const CachedUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.status,
    this.photo,
  });
}
