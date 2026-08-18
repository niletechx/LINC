import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/mock_data.dart';
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
  final List<Map<String, dynamic>> _userPostedRequests = [];

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

  void _showPostRequestModal(BuildContext context) {
    final titleController = TextEditingController();
    final budgetController = TextEditingController(text: '600');
    String urgency = 'standard';
    String selectedCat = '🔧 Plumbing & Repairs';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 24),
              child: SingleChildScrollView(
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
                    const Text(
                      'Post a Service Request',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Nearby verified providers will submit instant offers',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 16),
                    const Text('What do you need help with?', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
                    const SizedBox(height: 6),
                    TextField(
                      controller: titleController,
                      decoration: InputDecoration(
                        hintText: 'e.g. Need electrician to fix kitchen fuse box',
                        hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Text('Category', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          isExpanded: true,
                          value: selectedCat,
                          items: const [
                            DropdownMenuItem(value: '🔧 Plumbing & Repairs', child: Text('🔧 Plumbing & Repairs')),
                            DropdownMenuItem(value: '🧹 Deep Cleaning', child: Text('🧹 Deep Cleaning')),
                            DropdownMenuItem(value: '⚡ Electrical Work', child: Text('⚡ Electrical Work')),
                            DropdownMenuItem(value: '💻 IT & Tech Support', child: Text('💻 IT & Tech Support')),
                            DropdownMenuItem(value: '📚 Tutoring & Lessons', child: Text('📚 Tutoring & Lessons')),
                            DropdownMenuItem(value: '🚗 Transport & Moving', child: Text('🚗 Transport & Moving')),
                          ],
                          onChanged: (val) {
                            if (val != null) setModalState(() => selectedCat = val);
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Estimated Budget (ETB)', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
                              const SizedBox(height: 6),
                              TextField(
                                controller: budgetController,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  hintText: '500',
                                  suffixText: 'ETB',
                                  filled: true,
                                  fillColor: const Color(0xFFF8FAFC),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Urgency', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Expanded(
                                    child: GestureDetector(
                                      onTap: () => setModalState(() => urgency = 'standard'),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        decoration: BoxDecoration(
                                          color: urgency == 'standard' ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: const Color(0xFFE2E8F0)),
                                        ),
                                        alignment: Alignment.center,
                                        child: Text(
                                          'Standard',
                                          style: TextStyle(
                                            fontSize: 11.5,
                                            fontWeight: FontWeight.w700,
                                            color: urgency == 'standard' ? Colors.white : const Color(0xFF64748B),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: GestureDetector(
                                      onTap: () => setModalState(() => urgency = 'urgent'),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        decoration: BoxDecoration(
                                          color: urgency == 'urgent' ? const Color(0xFFEF4444) : const Color(0xFFF8FAFC),
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: const Color(0xFFE2E8F0)),
                                        ),
                                        alignment: Alignment.center,
                                        child: Text(
                                          '⚡ Urgent',
                                          style: TextStyle(
                                            fontSize: 11.5,
                                            fontWeight: FontWeight.w700,
                                            color: urgency == 'urgent' ? Colors.white : const Color(0xFF64748B),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F172A),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          final text = titleController.text.trim();
                          if (text.isEmpty) return;
                          setState(() {
                            _userPostedRequests.insert(0, {
                              'emoji': urgency == 'urgent' ? '⚡' : selectedCat.split(' ').first,
                              'title': text,
                              'budget': '${budgetController.text.trim()} ETB',
                              'time': 'Just now',
                              'offers': '0 offers',
                              'isUrgent': urgency == 'urgent',
                            });
                          });
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Your request is live! Providers have been notified.'),
                              backgroundColor: Color(0xFF10B981),
                              duration: Duration(seconds: 3),
                            ),
                          );
                        },
                        child: const Text(
                          'Publish Request',
                          style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showPostRequestModal(context),
        backgroundColor: const Color(0xFF0F172A),
        icon: const Icon(Icons.add_rounded, color: Colors.white, size: 20),
        label: const Text(
          'Post Request',
          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
        ),
      ),
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
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: (providersAsync.value != null && providersAsync.value!.isNotEmpty
                                ? providersAsync.value!
                                : MockData.providers)
                            .map((p) {
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
                margin: const EdgeInsets.only(bottom: 80),
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
                            onTap: () => _showPostRequestModal(context),
                            child: const Text(
                              '+ Post',
                              style: TextStyle(color: Color(0xFF7EC8E3), fontSize: 13, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // User posted requests
                    ..._userPostedRequests.map((r) {
                      return _buildOpenRequestRow(
                        r['emoji'] as String,
                        r['title'] as String,
                        r['budget'] as String,
                        r['time'] as String,
                        r['offers'] as String,
                        r['isUrgent'] as bool,
                      );
                    }),
                    if (requestsAsync.value != null && requestsAsync.value!.isNotEmpty)
                      ...requestsAsync.value!.map((r) {
                        final isUrgent = r.urgency == 'urgent';
                        return _buildOpenRequestRow(
                          isUrgent ? '⚡' : '🔧',
                          r.title,
                          '${r.budgetMin.toInt()}–${r.budgetMax.toInt()} ${r.currency}',
                          r.time,
                          '2 offers',
                          isUrgent,
                        );
                      })
                    else ...[
                      _buildOpenRequestRow('⚡', 'Emergency Electrical Repair', '500–800 ETB', '12m ago', '3 offers', true),
                      _buildOpenRequestRow('🧹', 'Deep Apartment Cleaning (2BHK)', '600–1,000 ETB', '35m ago', '5 offers', false),
                      _buildOpenRequestRow('🔧', 'Plumbing & Water Tank Fix', '400–700 ETB', '1h ago', '2 offers', false),
                    ],
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
        if (isUrgent) {
          _showPostRequestModal(context);
        } else {
          context.push('/search');
        }
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
        onTap: () => context.push('/search'),
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
                    Text(offers, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
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
