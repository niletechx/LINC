import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../config/text_styles.dart';
import '../../providers/app_provider.dart';

// Assuming there's a simple StateProvider for availability
final availabilityProvider = StateProvider<bool>((ref) => true);

class ProviderDashboard extends ConsumerStatefulWidget {
  const ProviderDashboard({super.key});

  @override
  ConsumerState<ProviderDashboard> createState() => _ProviderDashboardState();
}

class _ProviderDashboardState extends ConsumerState<ProviderDashboard> {
  @override
  Widget build(BuildContext context) {
    final isAvailable = ref.watch(availabilityProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // AppColors.appBackground
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. AVAILABILITY BANNER
              Container(
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                decoration: BoxDecoration(
                  color: isAvailable ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                  border: Border(
                    bottom: BorderSide(
                      color: isAvailable ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                      width: 2,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isAvailable ? '🟢 Available for Instant Booking' : '🔴 Currently Unavailable',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: isAvailable ? const Color(0xFF065F46) : const Color(0xFF991B1B),
                            ),
                          ),
                          const SizedBox(height: 2),
                          if (isAvailable)
                            const Text(
                              'Clients can reach you right now',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: Color(0xFF059669),
                              ),
                            ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        ref.read(availabilityProvider.notifier).state = !isAvailable;
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 48,
                        height: 27,
                        decoration: BoxDecoration(
                          color: isAvailable ? const Color(0xFF10B981) : const Color(0xFFCBD5E1),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            AnimatedPositioned(
                              duration: const Duration(milliseconds: 200),
                              left: isAvailable ? 23 : 2.5,
                              child: Container(
                                width: 22,
                                height: 22,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 4,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // 2. METRICS 2x2 GRID
              Container(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 8),
                child: Column(
                  children: [
                    IntrinsicHeight(
                      child: Row(
                        children: [
                          _buildMetricCell('💰', '12,400 ETB', const Color(0xFF7EC8E3), 'This Month', showRightBorder: true, showBottomBorder: true),
                          _buildMetricCell('💼', '3', const Color(0xFF10B981), 'Active Jobs', showRightBorder: false, showBottomBorder: true),
                        ],
                      ),
                    ),
                    IntrinsicHeight(
                      child: Row(
                        children: [
                          _buildMetricCell('👁️', '142', const Color(0xFF0891B2), 'Profile Views', showRightBorder: true, showBottomBorder: false),
                          _buildMetricCell('🎯', '94%', const Color(0xFFF59E0B), 'Match Score', showRightBorder: false, showBottomBorder: false),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // 3. INCOMING REQUESTS
              Container(
                color: Colors.white,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                      decoration: const BoxDecoration(
                        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                      ),
                      child: const Text(
                        'Incoming Requests',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    ),
                    _buildIncomingRequest(
                      initials: 'BT',
                      name: 'Beza Tesfaye',
                      color: const Color(0xFF7C3AED),
                      service: 'Pipe Leak Repair',
                      budget: '500 ETB',
                      timeLeft: '12 min',
                    ),
                    _buildIncomingRequest(
                      initials: 'MA',
                      name: 'Michael Alemu',
                      color: const Color(0xFF0891B2),
                      service: 'Bathroom Renovation',
                      budget: '2,000 ETB',
                      timeLeft: '28 min',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCell(String emoji, String value, Color valueColor, String label, {required bool showRightBorder, required bool showBottomBorder}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border(
            right: showRightBorder ? const BorderSide(color: Color(0xFFE2E8F0)) : BorderSide.none,
            bottom: showBottomBorder ? const BorderSide(color: Color(0xFFE2E8F0)) : BorderSide.none,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 17)),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: valueColor,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIncomingRequest({
    required String initials,
    required String name,
    required Color color,
    required String service,
    required String budget,
    required String timeLeft,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Text(
                  initials,
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      service,
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          name,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        const Text(' · ', style: TextStyle(color: Color(0xFF94A3B8))),
                        Text(
                          budget,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF10B981),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(vertical: 3, horizontal: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFBEB),
                  border: Border.all(color: const Color(0xFFFDE68A)),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '⏱ $timeLeft',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFD97706),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                flex: 1,
                child: GestureDetector(
                  onTap: () {},
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'Decline',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 2,
                child: GestureDetector(
                  onTap: () {},
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'Accept',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
