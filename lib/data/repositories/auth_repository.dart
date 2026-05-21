import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/constants/api_constants.dart';
import 'package:mcsm_app/core/errors/exceptions.dart';
import 'package:mcsm_app/data/providers/api_provider.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref);
});

class AuthRepository {
  final Ref ref;
  
  AuthRepository(this.ref);
  
  Future<Map<String, dynamic>> login({
    required String host,
    required int port,
    required String username,
    required String password,
  }) async {
    final dio = ref.read(dioProvider);
    final url = 'http://$host:$port${ApiConstants.login}';
    
    try {
      final response = await dio.post(
        url,
        data: {
          'username': username,
          'password': password,
        },
      );
      
      if (response.statusCode == 200) {
        ref.read(baseUrlProvider.notifier).state = 'http://$host:$port';
        return response.data;
      } else {
        throw AuthenticationException(
          message: 'Login failed',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw AuthenticationException(
        message: e.message ?? 'Connection failed',
        statusCode: e.response?.statusCode,
      );
    }
  }
  
  Future<void> logout() async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      await dio.post('$baseUrl${ApiConstants.logout}');
    } on DioException {
    }
  }
  
  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.post(
        '$baseUrl${ApiConstants.refreshToken}',
        data: {'refreshToken': refreshToken},
      );
      
      if (response.statusCode == 200) {
        return response.data;
      } else {
        throw AuthenticationException(
          message: 'Token refresh failed',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw AuthenticationException(
        message: e.message ?? 'Token refresh failed',
        statusCode: e.response?.statusCode,
      );
    }
  }
}