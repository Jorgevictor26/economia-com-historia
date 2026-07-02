import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../constants/api_constants.dart';
import '../exceptions/app_exceptions.dart';
import 'session_storage.dart';

class ApiClient {
  static FutureOr<void> Function()? onUnauthorized;

  final http.Client _client;
  final SessionStorage _session;

  ApiClient({http.Client? client, SessionStorage? session})
    : _client = client ?? http.Client(),
      _session = session ?? SessionStorage();

  Future<dynamic> get(String path, {Map<String, Object?> query = const {}}) {
    return _send('GET', path, query: query);
  }

  Future<dynamic> post(
    String path, {
    Map<String, Object?> query = const {},
    Object? body,
  }) {
    return _send('POST', path, query: query, body: body);
  }

  Future<dynamic> put(String path, {Object? body}) {
    return _send('PUT', path, body: body);
  }

  Future<dynamic> patch(String path, {Object? body}) {
    return _send('PATCH', path, body: body);
  }

  Future<dynamic> delete(String path) {
    return _send('DELETE', path);
  }

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, Object?> query = const {},
    Object? body,
  }) async {
    try {
      final token = await _session.getToken();
      final tokenType = await _session.getTokenType();
      final headers = <String, String>{
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        if (token != null && token.isNotEmpty)
          'Authorization': '${tokenType ?? 'Bearer'} $token',
      };

      final uri = ApiConstants.uri(path, query);
      final encodedBody = body == null ? null : jsonEncode(body);

      final request = switch (method) {
        'GET' => _client.get(uri, headers: headers),
        'POST' => _client.post(uri, headers: headers, body: encodedBody),
        'PUT' => _client.put(uri, headers: headers, body: encodedBody),
        'PATCH' => _client.patch(uri, headers: headers, body: encodedBody),
        'DELETE' => _client.delete(uri, headers: headers),
        _ => throw ArgumentError('Unsupported method $method'),
      };

      final response = await request.timeout(ApiConstants.requestTimeout);

      return _handleResponse(response);
    } on SocketException {
      throw const NetworkException();
    } on TimeoutException {
      throw const TimeoutAppException();
    } on FormatException {
      throw const BadResponseException();
    }
  }

  Future<dynamic> _handleResponse(http.Response response) async {
    final status = response.statusCode;
    final decoded = _decode(response.body);

    if (status >= 200 && status < 300) {
      return decoded;
    }

    final message = _messageFrom(decoded, status);
    if (status == 401 || status == 419) {
      await _session.clearAuth();
      final handler = onUnauthorized;
      if (handler != null) unawaited(Future.sync(handler));
      throw UnauthorizedException(message, status);
    }
    if (status == 403) throw ForbiddenException(message);
    if (status == 404) throw NotFoundException(message);
    if (status == 400 || status == 409 || status == 422) {
      throw ValidationAppException(
        message,
        statusCode: status,
        details: decoded,
      );
    }
    if (status >= 500) throw ServerAppException(message);
    throw AppException(message, statusCode: status, details: decoded);
  }

  dynamic _decode(String body) {
    if (body.trim().isEmpty) return null;
    return jsonDecode(body);
  }

  String _messageFrom(dynamic decoded, int status) {
    if (decoded is Map) {
      final message = decoded['message'];
      if (message != null && message.toString().trim().isNotEmpty) {
        return _friendlyMessage(message.toString(), status);
      }
      final errors = decoded['errors'];
      if (errors is Map && errors.isNotEmpty) {
        final first = errors.values.first;
        if (first is List && first.isNotEmpty) {
          return _friendlyMessage(first.first.toString(), status);
        }
        return _friendlyMessage(first.toString(), status);
      }
    }
    return switch (status) {
      400 => 'Pedido inválido.',
      401 => 'Sessão expirada.',
      419 => 'Sessão expirada.',
      403 => 'Acesso negado.',
      404 => 'Recurso não encontrado.',
      409 => 'Não foi possível concluir a operação.',
      422 => 'Verifique os dados enviados.',
      _ => 'Erro inesperado. Tente novamente.',
    };
  }

  String _friendlyMessage(String message, int status) {
    final normalized = message.toLowerCase();
    if (status == 401 ||
        status == 419 ||
        normalized.contains('unauthenticated')) {
      return 'Sessão expirada.';
    }
    if (normalized.contains('not found')) {
      return 'Recurso não encontrado.';
    }
    if (normalized.contains('not allowed') ||
        normalized.contains('forbidden')) {
      return 'Acesso negado.';
    }
    if (normalized.contains('subscription')) {
      return 'Este conteúdo requer uma subscrição ativa.';
    }
    if (normalized.contains('unable to')) {
      return 'Não foi possível concluir a operação.';
    }
    if (status >= 500) return 'Erro no servidor. Tente mais tarde.';
    return message;
  }

  static dynamic unwrapData(dynamic response) {
    if (response is Map && response.containsKey('data')) {
      return response['data'];
    }
    return response;
  }
}
