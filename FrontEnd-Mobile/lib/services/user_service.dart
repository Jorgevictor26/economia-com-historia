import '../core/utils/api_client.dart';
import '../core/utils/json_helpers.dart';
import '../models/user.dart';

class UserService {
  final ApiClient _api;

  UserService({ApiClient? api}) : _api = api ?? ApiClient();

  Future<User> getProfile() async {
    final response = await _api.get('/profile');
    return User.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }

  Future<User> updateProfile({
    required String name,
    String? bio,
    String? photo,
  }) async {
    final response = await _api.put(
      '/profile',
      body: {
        'name': name,
        'bio': ?bio,
        'photo': ?photo,
      },
    );
    return User.fromJson(jsonMap(ApiClient.unwrapData(response)));
  }
}
