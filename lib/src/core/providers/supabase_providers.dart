import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/supabase_bootstrap.dart';

final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return SupabaseBootstrap.client;
});

final authStateChangesProvider = StreamProvider<AuthState>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return client.auth.onAuthStateChange;
});

final sessionProvider = Provider<Session?>((ref) {
  final authState = ref.watch(authStateChangesProvider);
  return authState.maybeWhen(
    data: (event) => event.session,
    orElse: () => SupabaseBootstrap.client.auth.currentSession,
  );
});

final userProvider = Provider<User?>((ref) {
  return ref.watch(sessionProvider)?.user;
});


