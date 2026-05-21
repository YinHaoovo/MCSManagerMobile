class AppConstants {
  static const String appName = 'MCSManager';
  static const String appVersion = '1.0.0';
  
  static const int defaultPort = 23333;
  static const int daemonPort = 24444;
  
  static const int sessionTimeoutMinutes = 30;
  static const int connectionTimeoutSeconds = 15;
  
  static const String hiveCacheBox = 'mcsm_cache';
  static const String hiveServerProfilesBox = 'server_profiles';
  
  static const String storageKeyToken = 'auth_token';
  static const String storageKeyServerProfiles = 'server_profiles';
  static const String storageKeyLastServer = 'last_server';
}

class StatusConstants {
  static const String online = 'online';
  static const String offline = 'offline';
  static const String starting = 'starting';
  static const String stopping = 'stopping';
}

class PermissionConstants {
  static const String admin = 'admin';
  static const String user = 'user';
  static const String guest = 'guest';
}