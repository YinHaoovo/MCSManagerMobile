import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/constants/api_constants.dart';
import 'package:mcsm_app/core/errors/exceptions.dart';
import 'package:mcsm_app/data/models/file_model.dart';
import 'package:mcsm_app/data/providers/api_provider.dart';

final fileRepositoryProvider = Provider<FileRepository>((ref) {
  return FileRepository(ref);
});

class FileRepository {
  final Ref ref;
  
  FileRepository(this.ref);
  
  Future<List<FileModel>> listFiles({
    required String serverId,
    required String path,
  }) async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.get(
        '$baseUrl${ApiConstants.filesList}',
        queryParameters: {
          'serverId': serverId,
          'path': path,
        },
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => FileModel.fromJson(json)).toList();
      } else {
        throw FileException(
          message: 'Failed to list files',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw FileException(
        message: e.message ?? 'Failed to connect',
        statusCode: e.response?.statusCode,
      );
    }
  }
  
  Future<String> readFile({
    required String serverId,
    required String path,
  }) async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.get(
        '$baseUrl${ApiConstants.filesRead}',
        queryParameters: {
          'serverId': serverId,
          'path': path,
        },
      );
      
      if (response.statusCode == 200) {
        return response.data['content'] ?? '';
      } else {
        throw FileException(
          message: 'Failed to read file',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw FileException(
        message: e.message ?? 'Failed to connect',
        statusCode: e.response?.statusCode,
      );
    }
  }
  
  Future<void> writeFile({
    required String serverId,
    required String path,
    required String content,
  }) async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.post(
        '$baseUrl${ApiConstants.filesWrite}',
        data: {
          'serverId': serverId,
          'path': path,
          'content': content,
        },
      );
      
      if (response.statusCode != 200) {
        throw FileException(
          message: 'Failed to write file',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw FileException(
        message: e.message ?? 'Failed to connect',
        statusCode: e.response?.statusCode,
      );
    }
  }
  
  Future<void> deleteFile({
    required String serverId,
    required String path,
  }) async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.post(
        '$baseUrl${ApiConstants.filesDelete}',
        data: {
          'serverId': serverId,
          'path': path,
        },
      );
      
      if (response.statusCode != 200) {
        throw FileException(
          message: 'Failed to delete file',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw FileException(
        message: e.message ?? 'Failed to connect',
        statusCode: e.response?.statusCode,
      );
    }
  }
  
  Future<void> renameFile({
    required String serverId,
    required String oldPath,
    required String newPath,
  }) async {
    final dio = ref.read(dioProvider);
    final baseUrl = ref.read(baseUrlProvider);
    
    try {
      final response = await dio.post(
        '$baseUrl${ApiConstants.filesRename}',
        data: {
          'serverId': serverId,
          'oldPath': oldPath,
          'newPath': newPath,
        },
      );
      
      if (response.statusCode != 200) {
        throw FileException(
          message: 'Failed to rename file',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw FileException(
        message: e.message ?? 'Failed to connect',
        statusCode: e.response?.statusCode,
      );
    }
  }
}