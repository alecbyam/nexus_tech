import 'package:supabase_flutter/supabase_flutter.dart';

class AuthRepository {
  final GoTrueClient _auth;

  AuthRepository(this._auth);

  Future<void> sendEmailOtp({required String email}) async {
    // Supabase "OTP email" via signInWithOtp(email)
    await _auth.signInWithOtp(email: email, shouldCreateUser: true);
  }

  Future<void> sendPhoneOtp({required String phone}) async {
    await _auth.signInWithOtp(phone: phone, shouldCreateUser: true);
  }

  Future<void> verifyPhoneOtp({required String phone, required String token}) async {
    await _auth.verifyOTP(
      phone: phone,
      token: token,
      type: OtpType.sms,
    );
  }

  Future<void> signOut() async => _auth.signOut();
}


