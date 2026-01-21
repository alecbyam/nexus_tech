import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../application/auth_providers.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../../core/widgets/primary_button.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();

  bool _isPhoneMode = false;
  bool _otpSent = false;

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final actionState = ref.watch(authActionControllerProvider);
    ref.listen(authActionControllerProvider, (prev, next) {
      if (next.error != null && next.error!.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error!)),
        );
      }
      if (prev?.otpSent != true && next.otpSent == true && _isPhoneMode) {
        setState(() => _otpSent = true);
      }
    });

    return AppScaffold(
      title: 'Connexion',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SegmentedButton<bool>(
            segments: const [
              ButtonSegment(value: false, label: Text('Email')),
              ButtonSegment(value: true, label: Text('Téléphone')),
            ],
            selected: {_isPhoneMode},
            onSelectionChanged: (s) {
              setState(() {
                _isPhoneMode = s.first;
                _otpSent = false;
                _otpController.clear();
              });
            },
          ),
          const SizedBox(height: 16),
          if (!_isPhoneMode) ...[
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.done,
              decoration: const InputDecoration(
                labelText: 'Email',
                hintText: 'ex: user@nexustech.com',
              ),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              text: 'Envoyer un lien/OTP par email',
              onPressed: actionState.loading ? null : _sendEmailOtp,
              isLoading: actionState.loading,
            ),
          ] else ...[
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Téléphone',
                hintText: 'ex: +243xxxxxxxxx',
              ),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              text: _otpSent ? 'Renvoyer OTP' : 'Envoyer OTP',
              onPressed: actionState.loading ? null : _sendPhoneOtp,
              isLoading: actionState.loading,
            ),
            const SizedBox(height: 12),
            if (_otpSent) ...[
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.done,
                decoration: const InputDecoration(
                  labelText: 'Code OTP',
                  hintText: '6 chiffres',
                ),
              ),
              const SizedBox(height: 12),
              PrimaryButton(
                text: 'Vérifier OTP',
                onPressed: actionState.loading ? null : _verifyPhoneOtp,
                isLoading: actionState.loading,
              ),
            ],
          ],
          const SizedBox(height: 12),
          const Text(
            'Optimisé low-bandwidth : écran simple, flux OTP minimal.',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Future<void> _sendEmailOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez entrer un email.')),
      );
      return;
    }
    await ref.read(authActionControllerProvider.notifier).sendEmailOtp(email);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('OTP/lien envoyé sur votre email.')),
    );
  }

  Future<void> _sendPhoneOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez entrer un numéro de téléphone.')),
      );
      return;
    }
    await ref.read(authActionControllerProvider.notifier).sendPhoneOtp(phone);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('OTP envoyé par SMS.')),
    );
  }

  Future<void> _verifyPhoneOtp() async {
    final phone = _phoneController.text.trim();
    final otp = _otpController.text.trim();
    if (phone.isEmpty || otp.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez entrer téléphone et OTP.')),
      );
      return;
    }
    await ref.read(authActionControllerProvider.notifier).verifyPhoneOtp(phone: phone, token: otp);
  }
}


