import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/server_config_dialog.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  int _step = 1;
  String _name = '';
  String _email = '';
  String _phone = '';
  String _password = '';
  String _confirmPw = '';
  bool _showPw = false;
  bool _loading = false;
  String _error = '';
  String _mode = 'client';

  void _showServerConfigDialog(BuildContext context) {
    ServerConfigDialog.show(context).then((_) {
      if (mounted) setState(() {});
    });
  }

  void _handleNext() {
    setState(() {
      _error = '';
    });
    if (_step == 1) {
      final name = _name.trim();
      final email = _email.trim();
      final phone = _phone.trim();

      if (name.isEmpty || email.isEmpty || phone.isEmpty) {
        setState(() => _error = 'Please fill all fields');
        return;
      }

      final nameRegex = RegExp(r'^[a-zA-Z\s]+$');
      if (!nameRegex.hasMatch(name)) {
        setState(() => _error = 'Please enter a valid name (letters only)');
        return;
      }

      final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
      if (!emailRegex.hasMatch(email)) {
        setState(() => _error = 'Please enter a valid email address');
        return;
      }

      final phoneRegex = RegExp(r'^\+?[0-9\s\-]+$');
      if (!phoneRegex.hasMatch(phone)) {
        setState(() => _error = 'Please enter a valid phone number');
        return;
      }

      setState(() => _step = 2);
    } else if (_step == 2) {
      if (_password.isEmpty) {
        setState(() => _error = 'Please enter a password');
        return;
      }
      if (_password.length <= 6) {
        setState(() => _error = 'Password must be more than 6 characters');
        return;
      }
      if (_password != _confirmPw) {
        setState(() => _error = 'Passwords do not match');
        return;
      }
      setState(() => _step = 3);
    } else if (_step == 3) {
      _handleSignup();
    }
  }

  void _handleBack() {
    if (_step > 1) {
      setState(() => _step--);
    } else {
      context.go('/welcome');
    }
  }

  Future<void> _handleSignup() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    
    try {
      String cleanUsername = _name.replaceAll(RegExp(r'[^a-zA-Z0-9_]'), '').toLowerCase();
      if (cleanUsername.length < 3) {
        cleanUsername = '${cleanUsername}_${DateTime.now().millisecondsSinceEpoch % 10000}';
      }

      if (_mode == 'provider') {
        ref.read(needsProviderSetupProvider.notifier).state = true;
        ref.read(appModeProvider.notifier).state = AppMode.provider;
      } else {
        ref.read(needsProviderSetupProvider.notifier).state = false;
        ref.read(appModeProvider.notifier).state = AppMode.client;
      }

      await ref.read(authProvider.notifier).register(
        email: _email.trim(),
        password: _password,
        fullName: _name.trim(),
        username: cleanUsername,
        phone: _phone.trim(),
        role: _mode,
        locationCity: 'Addis Ababa',
      );

      if (mounted) {
        if (_mode == 'provider') {
          context.go('/provider-setup');
        } else {
          context.go('/home');
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    String title = 'Create Account';
    if (_step == 2) title = 'Secure Account';
    if (_step == 3) title = 'Choose Role';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          Container(
            width: double.infinity,
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      onPressed: _handleBack,
                      icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                    ),
                    GestureDetector(
                      onTap: () => _showServerConfigDialog(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.35),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.wifi_tethering, color: Color(0xFF0F172A), size: 14),
                            SizedBox(width: 4),
                            Text(
                              'Server IP',
                              style: TextStyle(
                                color: Color(0xFF0F172A),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          _buildProgressBar(1),
                          const SizedBox(width: 8),
                          _buildProgressBar(2),
                          const SizedBox(width: 8),
                          _buildProgressBar(3),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_error.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        border: Border.all(color: Colors.red.shade200),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.error_outline, color: Colors.red, size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _error,
                                  style: const TextStyle(color: Colors.red, fontSize: 13),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          InkWell(
                            onTap: () {
                              ref.read(authProvider.notifier).signIn();
                              context.go('/home');
                            },
                            child: const Text(
                              '👉 Or Continue in Demo Mode',
                              style: TextStyle(color: Color(0xFF0284C7), fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                  
                  if (_step == 1) _buildStep1(),
                  if (_step == 2) _buildStep2(),
                  if (_step == 3) _buildStep3(),
                  
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _handleNext,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.textPrimary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: _loading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text(
                              _step == 3 ? 'Create My Account' : 'Continue',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                    ),
                  ),
                  if (_step == 1) ...[
                    const SizedBox(height: 32),
                    Center(
                      child: GestureDetector(
                        onTap: () => context.go('/login'),
                        child: Text.rich(
                          TextSpan(
                            text: 'Already have account? ',
                            style: TextStyle(color: AppColors.secondaryText, fontSize: 14),
                            children: [
                              TextSpan(
                                text: 'Sign In',
                                style: TextStyle(
                                  color: AppColors.primaryBlue,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressBar(int step) {
    return Expanded(
      child: Container(
        height: 4,
        decoration: BoxDecoration(
          color: _step >= step ? AppColors.textPrimary : AppColors.textPrimary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }

  Widget _buildStep1() {
    return Column(
      children: [
        _buildTextField(
          label: 'Full Name',
          hint: 'Enter your full name',
          onChanged: (v) => setState(() => _name = v),
        ),
        const SizedBox(height: 20),
        _buildTextField(
          label: 'Email Address',
          hint: 'Enter your email',
          keyboardType: TextInputType.emailAddress,
          onChanged: (v) => setState(() => _email = v),
        ),
        const SizedBox(height: 20),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Phone Number',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(13),
                border: Border.all(color: AppColors.divider, width: 1.5),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    decoration: BoxDecoration(
                      border: Border(right: BorderSide(color: AppColors.divider, width: 1.5)),
                    ),
                    child: Text(
                      '🇪🇹 +251',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      keyboardType: TextInputType.phone,
                      onChanged: (v) => setState(() => _phone = v),
                      decoration: InputDecoration(
                        hintText: '9XX XXX XXX',
                        hintStyle: TextStyle(color: AppColors.muted),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      children: [
        _buildTextField(
          label: 'Password',
          hint: 'Create a password',
          obscureText: !_showPw,
          onChanged: (v) => setState(() => _password = v),
          suffixIcon: IconButton(
            icon: Icon(
              _showPw ? Icons.visibility_off : Icons.visibility,
              color: AppColors.secondaryText,
            ),
            onPressed: () => setState(() => _showPw = !_showPw),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: List.generate(4, (index) {
            Color c = AppColors.divider;
            if (_password.length > index * 2) {
              if (index < 2) c = Colors.red;
              else if (index < 3) c = AppColors.amber;
              else c = AppColors.emerald;
            }
            return Expanded(
              child: Container(
                height: 4,
                margin: EdgeInsets.only(right: index < 3 ? 4 : 0),
                decoration: BoxDecoration(
                  color: c,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 24),
        _buildTextField(
          label: 'Confirm Password',
          hint: 'Repeat your password',
          obscureText: !_showPw,
          onChanged: (v) => setState(() => _confirmPw = v),
        ),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      children: [
        _buildRoleCard(
          'client',
          'Client',
          '👤',
          'I want to find and book services',
        ),
        const SizedBox(height: 16),
        _buildRoleCard(
          'provider',
          'Provider',
          '💼',
          'I want to offer my services',
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.amber.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.amber.withValues(alpha: 0.3)),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline, color: AppColors.amber, size: 20),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'You can always switch roles or be both from your account settings later.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textPrimary,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRoleCard(String modeValue, String title, String emoji, String subtitle) {
    bool isSelected = _mode == modeValue;
    return GestureDetector(
      onTap: () => setState(() => _mode = modeValue),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primaryBlue : AppColors.divider,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: AppColors.primaryBlue.withValues(alpha: 0.1), blurRadius: 10)]
              : [],
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: Text(emoji, style: const TextStyle(fontSize: 24)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.secondaryText,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.primaryBlue : AppColors.divider,
                  width: isSelected ? 6 : 2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required String hint,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType? keyboardType,
    required Function(String) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          obscureText: obscureText,
          keyboardType: keyboardType,
          onChanged: onChanged,
          style: const TextStyle(fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: AppColors.muted),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: BorderSide(color: AppColors.divider, width: 1.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: BorderSide(color: AppColors.divider, width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: BorderSide(color: AppColors.primaryBlue, width: 1.5),
            ),
            suffixIcon: suffixIcon,
          ),
        ),
      ],
    );
  }
}
