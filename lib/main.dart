import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:mcsm_app/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  await Hive.openBox('mcsm_cache');
  await Hive.openBox('server_profiles');
  
  runApp(
    const ProviderScope(
      child: MCSMApp(),
    ),
  );
}