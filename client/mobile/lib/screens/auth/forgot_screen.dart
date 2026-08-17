import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';

class ForgotScreen extends ConsumerStatefulWidget {
  const ForgotScreen({super.key});

  @override
  ConsumerState<ForgotScreen> createState() => _ForgotScreenState();
}

class _ForgotScreenState extends ConsumerState<ForgotScreen> {
  String _email = '';
  bool _sent = false;
  bool _loading = false;

  void _handleSend() async {
    if (_email.isEmpty) return;
    setState(() => _loading = true);
    await Future.delayed(const Duration(seconds: 1)); // simulate API call
    setState(() {
      _loading = false;
      _sent = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          Container(
            color: AppColors.headerBg,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 16,
              left: 16,
              right: 16,
              bottom: 24,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconButton(
                  onPressed: () => context.go('/login'),
                  icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 16),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    'Forgot Password?',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: _sent ? _buildSuccess() : _buildForm(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.primaryBlue.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Row(
            children: [
              Icon(Icons.mail_outline, color: AppColors.primaryBlue),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Enter your email address and we will send you a link to reset your password.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.slateBlue,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        const Text(
          'Email Address',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          onChanged: (v) => setState(() => _email = v),
          keyboardType: TextInputType.emailAddress,
          style: const TextStyle(fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Enter your email',
            hintStyle: const TextStyle(color: AppColors.muted),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: const BorderSide(color: AppColors.divider, width: 1.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: const BorderSide(color: AppColors.divider, width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: const BorderSide(color: AppColors.primaryBlue, width: 1.5),
            ),
          ),
        ),
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            onPressed: (_email.isNotEmpty && !_loading) ? _handleSend : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: _email.isNotEmpty ? AppColors.primaryBlue : Colors.grey.shade300,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              disabledBackgroundColor: Colors.grey.shade300,
            ),
            child: _loading
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text(
                    'Send Reset Link',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildSuccess() {
    return Column(
      children: [
        const SizedBox(height: 40),
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.emerald.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check_circle, color: AppColors.emerald, size: 40),
        ),
        const SizedBox(height: 24),
        const Text(
          'Check your inbox',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'We have sent a password reset link to\n$_email',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.secondaryText,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 40),
        SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            onPressed: () => context.go('/login'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.textPrimary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: const Text(
              'Back to Sign In',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
