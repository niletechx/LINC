import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/provider_card.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String _currentLocation = 'Bole, Addis Ababa';

  void _showLocationPicker(BuildContext context) {
    final locations = [
      {'name': 'Bole', 'sub': 'Airport, Medhanialem, Atlas, Edna Mall'},
      {'name': 'Kazanchis', 'sub': 'ECA, Intercontinental, Guinea Conakry'},
      {'name': 'Sarbet', 'sub': 'Vatican, Old Airport, Karl Square'},
      {'name': 'CMC / Summit', 'sub': 'Sunshine, Tsehay Real Estate, Safari'},
      {'name': 'Megenagna', 'sub': 'Lem Hotel, Zefmesh, Shola Market'},
      {'name': 'Piassa / Arada', 'sub': 'Churchill Ave, Taitu, Commercial Bank'},
      {'name': 'Bisrate Gabriel', 'sub': 'Laphto, Old Airport, Vatican'},
      {'name': 'Gerji / Imperial', 'sub': 'Jackros, Unity University, Roba'},
      {'name': 'Lebu / Jemo', 'sub': 'Varnero, Glass Factory, Jemo 1-3'},
      {'name': 'Mexico / Stadium', 'sub': 'KKare, Sengatera, Sante'},
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Container(
          padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 24),
          constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.75),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Row(
                children: [
                  Icon(Icons.location_on_rounded, color: Color(0xFF7EC8E3), size: 22),
                  SizedBox(width: 8),
                  Text(
                    'Select Location in Addis Ababa',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Expanded(
                child: ListView.separated(
                  itemCount: locations.length,
                  separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  itemBuilder: (context, idx) {
                    final loc = locations[idx];
                    final isSelected = _currentLocation.startsWith(loc['name']!);
                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                      title: Text(
                        loc['name']!,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected ? const Color(0xFF0284C7) : const Color(0xFF0F172A),
                        ),
                      ),
                      subtitle: Text(
                        loc['sub']!,
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                      ),
                      trailing: isSelected
                          ? const Icon(Icons.check_circle_rounded, color: Color(0xFF7EC8E3), size: 20)
                          : null,
                      onTap: () {
                        setState(() {
                          _currentLocation = '${loc['name']!}, Addis Ababa';
                        });
                        Navigator.pop(ctx);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showNotificationsModal(BuildContext context) {
    final notifications = [
      {
        'title': 'Booking Confirmed!',
        'body': 'Abebe Kebede confirmed your plumbing repair for tomorrow at 2:00 PM.',
        'time': '5m ago',
        'icon': '✅',
      },
      {
        'title': 'New Message',
        'body': 'Sara Tesfaye: "I am on my way to your location."',
        'time': '25m ago',
        'icon': '💬',
      },
      {
        'title': 'Escrow Protected',
        'body': 'Your 500 ETB deposit is safely held in LINC Escrow until job completion.',
        'time': '2h ago',
        'icon': '🛡️',
      },
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Notifications',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                  Text(
                    'Mark all as read',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0284C7)),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              ...notifications.map((n) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(n['icon']!, style: const TextStyle(fontSize: 20)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  n['title']!,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                                ),
                                Text(
                                  n['time']!,
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              n['body']!,
                              style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final appMode = ref.watch(appModeProvider);
    final isProvider = appMode == AppMode.provider;
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final providersAsync = ref.watch(providerListProvider);
    final requestsAsync = ref.watch(requestListProvider);

    final firstName = user?.fullName.trim().split(' ').first ?? 'Yonas';

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),

      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. CYAN HEADER SECTION
              Container(
                color: const Color(0xFF7EC8E3),
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              GestureDetector(
                                onTap: () => _showLocationPicker(context),
                                child: Row(
                                  children: [
                                    const Icon(Icons.location_on, color: Color(0xFF1E5F7A), size: 13),
                                    const SizedBox(width: 4),
                                    Flexible(
                                      child: Text(
                                        _currentLocation,
                                        style: const TextStyle(
                                          color: Color(0xFF1E5F7A),
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: 2),
                                    const Icon(Icons.keyboard_arrow_down, color: Color(0xFF1E5F7A), size: 16),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                isProvider ? 'Provider Dashboard' : 'Good morning, $firstName',
                                style: const TextStyle(
                                  color: Color(0xFF0F172A),
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Right Side: Mode Switcher & Notification Bell
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            GestureDetector(
                              onTap: () {
                                ref.read(appModeProvider.notifier).state =
                                    ref.read(appModeProvider) == AppMode.client
                                        ? AppMode.provider
                                        : AppMode.client;
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 11),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.50),
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.70)),
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
                            GestureDetector(
                              onTap: () => _showNotificationsModal(context),
                              child: Stack(
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
                          color: Colors.white.withValues(alpha: 0.45),
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
                                color: const Color(0xFF7EC8E3),
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
                      _buildQuickChip(context, '🚨', 'Urgent', isUrgent: true),
                      _buildQuickChip(context, '🧹', 'Cleaning'),
                      _buildQuickChip(context, '📚', 'Tutor'),
                      _buildQuickChip(context, '💻', 'IT Help'),
                      _buildQuickChip(context, '🔧', 'Repairs'),
                      _buildQuickChip(context, '🚗', 'Transport'),
                    ],
                  ),
                ),
              ),

              // 3. CATEGORIES GRID
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
                          Text(
                            '  ${_currentLocation.split(',').first} · 2 km',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
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
                    providersAsync.when(
                      loading: () => const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF7EC8E3)),
                        ),
                      ),
                      error: (err, _) => Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                          child: Text(
                            'Unable to load nearby providers',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                          ),
                        ),
                      ),
                      data: (providers) {
                        if (providers.isEmpty) {
                          return Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                              child: Column(
                                children: [
                                  const Icon(Icons.person_search_outlined, size: 36, color: Color(0xFF94A3B8)),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'No registered providers yet',
                                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF475569)),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Create a provider account to be featured here!',
                                    style: TextStyle(fontSize: 11.5, color: Colors.grey.shade500),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }
                        return SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Row(
                            children: providers.map((p) {
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
                        );
                      },
                    ),
                  ],
                ),
              ),

              // 5. OPEN REQUESTS
              Container(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 80),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
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
                            onTap: () => context.push('/search'),
                            child: const Text(
                              'Post Request',
                              style: TextStyle(color: Color(0xFF0284C7), fontSize: 12, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ],
                      ),
                    ),
                    requestsAsync.when(
                      loading: () => const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 20),
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF7EC8E3)),
                        ),
                      ),
                      error: (err, _) => Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                          child: Text(
                            'Unable to load open requests',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                          ),
                        ),
                      ),
                      data: (requests) {
                        if (requests.isEmpty) {
                          return Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                              child: Column(
                                children: [
                                  const Icon(Icons.assignment_outlined, size: 32, color: Color(0xFF94A3B8)),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'No open requests in database',
                                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF475569)),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Ask AI to post your first service request!',
                                    style: TextStyle(fontSize: 11.5, color: Colors.grey.shade500),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }
                        return Column(
                          children: requests.map((r) {
                            final isUrgent = r.urgency == 'urgent' || r.urgency == 'high';
                            final emoji = _getEmojiForCategory(r.title);
                            return _buildOpenRequestRow(
                              emoji,
                              r.title,
                              '${r.budgetMin.toInt()}–${r.budgetMax.toInt()} ${r.currency}',
                              r.time,
                              r.city,
                              isUrgent,
                            );
                          }).toList(),
                        );
                      },
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

  Widget _buildQuickChip(BuildContext context, String emoji, String label, {bool isUrgent = false}) {
    return GestureDetector(
      onTap: () {
        context.push('/search?query=${Uri.encodeComponent(label)}');
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 12),
        decoration: BoxDecoration(
          color: isUrgent ? const Color(0xFFFEF2F2) : const Color(0xFFF8FAFC),
          border: Border.all(color: isUrgent ? const Color(0xFFFCA5A5) : const Color(0xFFE2E8F0), width: 1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 12)),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isUrgent ? const Color(0xFFDC2626) : const Color(0xFF334155),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCell(BuildContext context, String emoji, String label, Color color, {required bool showRightBorder, required bool showBottomBorder}) {
    return Expanded(
      child: GestureDetector(
        onTap: () => context.push('/search?query=${Uri.encodeComponent(label)}'),
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
                  color: color.withValues(alpha: 0.12),
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

  String _getEmojiForCategory(String title) {
    final lower = title.toLowerCase();
    if (lower.contains('pipe') || lower.contains('water') || lower.contains('leak') || lower.contains('plumb')) {
      return '🔧';
    }
    if (lower.contains('electr') || lower.contains('wire') || lower.contains('light') || lower.contains('power')) {
      return '⚡';
    }
    if (lower.contains('clean') || lower.contains('maid') || lower.contains('house')) {
      return '🧹';
    }
    if (lower.contains('laptop') || lower.contains('comput') || lower.contains('tech') || lower.contains('it')) {
      return '💻';
    }
    if (lower.contains('tutor') || lower.contains('teach') || lower.contains('lesson') || lower.contains('math')) {
      return '📚';
    }
    if (lower.contains('car') || lower.contains('driv') || lower.contains('transport') || lower.contains('cargo')) {
      return '🚗';
    }
    return '📋';
  }

  Widget _buildOpenRequestRow(String emoji, String title, String budget, String time, String location, bool isUrgent) {
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
                            letterSpacing: 0.07,
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
                    Expanded(
                      child: Text(
                        location,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => context.push('/search'),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFE0F2FE),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Offer',
                style: TextStyle(
                  color: Color(0xFF0284C7),
                  fontSize: 11.5,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
