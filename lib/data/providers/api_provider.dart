import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/constants/app_constants.dart';
import 'package:mcsm_app/core/utils/secure_storage_util.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    connectTimeout: Duration(seconds: AppConstants.connectionTimeoutSeconds),
    receiveTimeout: Duration(seconds: AppConstants.connectionTimeoutSeconds),
  ));
  
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await SecureStorageUtil.getToken();
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onResponse: (response, handler) {
      return handler.next(response);
    },
    onError: (error, handler) {
      if (error.response?.statusCode == 401) {
        SecureStorageUtil.deleteToken();
      }
      return handler.next(error);
    },
  ));
  
  return dio;
});

final baseUrlProvider = StateProvider<String>((ref) => '');

void setBaseUrl(WidgetRef ref, String url) {
  ref.read(baseUrlProvider.notifier).state = url;
}