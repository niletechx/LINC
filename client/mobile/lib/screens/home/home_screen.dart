import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../config/text_styles.dart';
import '../../data/mock_data.dart';
import '../../widgets/provider_card.dart';
import '../../providers/app_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Assuming appModeProvider provides a boolean or enum, we'll try to handle it.
    // We'll treat it as a boolean for simplicity if the type is unknown.
    final appMode = ref.watch(appModeProvider);
    final isProvider = appMode.toString().toLowerCase().contains('provider') || appMode == true;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // AppColors.appBackground
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. CYAN HEADER SECTION
              Container(
                color: const Color(0xFF7EC8E3), // AppColors.headerBg
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.location_on, color: Color(0xFF1E5F7A), size: 10),
                                  const SizedBox(width: 4),
                                  const Text(
                                    'Addis Ababa, ET',
                                    style: TextStyle(
                                      color: Color(0xFF1E5F7A),
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(width: 2),
                                  const Icon(Icons.keyboard_arrow_down, color: Color(0xFF1E5F7A), size: 14),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                isProvider ? 'Provider Dashboard' : 'Good morning, Yonas',
                                style: const TextStyle(
                                  color: Color(0xFF0F172A),
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Right Side
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            GestureDetector(
                              onTap: () {
                                // Toggle app mode logic. It will depend on how appModeProvider is structured.
                                // Typically something like ref.read(appModeProvider.notifier).toggle() 
                                // but we will do a generic read/update.
                                ref.read(appModeProvider.notifier).state =
                                    ref.read(appModeProvider) == AppMode.client
                                        ? AppMode.provider
                                        : AppMode.client;
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 11),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.50),
                                  border: Border.all(color: Colors.white.withOpacity(0.70)),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  isProvider ? '💼 Provider' : '👤 Client',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Stack(
                              children: [
                                const Icon(Icons.notifications_none, color: Color(0xFF0F172A), size: 24),
                                Positioned(
                                  top: 0,
                                  right: 0,
                                  child: Container(
                                    width: 7,
                                    height: 7,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFEF4444),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    GestureDetector(
                      onTap: () => context.push('/search'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.45),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.search, color: Color(0xFF1E5F7A), size: 18),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'What do you need help with?',
                                style: TextStyle(
                                  color: Color(0xFF1E5F7A),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF7EC8E3), // cyan bg
                                borderRadius: BorderRadius.circular(7),
                              ),
                              child: const Text(
                                '✨ AI',
                                style: TextStyle(
                                  color: Color(0xFF0F172A),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
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

              // 2. QUICK CHIPS
              Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildQuickChip(context, '🚨', 'Urgent'),
                      _buildQuickChip(context, '🧹', 'Cleaning'),
                      _buildQuickChip(context, '📚', 'Tutor'),
                      _buildQuickChip(context, '💻', 'IT Help'),
                      _buildQuickChip(context, '🔧', 'Repairs'),
                      _buildQuickChip(context, '🚗', 'Transport'),
                    ],
                  ),
                ),
              ),

              // 3. CATEGORIES
              Container(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.only(top: 14, left: 16, right: 16, bottom: 12),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Text(
                          'Categories',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        ),
                        const Spacer(),
                        GestureDetector(
                          onTap: () => context.push('/search'),
                          child: const Text(
                            'See all',
                            style: TextStyle(color: Color(0xFF7EC8E3), fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    IntrinsicHeight(
                      child: Row(
                        children: [
                          _buildCategoryCell(context, '🔧', 'Repairs', const Color(0xFF7EC8E3), showRightBorder: true, showBottomBorder: true),
                          _buildCategoryCell(context, '🧹', 'Cleaning', const Color(0xFF059669), showRightBorder: true, showBottomBorder: true),
                          _buildCategoryCell(context, '💻', 'IT & Tech', const Color(0xFF0891B2), showRightBorder: true, showBottomBorder: true),
                          _buildCategoryCell(context, '📚', 'Tutoring', const Color(0xFFD97706), showRightBorder: false, showBottomBorder: true),
                        ],
                      ),
                    ),
                    IntrinsicHeight(
                      child: Row(
                        children: [
                          _buildCategoryCell(context, '⚡', 'Electric', const Color(0xFF7EC8E3), showRightBorder: true, showBottomBorder: false),
                          _buildCategoryCell(context, '🚗', 'Transport', const Color(0xFF7C3AED), showRightBorder: true, showBottomBorder: false),
                          _buildCategoryCell(context, '💆', 'Wellness', const Color(0xFF0F766E), showRightBorder: true, showBottomBorder: false),
                          _buildCategoryCell(context, '🎨', 'Creative', const Color(0xFFBE185D), showRightBorder: false, showBottomBorder: false),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // 4. VERIFIED NEARBY
              Container(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(vertical: 14),
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          const Text(
                            'Verified Nearby',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            '  Bole · 2 km',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
                          ),
                          const Spacer(),
                          GestureDetector(
                            onTap: () => context.push('/search'),
                            child: const Text(
                              'See all',
                              style: TextStyle(color: Color(0xFF7EC8E3), fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: MockData.providers.map((p) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 12),
                            child: GestureDetector(
                              onTap: () => context.push('/provider/${p.id}'),
                              child: ProviderCard(
                                provider: p,
                                onTap: () => context.push('/provider/${p.id}'),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),

              // 5. OPEN REQUESTS
              Container(
                color: Colors.white,
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
                      child: Row(
                        children: [
                          const Text(
                            'Open Requests',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          const Spacer(),
                          GestureDetector(
                            onTap: () {},
                            child: const Text(
                              'Browse',
                              style: TextStyle(color: Color(0xFF7EC8E3), fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),
                    _buildOpenRequestRow('⚡', 'Electrician needed in Kazanchis', '500 ETB', '12m ago', '3 offers', false),
                    _buildOpenRequestRow('❄️', 'Urgent AC repair — Bole road office', '800–1,200 ETB', '28m ago', '1 offer', true),
                    _buildOpenRequestRow('📚', 'Math tutor, 9th grade — twice a week', '350 ETB/session', '1h ago', '5 offers', false),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickChip(BuildContext context, String emoji, String label) {
    return GestureDetector(
      onTap: () => context.push('/search'),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 12)),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCell(BuildContext context, String emoji, String label, Color color, {required bool showRightBorder, required bool showBottomBorder}) {
    return Expanded(
      child: GestureDetector(
        onTap: () {},
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            border: Border(
              right: showRightBorder ? const BorderSide(color: Color(0xFFE2E8F0)) : BorderSide.none,
              bottom: showBottomBorder ? const BorderSide(color: Color(0xFFE2E8F0)) : BorderSide.none,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Text(emoji, style: const TextStyle(fontSize: 20)),
              ),
              const SizedBox(height: 5),
              Text(
                label,
                style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOpenRequestRow(String emoji, String title, String budget, String time, String offers, bool isUrgent) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 16),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isUrgent ? const Color(0xFFFEF2F2) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: Text(emoji, style: const TextStyle(fontSize: 18)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (isUrgent) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 1.5, horizontal: 5),
                        margin: const EdgeInsets.only(right: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          '⚡URGENT',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.07, // 0.07em
                          ),
                        ),
                      ),
                    ],
                    Expanded(
                      child: Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(budget, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Color(0xFF10B981))),
                    const Text(' · ', style: TextStyle(color: Color(0xFF94A3B8))),
                    Text(time, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                    const Text(' · ', style: TextStyle(color: Color(0xFF94A3B8))),
                    Text(offers, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'Offer',
              style: TextStyle(
                color: Color(0xFF7EC8E3),
                fontSize: 11.5,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
