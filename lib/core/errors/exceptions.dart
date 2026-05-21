class McsmException implements Exception {
  final String message;
  final int? statusCode;
  
  McsmException({required this.message, this.statusCode});
  
  @override
  String toString() {
    if (statusCode != null) {
      return 'MCSMException: $message (Status Code: $statusCode)';
    }
    return 'MCSMException: $message';
  }
}

class NetworkException extends McsmException {
  NetworkException({required super.message}) : super(statusCode: null);
}

class AuthenticationException extends McsmException {
  AuthenticationException({required super.message, super.statusCode});
}

class ServerException extends McsmException {
  ServerException({required super.message, super.statusCode});
}

class TerminalException extends McsmException {
  TerminalException({required super.message}) : super(statusCode: null);
}

class FileException extends McsmException {
  FileException({required super.message, super.statusCode});
}

class UserException extends McsmException {
  UserException({required super.message, super.statusCode});
}