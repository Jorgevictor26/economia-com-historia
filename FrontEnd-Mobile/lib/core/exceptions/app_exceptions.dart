class AppException implements Exception {
  final String message;
  final int? statusCode;
  final Object? details;

  const AppException(this.message, {this.statusCode, this.details});

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  const NetworkException()
    : super('Sem conexao a internet. Verifique a rede e tente novamente.');
}

class TimeoutAppException extends AppException {
  const TimeoutAppException()
    : super('A operacao demorou muito tempo. Tente novamente.');
}

class BadResponseException extends AppException {
  const BadResponseException() : super('Erro ao processar dados do servidor.');
}

class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message = 'Sessao expirada.'])
    : super(statusCode: 401);
}

class ForbiddenException extends AppException {
  const ForbiddenException([super.message = 'Acesso negado.'])
    : super(statusCode: 403);
}

class NotFoundException extends AppException {
  const NotFoundException([super.message = 'Recurso nao encontrado.'])
    : super(statusCode: 404);
}

class ValidationAppException extends AppException {
  const ValidationAppException(
    super.message, {
    super.statusCode,
    super.details,
  });
}

class ServerAppException extends AppException {
  const ServerAppException([
    super.message = 'Erro no servidor. Tente mais tarde.',
  ]);
}
