import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/server_config_dialog.dart';

class WelcomeScreen extends ConsumerWidget {
  const WelcomeScreen({super.key});

  void _showServerConfigDialog(BuildContext context) {
    ServerConfigDialog.show(context);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canPop = context.canPop();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // 1. Ambient Background Glows
          Positioned(
            top: -120,
            left: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF0003BF).withValues(alpha: 0.45),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -100,
            right: -60,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF0284C7).withValues(alpha: 0.35),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // 2. Main Content
          SafeArea(
            child: Column(
              children: [
                // Top Action Bar (Back + Server IP)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (canPop)
                        GestureDetector(
                          onTap: () => context.pop(),
                          child: Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.10),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                            ),
                            alignment: Alignment.center,
                            child: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 16),
                          ),
                        )
                      else
                        const SizedBox(width: 38),

                      GestureDetector(
                        onTap: () => _showServerConfigDialog(context),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.10),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.wifi_tethering, color: Color(0xFF7EC8E3), size: 14),
                              SizedBox(width: 6),
                              Text(
                                'Server IP',
                                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Center Hero Section
                Expanded(
                  child: Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // App Icon Squircle
                          Container(
                            width: 86,
                            height: 86,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [Color(0xFF0003BF), Color(0xFF0284C7)],
                              ),
                              borderRadius: BorderRadius.circular(26),
                              border: Border.all(color: const Color(0xFF7EC8E3).withValues(alpha: 0.6), width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF0003BF).withValues(alpha: 0.4),
                                  blurRadius: 28,
                                  offset: const Offset(0, 12),
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: const Icon(Icons.hub_rounded, size: 44, color: Colors.white),
                          ),
                          const SizedBox(height: 28),

                          // Brand Title
                          const Text(
                            'LINC',
                            style: TextStyle(
                              fontSize: 38,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Subtitle Badge
                          const Text(
                            'LIFE INFRASTRUCTURE NETWORK',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF7EC8E3),
                              letterSpacing: 2.0,
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Description
                          const Text(
                            'Connect with verified professionals for your everyday needs in Addis Ababa. Fast, secure, and escrow-protected.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14.5,
                              color: Color(0xFF94A3B8),
                              height: 1.55,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Bottom Action Buttons
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 28),
                  child: Column(
                    children: [
                      // 1. Create Account (Primary CTA)
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton.icon(
                          onPressed: () => context.go('/signup'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF0F172A),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          icon: const Icon(Icons.person_add_outlined, size: 18),
                          label: const Text(
                            'Create an Account',
                            style: TextStyle(fontSize: 15.5, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // 2. Sign In (Secondary CTA)
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: TextButton.icon(
                          onPressed: () => context.go('/login'),
                          style: TextButton.styleFrom(
                            backgroundColor: const Color(0xFF1E293B),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: Colors.white.withValues(alpha: 0.12)),
                            ),
                          ),
                          icon: const Icon(Icons.login_rounded, size: 18, color: Color(0xFF94A3B8)),
                          label: const Text(
                            'Sign In',
                            style: TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // 3. Explore as Guest (Tertiary CTA)
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: TextButton.icon(
                          onPressed: () {
                            ref.read(authProvider.notifier).enterGuestMode();
                            context.go('/home');
                          },
                          style: TextButton.styleFrom(
                            foregroundColor: const Color(0xFF7EC8E3),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: const Color(0xFF7EC8E3).withValues(alpha: 0.35)),
                            ),
                          ),
                          icon: const Icon(Icons.explore_outlined, size: 18),
                          label: const Text(
                            'Explore Without Account',
                            style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Terms & Privacy Note
                      const Text(
                        'By continuing, you agree to our Terms of Service\nand Privacy Policy.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.45),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

