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
    try {
      final url = dotenv.env['SUPABASE_URL']?.trim();
      final anon = dotenv.env['SUPABASE_ANON_KEY']?.trim();
      final whatsapp = dotenv.env['WHATSAPP_PHONE']?.trim();

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
    } catch (e) {
      throw StateError('Erreur chargement .env: $e');
    }
  }
}


