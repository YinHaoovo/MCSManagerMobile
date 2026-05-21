import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mcsm_app/data/models/user_model.dart';

final userProvider = StateNotifierProvider<UserNotifier, UserState>((ref) {
  return UserNotifier(ref);
});

class UserState {
  final bool isLoading;
  final List<UserModel> users;
  final String? error;
  
  UserState({
    this.isLoading = false,
    this.users = const [],
    this.error,
  });
  
  UserState copyWith({
    bool? isLoading,
    List<UserModel>? users,
    String? error,
  }) {
    return UserState(
      isLoading: isLoading ?? this.isLoading,
      users: users ?? this.users,
      error: error ?? this.error,
    );
  }
}

class UserNotifier extends StateNotifier<UserState> {
  final Ref ref;
  
  UserNotifier(this.ref) : super(UserState()) {
    fetchUsers();
  }
  
  Future<void> fetchUsers() async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      await Future.delayed(const Duration(seconds: 1));
      
      final mockUsers = [
        UserModel(
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          isActive: true,
        ),
        UserModel(
          id: '2',
          username: 'user1',
          email: 'user1@example.com',
          role: 'user',
          isActive: true,
        ),
        UserModel(
          id: '3',
          username: 'guest',
          email: 'guest@example.com',
          role: 'guest',
          isActive: false,
        ),
      ];
      
      state = state.copyWith(
        isLoading: false,
        users: mockUsers,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  Future<void> createUser(UserModel user) async {
    try {
      state = state.copyWith(
        users: [...state.users, user],
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
  
  Future<void> updateUser(String id, UserModel updatedUser) async {
    try {
      state = state.copyWith(
        users: state.users.map((u) => u.id == id ? updatedUser : u).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
  
  Future<void> deleteUser(String id) async {
    try {
      state = state.copyWith(
        users: state.users.where((u) => u.id != id).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}