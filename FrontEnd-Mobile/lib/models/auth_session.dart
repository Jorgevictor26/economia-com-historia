import '../core/utils/json_helpers.dart';
import 'user.dart';

class AuthSession {
  final User user;
  final String token;
  final String tokenType;

  const AuthSession({
    required this.user,
    required this.token,
    required this.tokenType,
  });

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      user: User.fromJson(jsonMap(json['user'])),
      token: jsonString(json['token']) ?? '',
      tokenType: jsonString(json['token_type']) ?? 'Bearer',
    );
  }
}
