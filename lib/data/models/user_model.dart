import 'package:mcsm_app/core/constants/permission_constants.dart';

class UserModel {
  final String id;
  final String username;
  final String? email;
  final String role;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? lastLogin;
  
  UserModel({
    required this.id,
    required this.username,
    this.email,
    this.role = PermissionConstants.user,
    this.isActive = true,
    this.createdAt,
    this.lastLogin,
  });
  
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      username: json['username'] ?? '',
      email: json['email'],
      role: json['role'] ?? PermissionConstants.user,
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      lastLogin: json['lastLogin'] != null ? DateTime.parse(json['lastLogin']) : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'role': role,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'lastLogin': lastLogin?.toIso8601String(),
    };
  }
  
  bool get isAdmin => role == PermissionConstants.admin;
  bool get isUser => role == PermissionConstants.user;
  bool get isGuest => role == PermissionConstants.guest;
}