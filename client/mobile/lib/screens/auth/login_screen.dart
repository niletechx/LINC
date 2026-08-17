import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showPw = false;
  bool _loading = false;
  String _error = '';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleSignIn() async {
    setState(() {
      _error = '';
    });
    
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      setState(() {
        _error = 'Please fill in all fields';
      });
      return;
    }

    setState(() {
      _loading = true;
    });

    await Future.delayed(const Duration(seconds: 1)); // Simulate API call

    ref.read(authProvider.notifier).signIn();
    if (mounted) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        top: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Cyan Header
            Container(
              width: double.infinity,
              color: const Color(0xFF7EC8E3),
              padding: EdgeInsets.fromLTRB(20, topPadding + 14, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: () => context.go('/welcome'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.chevron_left, color: Color(0xFF1E5F7A), size: 22),
                          SizedBox(width: 2),
                          Text(
                            'Back',
                            style: TextStyle(
                              color: Color(0xFF1E5F7A),
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Welcome back',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.02,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Sign in to continue to LINC',
                    style: TextStyle(
                      fontSize: 13,
                      color: Color(0xFF1E5F7A),
                    ),
                  ),
                ],
              ),
            ),

            // Form Area
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 440),
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
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline, color: Colors.red, size: 20),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _error,
                                    style: const TextStyle(color: Colors.red, fontSize: 14),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        
                        // Email field
                        const Text(
                          'Email Address',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          style: const TextStyle(fontSize: 14, color: Color(0xFF0F172A)),
                          decoration: InputDecoration(
                            hintText: 'you@example.com',
                            hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFF38BDF8), width: 1.5),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFF38BDF8), width: 1.5),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFF0284C7), width: 1.8),
                            ),
                          ),
                        ),
                        const SizedBox(height: 18),
                        
                        // Password field
                        const Text(
                          'Password',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _passwordController,
                          obscureText: !_showPw,
                          style: const TextStyle(fontSize: 14, color: Color(0xFF0F172A)),
                          decoration: InputDecoration(
                            hintText: 'Enter your password',
                            hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFF38BDF8), width: 1.8),
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _showPw ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                color: const Color(0xFF94A3B8),
                                size: 20,
                              ),
                              onPressed: () {
                                setState(() {
                                  _showPw = !_showPw;
                                });
                              },
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        
                        Align(
                          alignment: Alignment.centerRight,
                          child: GestureDetector(
                            onTap: () => context.go('/forgot'),
                            child: const Text(
                              'Forgot password?',
                              style: TextStyle(
                                fontSize: 12.5,
                                color: Color(0xFF38BDF8),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 26),
                        
                        // Sign In Button
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _handleSignIn,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0F172A),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _loading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                    ),
                                  )
                                : const Text(
                                    'Sign In',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                          ),
                        ),
                        
                        const SizedBox(height: 28),
                        const Row(
                          children: [
                            Expanded(child: Divider(color: Color(0xFFE2E8F0), thickness: 1)),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 14),
                              child: Text(
                                'or continue with',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF94A3B8),
                                ),
                              ),
                            ),
                            Expanded(child: Divider(color: Color(0xFFE2E8F0), thickness: 1)),
                          ],
                        ),
                        const SizedBox(height: 20),
                        
                        // Social Buttons
                        Row(
                          children: [
                            Expanded(
                              child: _buildSocialBtn(
                                iconWidget: const Text(
                                  'G',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF4285F4),
                                  ),
                                ),
                                label: 'Google',
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: _buildSocialBtn(
                                iconWidget: const Icon(Icons.apple, color: Color(0xFF0F172A), size: 20),
                                label: 'Apple',
                              ),
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: 36),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              "Don't have an account? ",
                              style: TextStyle(
                                color: Color(0xFF64748B),
                                fontSize: 13.5,
                              ),
                            ),
                            GestureDetector(
                              onTap: () => context.go('/signup'),
                              child: const Text(
                                'Sign Up',
                                style: TextStyle(
                                  color: Color(0xFF38BDF8),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialBtn({required Widget iconWidget, required String label}) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          iconWidget,
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }
}
