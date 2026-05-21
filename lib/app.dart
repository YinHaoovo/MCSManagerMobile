import 'package:flutter/material.dart';
import 'package:mcsm_app/core/theme/app_theme.dart';
import 'package:mcsm_app/features/auth/presentation/login_page.dart';
import 'package:mcsm_app/features/dashboard/presentation/dashboard_page.dart';
import 'package:mcsm_app/core/providers/app_provider.dart';

class MCSMApp extends ConsumerWidget {
  const MCSMApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAuthenticated = ref.watch(appProvider).isAuthenticated;
    
    return MaterialApp(
      title: 'MCSManager',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      debugShowCheckedModeBanner: false,
      home: isAuthenticated ? const DashboardPage() : const LoginPage(),
    );
  }
}