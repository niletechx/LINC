import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../config/text_styles.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/server_config_dialog.dart';

class WelcomeScreen extends ConsumerWidget {
  const WelcomeScreen({super.key});

  void _showServerConfigDialog(BuildContext context) {
    ServerConfigDialog.show(context);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.headerBg,
      body: Stack(
        children: [
          Positioned(
            top: 40,
            right: 16,
            child: SafeArea(
              child: GestureDetector(
                onTap: () => _showServerConfigDialog(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.wifi_tethering, color: Colors.white, size: 15),
                      SizedBox(width: 5),
                      Text('Server IP', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            top: -100, right: -50,
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [Colors.white.withValues(alpha: 0.12), Colors.transparent]),
              ),
            ),
          ),
          Positioned(
            bottom: -100, left: -50,
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [Colors.black.withValues(alpha: 0.10), Colors.transparent]),
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                Expanded(
                  child: Center(
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 76, height: 76,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: Colors.white, width: 1.5),
                              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 10))],
                            ),
                            child: const Icon(Icons.hub_rounded, size: 38, color: Colors.white),
                          ),
                          const SizedBox(height: 24),
                          Text('LINC', style: AppTextStyles.display(color: AppColors.textPrimary).copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.7, fontSize: 36)),
                          const SizedBox(height: 8),
                          const Text('LIFE INFRASTRUCTURE NETWORK', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.slateBlue, letterSpacing: 1.4)),
                          const SizedBox(height: 24),
                          Container(
                            width: 280,
                            margin: const EdgeInsets.only(bottom: 36),
                            child: const Text(
                              'Connect with top-tier professionals for your everyday needs. Fast, secure, and reliable.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 15, color: AppColors.slateBlue, height: 1.5),
                            ),
                          ),
                          Container(
                            margin: const EdgeInsets.symmetric(horizontal: 24),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.04),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.07)),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                _buildTrustItem(Icons.shield_outlined, 'Verified'),
                                Container(width: 1, height: 32, color: Colors.white.withValues(alpha: 0.07)),
                                _buildTrustItem(Icons.bolt_outlined, 'Fast Match'),
                                Container(width: 1, height: 32, color: Colors.white.withValues(alpha: 0.07)),
                                _buildTrustItem(Icons.chat_bubble_outline, 'Secure Chat'),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 24, right: 24, bottom: 28, top: 16),
                  child: Column(
                    children: [
                      SizedBox(
                        width: double.infinity, height: 54,
                        child: ElevatedButton(
                          onPressed: () => context.go('/signup'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppColors.headerBg,
                            elevation: 4,
                            shadowColor: Colors.black.withValues(alpha: 0.15),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          child: const Text('Create an Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity, height: 54,
                        child: TextButton(
                          onPressed: () => context.go('/login'),
                          style: TextButton.styleFrom(
                            backgroundColor: Colors.white.withValues(alpha: 0.15),
                            foregroundColor: AppColors.textPrimary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                            ),
                          ),
                          child: const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity, height: 48,
                        child: TextButton.icon(
                          onPressed: () {
                            ref.read(authProvider.notifier).enterGuestMode();
                            context.go('/home');
                          },
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.white.withValues(alpha: 0.88),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                              side: BorderSide(color: Colors.white.withValues(alpha: 0.28)),
                            ),
                          ),
                          icon: const Icon(Icons.explore_outlined, size: 18),
                          label: const Text('Explore Without Account', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'By continuing, you agree to our Terms of Service\nand Privacy Policy.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 11.5, color: AppColors.slateBlue.withValues(alpha: 0.8), height: 1.4),
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

  Widget _buildTrustItem(IconData icon, String text) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 24),
        const SizedBox(height: 6),
        Text(text, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
