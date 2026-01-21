import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/errors/app_exception.dart';

class Profile {
  final String id;
  final String? fullName;
  final String? phone;
  final bool isAdmin;

  const Profile({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.isAdmin,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      fullName: json['full_name'] as String?,
      phone: json['phone'] as String?,
      isAdmin: (json['is_admin'] as bool?) ?? false,
    );
  }
}

class ProfileRepository {
  final SupabaseClient _client;
  ProfileRepository(this._client);

  Future<Profile> fetchMyProfile() async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) throw const AppException('Utilisateur non connecté');
    try {
      final row = await _client.from('profiles').select().eq('id', uid).single();
      return Profile.fromJson((row as Map).cast<String, dynamic>());
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }
}


