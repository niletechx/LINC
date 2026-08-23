import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/colors.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _lineProgressAnimation;
  late Animation<double> _logoScaleAnimation;
  late Animation<double> _logoFadeAnimation;
  late Animation<double> _textFadeAnimation;
  late Animation<double> _textSlideAnimation;
  late Animation<double> _glowAnimation;
  late Animation<double> _exitFadeAnimation;

  bool _hasNavigated = false;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );

    // 1. Line Art Drawing & Expansion (0 to 800ms)
    _lineProgressAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.45, curve: Curves.easeOutCubic),
    );

    // 2. Logo Emblem Bloom (350 to 1100ms)
    _logoScaleAnimation = Tween<double>(begin: 0.65, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.20, 0.60, curve: Curves.easeOutBack),
      ),
    );

    _logoFadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.18, 0.55, curve: Curves.easeOut),
    );

    // 3. Brand Text & Tagline Reveal (550 to 1400ms)
    _textFadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.35, 0.75, curve: Curves.easeOut),
    );

    _textSlideAnimation = Tween<double>(begin: 18.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.35, 0.75, curve: Curves.easeOutCubic),
      ),
    );

    // 4. Subtle Ambient Breathing Glow (600 to 1800ms)
    _glowAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.40, 0.90, curve: Curves.easeInOut),
      ),
    );

    // 5. Smooth Dissolve for Page Transition (1750 to 2000ms)
    _exitFadeAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.88, 1.0, curve: Curves.easeInOut),
      ),
    );

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _tryNavigate();
      }
    });

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// Called when animation completes. If auth hasn't finished initializing
  /// (session restore is still in-flight), we wait; otherwise navigate.
  void _tryNavigate() {
    final authState = ref.read(authProvider);
    if (!authState.isInitialized) {
      // Auth init is still in flight — listen for the first state update
      ref.listenManual(authProvider, (_, next) {
        if (next.isInitialized) {
          _navigateToDestination();
        }
      }, fireImmediately: true);
    } else {
      _navigateToDestination();
    }
  }

  void _navigateToDestination() {
    if (_hasNavigated || !mounted) return;
    _hasNavigated = true;

    final authState = ref.read(authProvider);
    final needsProviderSetup = ref.read(needsProviderSetupProvider);

    if (authState.isAuthed) {
      if (needsProviderSetup) {
        context.go('/provider-setup');
      } else {
        context.go('/home');
      }
    } else {
      // Direct to Home in Guest mode for instant exploration
      ref.read(authProvider.notifier).enterGuestMode();
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _navigateToDestination, // allow quick tap-to-skip
      child: Scaffold(
        backgroundColor: Colors.white,
        body: AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            return Opacity(
              opacity: _exitFadeAnimation.value,
              child: Stack(
                children: [
                  // 1. Soft Light Ethereal Canvas Background
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

                  // 2. Soft Ambient Radial Glow (Cyan / Sky)
                  Positioned(
                    top: MediaQuery.of(context).size.height * 0.30 - 150,
                    left: MediaQuery.of(context).size.width * 0.5 - 150,
                    child: Opacity(
                      opacity: 0.35 * _glowAnimation.value,
                      child: Container(
                        width: 300,
                        height: 300,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              AppColors.primaryBlue.withValues(alpha: 0.5),
                              AppColors.cyan.withValues(alpha: 0.15),
                              Colors.transparent,
                            ],
                            stops: const [0.0, 0.5, 1.0],
                          ),
                        ),
                      ),
                    ),
                  ),

                  // 3. Custom Geometric Heritage Vector Art Painter
                  Positioned.fill(
                    child: CustomPaint(
                      painter: GeometricHeritagePainter(
                        progress: _lineProgressAnimation.value,
                        glowPhase: _glowAnimation.value,
                      ),
                    ),
                  ),

                  // 4. Center Brand Hero Section
                  SafeArea(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Animated Brand Emblem
                          Opacity(
                            opacity: _logoFadeAnimation.value,
                            child: Transform.scale(
                              scale: _logoScaleAnimation.value,
                              child: Container(
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
                                      color: const Color(0xFF0284C7).withValues(alpha: 0.28 * _glowAnimation.value),
                                      blurRadius: 28,
                                      offset: const Offset(0, 10),
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                                alignment: Alignment.center,
                                child: const Icon(
                                  Icons.hub_rounded,
                                  size: 44,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Brand Name "LINC"
                          Transform.translate(
                            offset: Offset(0, _textSlideAnimation.value),
                            child: Opacity(
                              opacity: _textFadeAnimation.value,
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'LINC',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 34,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 4.0,
                                      color: const Color(0xFF0F172A),
                                    ),
                                  ),
                                  const SizedBox(height: 8),

                                  // Tagline
                                  Text(
                                    'LIFE INFRASTRUCTURE NETWORK',
                                    style: GoogleFonts.inter(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 2.4,
                                      color: const Color(0xFF1E5F7A),
                                    ),
                                  ),
                                  const SizedBox(height: 6),

                                  // Location Subtitle
                                  Text(
                                    'Addis Ababa • AI-Powered Service Discovery',
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                      color: const Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // 5. Subtle Bottom Watermark Indicator
                  Positioned(
                    bottom: 32,
                    left: 0,
                    right: 0,
                    child: Opacity(
                      opacity: _textFadeAnimation.value * 0.7,
                      child: Center(
                        child: Text(
                          'Empowering Verified Services',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF94A3B8),
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

/// Custom Vector Painter drawing Ethiopian-inspired geometric craft lines & network connections
class GeometricHeritagePainter extends CustomPainter {
  final double progress;
  final double glowPhase;

  GeometricHeritagePainter({
    required this.progress,
    required this.glowPhase,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0.001) return;

    final center = Offset(size.width / 2, size.height * 0.44);
    final maxRadius = math.min(size.width, size.height) * 0.46;

    // Line paints with varying stroke weights and opacities
    final primaryLinePaint = Paint()
      ..color = const Color(0xFF7EC8E3).withValues(alpha: 0.55 * progress)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2
      ..strokeCap = StrokeCap.round;

    final accentLinePaint = Paint()
      ..color = const Color(0xFF1E5F7A).withValues(alpha: 0.35 * progress)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0
      ..strokeCap = StrokeCap.round;

    final faintGridPaint = Paint()
      ..color = const Color(0xFFCBD5E1).withValues(alpha: 0.25 * progress)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.8;

    final nodePaint = Paint()
      ..color = const Color(0xFF0284C7).withValues(alpha: 0.75 * progress)
      ..style = PaintingStyle.fill;

    final outerPulsePaint = Paint()
      ..color = const Color(0xFF7EC8E3).withValues(alpha: 0.18 * glowPhase)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    // 1. Draw Concentric Fine Heritage Rings
    final ringRadii = [maxRadius * 0.45, maxRadius * 0.72, maxRadius * 0.98];
    for (int i = 0; i < ringRadii.length; i++) {
      final currentRadius = ringRadii[i] * progress;
      final sweep = (math.pi * 2) * progress;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: currentRadius),
        -math.pi / 2 + (i * 0.3),
        sweep,
        false,
        i == 1 ? accentLinePaint : faintGridPaint,
      );
    }

    // Outer breathing pulse ring
    if (glowPhase > 0.05) {
      canvas.drawCircle(center, maxRadius * (0.95 + 0.05 * glowPhase), outerPulsePaint);
    }

    // 2. Draw Ethiopian Intersecting Geometric Diamond & Cross Grid (8-Point Symmetry)
    const pointsCount = 8;
    final double radius = maxRadius * 0.78 * progress;
    final List<Offset> outerNodes = [];

    for (int i = 0; i < pointsCount; i++) {
      final angle = (i * 2 * math.pi / pointsCount) - (math.pi / 8 * (1 - progress));
      final x = center.dx + radius * math.cos(angle);
      final y = center.dy + radius * math.sin(angle);
      final point = Offset(x, y);
      outerNodes.add(point);

      // Inner diamond cross connections
      final innerAngle = angle + (math.pi / pointsCount);
      final innerRadius = radius * 0.42;
      final innerPoint = Offset(
        center.dx + innerRadius * math.cos(innerAngle),
        center.dy + innerRadius * math.sin(innerAngle),
      );

      // Draw vector lines connecting center to inner & outer nodes
      canvas.drawLine(center, point, faintGridPaint);
      canvas.drawLine(point, innerPoint, primaryLinePaint);

      // Draw subtle orbital node dots
      if (progress > 0.4) {
        canvas.drawCircle(point, 2.5 * progress, nodePaint);
        canvas.drawCircle(innerPoint, 1.8 * progress, nodePaint);
      }
    }

    // 3. Connect perimeter polygon (interlocking diamond motif)
    final path = Path();
    for (int i = 0; i < outerNodes.length; i++) {
      final nextIndex = (i + 1) % outerNodes.length;
      if (i == 0) {
        path.moveTo(outerNodes[i].dx, outerNodes[i].dy);
      }
      path.lineTo(outerNodes[nextIndex].dx, outerNodes[nextIndex].dy);
    }
    canvas.drawPath(path, accentLinePaint);

    // 4. Subtle Interlaced Diamond Cross-Chords (Heritage Geometry)
    for (int i = 0; i < outerNodes.length; i++) {
      final oppositeIndex = (i + 3) % outerNodes.length;
      canvas.drawLine(outerNodes[i], outerNodes[oppositeIndex], faintGridPaint);
    }
  }

  @override
  bool shouldRepaint(covariant GeometricHeritagePainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.glowPhase != glowPhase;
  }
}
