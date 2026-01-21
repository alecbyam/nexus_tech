import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/supabase_providers.dart';
import '../data/profile_repository.dart';

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return ProfileRepository(client);
});

final myProfileProvider = FutureProvider<Profile>((ref) async {
  // refresh à chaque changement auth
  ref.watch(authStateChangesProvider);
  return ref.watch(profileRepositoryProvider).fetchMyProfile();
});

final isAdminProvider = Provider<AsyncValue<bool>>((ref) {
  final user = ref.watch(userProvider);
  if (user == null) return const AsyncData(false);
  final profile = ref.watch(myProfileProvider);
  return profile.whenData((p) => p.isAdmin);
});


