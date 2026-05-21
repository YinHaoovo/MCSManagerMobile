class ApiConstants {
  static const String basePath = '/api';
  
  static const String login = '$basePath/login';
  static const String logout = '$basePath/logout';
  static const String refreshToken = '$basePath/refresh';
  
  static const String servers = '$basePath/servers';
  static const String server = '$basePath/servers/{id}';
  static const String serverStart = '$basePath/servers/{id}/start';
  static const String serverStop = '$basePath/servers/{id}/stop';
  static const String serverRestart = '$basePath/servers/{id}/restart';
  
  static const String terminal = '$basePath/terminal';
  static const String terminalSend = '$basePath/terminal/send';
  
  static const String filesList = '$basePath/files/list';
  static const String filesRead = '$basePath/files/read';
  static const String filesWrite = '$basePath/files/write';
  static const String filesUpload = '$basePath/files/upload';
  static const String filesDownload = '$basePath/files/download';
  static const String filesDelete = '$basePath/files/delete';
  static const String filesRename = '$basePath/files/rename';
  
  static const String users = '$basePath/users';
  static const String user = '$basePath/users/{id}';
  static const String userCreate = '$basePath/users/create';
  static const String userUpdate = '$basePath/users/{id}/update';
  static const String userDelete = '$basePath/users/{id}/delete';
}

class WebSocketConstants {
  static const String terminalPath = '/api/terminal';
}