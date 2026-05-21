import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/providers/app_provider.dart';
import 'package:mcsm_app/data/repositories/auth_repository.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});

class AuthState {
  final bool isLoading;
  final String? error;
  final bool isConnected;
  
  AuthState({
    this.isLoading = false,
    this.error,
    this.isConnected = false,
  });
  
  AuthState copyWith({
    bool? isLoading,
    String? error,
    bool? isConnected,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      isConnected: isConnected ?? this.isConnected,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref ref;
  
  AuthNotifier(this.ref) : super(AuthState());
  
  Future<void> login({
    required String host,
    required int port,
    required String username,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final authRepository = ref.read(authRepositoryProvider);
      final result = await authRepository.login(
        host: host,
        port: port,
        username: username,
        password: password,
      );
      
      final token = result['token'] as String;
      await ref.read(appProvider.notifier).login(token);
      
      state = state.copyWith(
        isLoading: false,
        isConnected: true,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  Future<void> logout() async {
    try {
      final authRepository = ref.read(authRepositoryProvider);
      await authRepository.logout();
    } finally {
      await ref.read(appProvider.notifier).logout();
    }
  }
  
  void clearError() {
    state = state.copyWith(error: null);
  }
}