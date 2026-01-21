import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'src/app.dart';
import 'src/core/config/app_env.dart';
import 'src/core/services/supabase_bootstrap.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  final env = AppEnv.fromDotEnv();
  await SupabaseBootstrap.init(env);

  runApp(const ProviderScope(child: NexusTechApp()));
}


