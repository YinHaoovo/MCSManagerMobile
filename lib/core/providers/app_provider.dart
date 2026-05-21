import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/core/utils/secure_storage_util.dart';

class AppState {
  final bool isAuthenticated;
  final String? token;
  final bool isOnline;
  
  AppState({
    required this.isAuthenticated,
    this.token,
    this.isOnline = true,
  });
  
  AppState copyWith({
    bool? isAuthenticated,
    String? token,
    bool? isOnline,
  }) {
    return AppState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      token: token ?? this.token,
      isOnline: isOnline ?? this.isOnline,
    );
  }
}

class AppNotifier extends StateNotifier<AppState> {
  AppNotifier() : super(AppState(isAuthenticated: false)) {
    _init();
  }
  
  Future<void> _init() async {
    final token = await SecureStorageUtil.getToken();
    if (token != null && token.isNotEmpty) {
      state = state.copyWith(
        isAuthenticated: true,
        token: token,
      );
    }
  }
  
  Future<void> login(String token) async {
    await SecureStorageUtil.saveToken(token);
    state = state.copyWith(
      isAuthenticated: true,
      token: token,
    );
  }
  
  Future<void> logout() async {
    await SecureStorageUtil.clearAll();
    state = state.copyWith(
      isAuthenticated: false,
      token: null,
    );
  }
  
  void setOnlineStatus(bool isOnline) {
    state = state.copyWith(isOnline: isOnline);
  }
}

final appProvider = StateNotifierProvider<AppNotifier, AppState>((ref) {
  return AppNotifier();
});