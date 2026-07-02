import 'package:flutter/material.dart';

import '../core/exceptions/app_exceptions.dart';
import '../core/utils/session_storage.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/user_service.dart';

class PerfilService extends ChangeNotifier {
  final AuthService _authService;
  final UserService _userService;
  final SessionStorage _storage;

  PerfilService({
    AuthService? authService,
    UserService? userService,
    SessionStorage? storage,
  }) : _storage = storage ?? SessionStorage(),
       _authService = authService ?? AuthService(sessionStorage: storage),
       _userService = userService ?? UserService();

  User? _usuario;
  bool _isLoading = false;
  bool _initialized = false;

  User? get usuario => _usuario;
  bool get isLoading => _isLoading;
  bool get initialized => _initialized;
  bool get isAuthenticated => _usuario != null;
  String get nome => _usuario?.name ?? 'Visitante';
  String get email => _usuario?.email ?? '';
  String get bio => _usuario?.bio ?? '';
  String get role => _usuario?.primaryRole ?? 'guest';

  Future<bool> restoreSession() async {
    _setLoading(true);
    try {
      final token = await _storage.getToken();
      if (token == null || token.isEmpty) {
        await _storage.clearAuth();
        clearLocalSession();
        return false;
      }

      await carregarPerfil();
      if (_usuario?.isSuspended ?? false) {
        await logout();
        throw const ForbiddenException(
          'A sua conta está suspensa. Contacte o suporte.',
        );
      }

      _initialized = true;
      return _usuario != null;
    } on UnauthorizedException {
      await _storage.clearAuth();
      clearLocalSession();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> initialize() async {
    if (_initialized) return;
    _setLoading(true);
    try {
      final cached = await _storage.loadUser();
      if (cached != null) {
        _usuario = User(
          id: cached.id,
          name: cached.name,
          email: cached.email,
          status: cached.status,
          roles: [Role(id: 0, name: cached.role)],
        );
        notifyListeners();
      }

      final token = await _storage.getToken();
      if (token != null && token.isNotEmpty) {
        await carregarPerfil();
      }
    } on UnauthorizedException {
      await _storage.clearAuth();
      _usuario = null;
    } catch (_) {
      _usuario = null;
    } finally {
      _initialized = true;
      _setLoading(false);
    }
  }

  Future<void> login(String email, String password) async {
    _setLoading(true);
    try {
      final session = await _authService.login(
        email: email,
        password: password,
      );
      await _applySession(session.user);
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loginWithGoogle(String idToken) async {
    _setLoading(true);
    try {
      final session = await _authService.loginWithGoogle(idToken: idToken);
      await _applySession(session.user);
    } finally {
      _setLoading(false);
    }
  }

  Future<void> registrar({
    required String name,
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    try {
      final session = await _authService.register(
        name: name,
        email: email,
        password: password,
      );
      _usuario = session.user;
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> carregarPerfil() async {
    final user = await _userService.getProfile();
    _usuario = user;
    await _storage.saveUser(user);
    notifyListeners();
  }

  Future<void> atualizarPerfil(String nome, String bio, {String? photo}) async {
    _setLoading(true);
    try {
      final user = await _userService.updateProfile(
        name: nome,
        bio: bio,
        photo: photo,
      );
      _usuario = user;
      await _storage.saveUser(user);
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> atualizarPalavraPasse(
    String password,
    String passwordConfirmation,
  ) async {
    _setLoading(true);
    try {
      final user = await _userService.updatePassword(
        password: password,
        passwordConfirmation: passwordConfirmation,
      );
      _usuario = user;
      await _storage.saveUser(user);
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    clearLocalSession();
  }

  Future<void> _applySession(User user) async {
    _usuario = user;
    if (_usuario?.isSuspended ?? false) {
      await logout();
      throw const ForbiddenException(
        'A sua conta está suspensa. Contacte o suporte.',
      );
    }
    notifyListeners();
  }

  void clearLocalSession() {
    _usuario = null;
    _initialized = true;
    notifyListeners();
  }

  void _setLoading(bool value) {
    if (_isLoading == value) return;
    _isLoading = value;
    notifyListeners();
  }
}
