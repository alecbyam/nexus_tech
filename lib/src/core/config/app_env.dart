import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppEnv {
  final String supabaseUrl;
  final String supabaseAnonKey;
  final String whatsappPhone;

  const AppEnv({
    required this.supabaseUrl,
    required this.supabaseAnonKey,
    required this.whatsappPhone,
  });

  factory AppEnv.fromDotEnv() {
    final url = dotenv.env['SUPABASE_URL'];
    final anon = dotenv.env['SUPABASE_ANON_KEY'];
    final whatsapp = dotenv.env['WHATSAPP_PHONE'];

    if (url == null || url.isEmpty) {
      throw StateError('SUPABASE_URL manquant dans .env');
    }
    if (anon == null || anon.isEmpty) {
      throw StateError('SUPABASE_ANON_KEY manquant dans .env');
    }
    if (whatsapp == null || whatsapp.isEmpty) {
      throw StateError('WHATSAPP_PHONE manquant dans .env');
    }

    return AppEnv(supabaseUrl: url, supabaseAnonKey: anon, whatsappPhone: whatsapp);
  }
}


