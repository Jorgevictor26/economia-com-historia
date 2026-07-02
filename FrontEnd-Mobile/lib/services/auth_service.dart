import 'package:flutter/foundation.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/api_client.dart';
import '../core/utils/json_helpers.dart';
import '../core/utils/session_storage.dart';
import '../models/auth_session.dart';

class AuthService {
  final ApiClient _api;
  final SessionStorage _sessionStorage;

  AuthService({ApiClient? api, SessionStorage? sessionStorage})
    : _api = api ?? ApiClient(session: sessionStorage),
      _sessionStorage = sessionStorage ?? SessionStorage();

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final response = await _api.post(
      '/login',
      body: {'email': email, 'password': password},
    );
    final session = AuthSession.fromJson(
      jsonMap(ApiClient.unwrapData(response)),
    );
    await _sessionStorage.saveAuth(
      token: session.token,
      tokenType: session.tokenType,
      user: session.user,
    );
    return session;
  }

  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
    String? bio,
  }) async {
    final response = await _api.post(
      '/register',
      body: {
        'name': name,
        'email': email,
        'password': password,
        'password_confirmation': password,
        if (bio != null && bio.trim().isNotEmpty) 'bio': bio.trim(),
      },
    );
    final session = AuthSession.fromJson(
      jsonMap(ApiClient.unwrapData(response)),
    );
    await _sessionStorage.saveAuth(
      token: session.token,
      tokenType: session.tokenType,
      user: session.user,
    );
    return session;
  }

  Future<AuthSession> loginWithGoogle({required String idToken}) async {
    try {
      final response = await _api.post(
        '/auth/google',
        body: {'id_token': idToken},
      );
      final session = AuthSession.fromJson(
        jsonMap(ApiClient.unwrapData(response)),
      );
      await _sessionStorage.saveAuth(
        token: session.token,
        tokenType: session.tokenType,
        user: session.user,
      );
      return session;
    } on AppException catch (error) {
      debugPrint(
        'POST /auth/google failed: status=${error.statusCode}, '
        'message=${error.message}, details=${error.details}',
      );
      rethrow;
    } catch (error, stackTrace) {
      debugPrint('POST /auth/google parsing failed: $error\n$stackTrace');
      throw const BadResponseException();
    }
  }

  Future<void> forgotPassword(String email) async {
    await _api.post('/forgot-password', body: {'email': email});
  }

  Future<void> resetPassword({
    required String email,
    required String token,
    required String password,
  }) async {
    await _api.post(
      '/reset-password',
      body: {
        'email': email,
        'token': token,
        'password': password,
        'password_confirmation': password,
      },
    );
  }

  Future<void> logout() async {
    final token = await _sessionStorage.getToken();
    if (token != null && token.isNotEmpty) {
      try {
        await _api.post('/logout');
      } catch (_) {
        // The local session must be cleared even when the server token
        // is already invalid or the device is offline.
      }
    }
    await _sessionStorage.clearAuth();
  }
}
