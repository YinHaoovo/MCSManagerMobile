import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mcsm_app/core/constants/app_constants.dart';

class SecureStorageUtil {
  static final FlutterSecureStorage _storage = FlutterSecureStorage();
  
  static Future<void> saveToken(String token) async {
    await _storage.write(key: AppConstants.storageKeyToken, value: token);
  }
  
  static Future<String?> getToken() async {
    return await _storage.read(key: AppConstants.storageKeyToken);
  }
  
  static Future<void> deleteToken() async {
    await _storage.delete(key: AppConstants.storageKeyToken);
  }
  
  static Future<void> saveServerProfile(String profileJson) async {
    await _storage.write(key: AppConstants.storageKeyServerProfiles, value: profileJson);
  }
  
  static Future<String?> getServerProfile() async {
    return await _storage.read(key: AppConstants.storageKeyServerProfiles);
  }
  
  static Future<void> saveLastServer(String serverId) async {
    await _storage.write(key: AppConstants.storageKeyLastServer, value: serverId);
  }
  
  static Future<String?> getLastServer() async {
    return await _storage.read(key: AppConstants.storageKeyLastServer);
  }
  
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}