import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/constants/api_constants.dart';
import 'package:mcsm_app/core/errors/exceptions.dart';
import 'package:mcsm_app/data/models/server_model.dart';
import 'package:mcsm_app/data/providers/api_provider.dart';

final serverRepositoryProvider = Provider<ServerRepository>((ref) {
  return ServerRepository(ref);
});

class ServerRepository {
  final Ref ref;
  
  ServerRepository(this.ref);
  
  Future<List<ServerModel>> getServers() async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.get('$baseUrl${ApiConstants.servers}');
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => ServerModel.fromJson(json)).toList();
      } else {
        throw ServerException(
          message: 'Failed to fetch servers',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerException(
        message: e.message ?? 'Failed to connect',
        statusCode: e.response?.statusCode,
      );
    }
  }
  
  Future<ServerModel> getServer(String id) async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.get('$baseUrl${ApiConstants.server.replace('{id}', id)}');
      
      if (response.statusCode == 200) {
        return ServerModel.fromJson(response.data);
      } else {
        throw ServerException(
          message: 'Failed to fetch server',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerException(
        message: e.message ?? 'Failed to connect',
        statusCode: e.response?.statusCode,
      );
    }
  }
  
  Future<void> startServer(String id) async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.post('$baseUrl${ApiConstants.serverStart.replace('{id}', id)}');
      
      if (response.statusCode != 200) {
        throw ServerException(
          message: 'Failed to start server',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerException(
        message: e.message ?? 'Failed to connect',
        statusCode: e.response?.statusCode,
      );
    }
  }
  
  Future<void> stopServer(String id) async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.post('$baseUrl${ApiConstants.serverStop.replace('{id}', id)}');
      
      if (response.statusCode != 200) {
        throw ServerException(
          message: 'Failed to stop server',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerException(
        message: e.message ?? 'Failed to connect',
        statusCode: e.response?.statusCode,
      );
    }
  }
  
  Future<void> restartServer(String id) async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.post('$baseUrl${ApiConstants.serverRestart.replace('{id}', id)}');
      
      if (response.statusCode != 200) {
        throw ServerException(
          message: 'Failed to restart server',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw ServerException(
        message: e.message ?? 'Failed to connect',
        statusCode: e.response?.statusCode,
      );
    }
  }
}