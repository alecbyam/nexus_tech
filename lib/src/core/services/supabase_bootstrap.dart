import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/app_env.dart';

class SupabaseBootstrap {
  static Future<void> init(AppEnv env) async {
    await Supabase.initialize(
      url: env.supabaseUrl,
      anonKey: env.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
    );
  }

  static SupabaseClient get client => Supabase.instance.client;
}


