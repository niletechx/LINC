import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/colors.dart';
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
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // 1. Soft Light Canvas Gradient
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFFFAFDFF),
                  Color(0xFFF1F8FC),
                  Color(0xFFFFFFFF),
                ],
                stops: [0.0, 0.45, 1.0],
              ),
            ),
          ),

          // 2. Subtle Geometric Heritage Background Vector Overlay
          Positioned.fill(
            child: CustomPaint(
              painter: _WelcomeGeometricArtPainter(),
            ),
          ),

          // 3. Soft Ambient Glow
          Positioned(
            top: -60,
            right: -60,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primaryBlue.withValues(alpha: 0.25),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 120,
            left: -80,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.cyan.withValues(alpha: 0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // 4. Main Content
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
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.04),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 16),
                          ),
                        )
                      else
                        const SizedBox(width: 38),

                      GestureDetector(
                        onTap: () => _showServerConfigDialog(context),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.04),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.wifi_tethering, color: Color(0xFF0284C7), size: 14),
                              SizedBox(width: 6),
                              Text(
                                'Server IP',
                                style: TextStyle(color: Color(0xFF0F172A), fontSize: 12, fontWeight: FontWeight.w700),
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
                      padding: const EdgeInsets.symmetric(horizontal: 28),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // App Icon Emblem
                          Container(
                            width: 84,
                            height: 84,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Color(0xFF1E5F7A),
                                  Color(0xFF0284C7),
                                  Color(0xFF7EC8E3),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF0284C7).withValues(alpha: 0.28),
                                  blurRadius: 28,
                                  offset: const Offset(0, 10),
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: const Icon(Icons.hub_rounded, size: 44, color: Colors.white),
                          ),
                          const SizedBox(height: 28),

                          // Brand Title
                          Text(
                            'LINC',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 36,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF0F172A),
                              letterSpacing: 2.0,
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Subtitle Badge
                          Text(
                            'LIFE INFRASTRUCTURE NETWORK',
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF1E5F7A),
                              letterSpacing: 2.2,
                            ),
                          ),
                          const SizedBox(height: 18),

                          // Description
                          Text(
                            'Connect with verified professionals for your everyday needs in Addis Ababa. Fast, secure, and escrow-protected.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              fontSize: 14.5,
                              color: const Color(0xFF64748B),
                              height: 1.55,
                              fontWeight: FontWeight.w400,
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
                            backgroundColor: const Color(0xFF0F172A),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          icon: const Icon(Icons.person_add_outlined, size: 18),
                          label: Text(
                            'Create an Account',
                            style: GoogleFonts.inter(fontSize: 15.5, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // 2. Sign In (Secondary CTA)
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: OutlinedButton.icon(
                          onPressed: () => context.go('/login'),
                          style: OutlinedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF0F172A),
                            side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          icon: const Icon(Icons.login_rounded, size: 18, color: Color(0xFF64748B)),
                          label: Text(
                            'Sign In',
                            style: GoogleFonts.inter(fontSize: 15.5, fontWeight: FontWeight.w700),
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
                            backgroundColor: const Color(0xFFF0F9FF),
                            foregroundColor: const Color(0xFF0284C7),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: const BorderSide(color: Color(0xFFBAE6FD), width: 1.2),
                            ),
                          ),
                          icon: const Icon(Icons.explore_outlined, size: 18),
                          label: Text(
                            'Explore Without Account',
                            style: GoogleFonts.inter(fontSize: 14.5, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Terms & Privacy Note
                      Text(
                        'By continuing, you agree to our Terms of Service\nand Privacy Policy.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: const Color(0xFF94A3B8),
                          height: 1.45,
                        ),
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

/// Subtle background painter for the light Welcome Screen
class _WelcomeGeometricArtPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width * 0.5, size.height * 0.38);
    final maxRadius = math.min(size.width, size.height) * 0.44;

    final faintLinePaint = Paint()
      ..color = const Color(0xFFE2E8F0).withValues(alpha: 0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final accentLinePaint = Paint()
      ..color = const Color(0xFF7EC8E3).withValues(alpha: 0.25)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;

    // Concentric faint circles
    canvas.drawCircle(center, maxRadius * 0.45, faintLinePaint);
    canvas.drawCircle(center, maxRadius * 0.75, accentLinePaint);
    canvas.drawCircle(center, maxRadius * 0.98, faintLinePaint);

    // 8-point geometric nodes
    const pointsCount = 8;
    for (int i = 0; i < pointsCount; i++) {
      final angle = (i * 2 * math.pi / pointsCount);
      final x = center.dx + maxRadius * 0.75 * math.cos(angle);
      final y = center.dy + maxRadius * 0.75 * math.sin(angle);
      final point = Offset(x, y);

      canvas.drawLine(center, point, faintLinePaint);
      canvas.drawCircle(point, 2.0, Paint()..color = const Color(0xFF7EC8E3).withValues(alpha: 0.4));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
