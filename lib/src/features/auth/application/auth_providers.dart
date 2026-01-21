import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/providers/supabase_providers.dart';
import '../data/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return AuthRepository(client.auth);
});

class AuthActionState {
  final bool loading;
  final String? error;
  final bool otpSent;

  const AuthActionState({
    this.loading = false,
    this.error,
    this.otpSent = false,
  });

  AuthActionState copyWith({bool? loading, String? error, bool? otpSent}) {
    return AuthActionState(
      loading: loading ?? this.loading,
      error: error,
      otpSent: otpSent ?? this.otpSent,
    );
  }
}

class AuthActionController extends StateNotifier<AuthActionState> {
  final AuthRepository _repo;

  AuthActionController(this._repo) : super(const AuthActionState());

  Future<void> sendEmailOtp(String email) async {
    state = state.copyWith(loading: true, error: null);
    try {
      await _repo.sendEmailOtp(email: email);
      state = state.copyWith(loading: false, otpSent: true);
    } on AuthException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> sendPhoneOtp(String phone) async {
    state = state.copyWith(loading: true, error: null);
    try {
      await _repo.sendPhoneOtp(phone: phone);
      state = state.copyWith(loading: false, otpSent: true);
    } on AuthException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> verifyPhoneOtp({required String phone, required String token}) async {
    state = state.copyWith(loading: true, error: null);
    try {
      await _repo.verifyPhoneOtp(phone: phone, token: token);
      state = state.copyWith(loading: false);
    } on AuthException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }
}

final authActionControllerProvider =
    StateNotifierProvider<AuthActionController, AuthActionState>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  return AuthActionController(repo);
});


