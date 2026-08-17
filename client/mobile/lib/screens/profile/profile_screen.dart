import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../config/text_styles.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final group1 = [
      {'icon': '🔔', 'label': 'Notifications', 'badge': '3', 'highlight': false, 'action': null},
      {'icon': '📍', 'label': 'Saved Locations', 'badge': null, 'highlight': false, 'action': null},
      {'icon': '💳', 'label': 'Payment Methods', 'badge': null, 'highlight': false, 'action': null},
    ];

    final group2 = [
      {'icon': '🛡️', 'label': 'Trust & Verification', 'badge': null, 'highlight': true, 'action': () => context.push('/verification')},
      {'icon': '❓', 'label': 'Help & Support', 'badge': null, 'highlight': false, 'action': null},
      {'icon': '⚙️', 'label': 'Account Settings', 'badge': null, 'highlight': false, 'action': null},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(color: Color(0xFF7EC8E3)),
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Profile', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                      Container(
                        width: 36, height: 36,
                        decoration: BoxDecoration(color: const Color(0x26FFFFFF), borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.person_outline_rounded, color: Color(0xFF0F172A), size: 20),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                children: [
                  Container(
                    width: 62,
                    height: 62,
                    decoration: BoxDecoration(
                      color: const Color(0x66FFFFFF),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xB3FFFFFF), width: 3),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'YM',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Yonas Molla',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                            letterSpacing: -0.02,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'yonas.molla@email.com',
                          style: TextStyle(fontSize: 12, color: Color(0xFF1E5F7A)),
                        ),
                        const SizedBox(height: 7),
                        Row(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0x80FFFFFF),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              child: const Text(
                                '✓ VERIFIED',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0F172A),
                                  letterSpacing: 0.06,
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0x80FFFFFF),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              child: const Text(
                                '👤 Client',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0x66FFFFFF),
                      border: Border.all(color: const Color(0x99FFFFFF)),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    child: const Icon(Icons.arrow_forward_ios, color: Color(0xFF1E5F7A), size: 14),
                  ),
                ],
              ),   // close avatar Row
                ],
              ),   // close outer Column
            ),     // close Container
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: IntrinsicHeight(
                child: Row(
                  children: [
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Text(
                              '12',
                              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.02),
                            ),
                            SizedBox(height: 2),
                            Text('Bookings', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                    const VerticalDivider(width: 1, color: Color(0xFFE2E8F0)),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Text(
                              '8',
                              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.02),
                            ),
                            SizedBox(height: 2),
                            Text('Reviews', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                    const VerticalDivider(width: 1, color: Color(0xFFE2E8F0)),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Text(
                              '24',
                              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.02),
                            ),
                            SizedBox(height: 2),
                            Text('Saved', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            _buildMenuGroup(group1),
            _buildMenuGroup(group2),
            Padding(
              padding: const EdgeInsets.only(top: 4, bottom: 8),
              child: Center(
                child: TextButton(
                  onPressed: () {
                    ref.read(authProvider.notifier).signOut();
                    context.go('/welcome');
                  },
                  child: const Text(
                    'Sign Out',
                    style: TextStyle(
                      fontSize: 13.5,
                      color: Color(0xFFEF4444),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      ),
    );
  }

  Widget _buildMenuGroup(List<Map<String, dynamic>> items) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: Color(0xFFE2E8F0)),
          bottom: BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
      child: Column(
        children: items.asMap().entries.map((entry) {
          int idx = entry.key;
          var item = entry.value;
          bool isHighlight = item['highlight'] as bool;
          String? badge = item['badge'] as String?;

          return GestureDetector(
            onTap: item['action'] as void Function()?,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                border: idx != items.length - 1
                    ? const Border(bottom: BorderSide(color: Color(0xFFE2E8F0)))
                    : null,
              ),
              child: Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: isHighlight ? const Color(0xFFFEF2F2) : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text(item['icon'] as String, style: const TextStyle(fontSize: 16)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      item['label'] as String,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: isHighlight ? FontWeight.w700 : FontWeight.w600,
                        color: isHighlight ? const Color(0xFF7EC8E3) : const Color(0xFF1E293B),
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      if (badge != null) ...[
                        Container(
                          width: 19,
                          height: 19,
                          decoration: const BoxDecoration(
                            color: Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            badge,
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1), size: 16),
                    ],
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
