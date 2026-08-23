import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../widgets/user_avatar.dart';
import '../../widgets/avatar_picker_dialog.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  String _selectedLanguage = 'English (US)';

  void _showLanguageSelector(BuildContext context) {
    final languages = [
      {'name': 'English (US)', 'native': 'English', 'flag': '🇺🇸'},
      {'name': 'Amharic', 'native': 'አማርኛ', 'flag': '🇪🇹'},
      {'name': 'Afaan Oromoo', 'native': 'Afaan Oromoo', 'flag': '🇪🇹'},
      {'name': 'Tigrinya', 'native': 'ትግርኛ', 'flag': '🇪🇹'},
      {'name': 'Somali', 'native': 'Soomaali', 'flag': '🇸🇴'},
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
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
                'Select Language / ቋንቋ ይምረጡ',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 14),
              ...languages.map((lang) {
                final isSelected = _selectedLanguage == lang['name'];
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Text(lang['flag']!, style: const TextStyle(fontSize: 24)),
                  title: Text(
                    lang['name']!,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                      color: isSelected ? const Color(0xFF0284C7) : const Color(0xFF0F172A),
                    ),
                  ),
                  subtitle: Text(
                    lang['native']!,
                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                  trailing: isSelected
                      ? const Icon(Icons.check_circle_rounded, color: Color(0xFF7EC8E3), size: 20)
                      : null,
                  onTap: () {
                    setState(() {
                      _selectedLanguage = lang['name']!;
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Language updated to ${lang['name']}'),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                );
              }),
            ],
          ),
        );
      },
    );
  }

  void _showPaymentMethods(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
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
                  Icon(Icons.shield_outlined, color: Color(0xFF10B981), size: 20),
                  SizedBox(width: 8),
                  Text(
                    'LINC Escrow & Payment Methods',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: const Row(
                  children: [
                    Text('🛡️', style: TextStyle(fontSize: 20)),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        '100% Money-Back Escrow Protection powered by Chapa. Funds are only released when you approve the job.',
                        style: TextStyle(fontSize: 11.5, color: Color(0xFF065F46), height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              _buildPaymentOption('Chapa Escrow (Safe Pay)', 'Cards, Telebirr, CBEBirr, Awash', '💳', true),
              _buildPaymentOption('Telebirr Direct', '+251 91 **** 782', '📱', false),
              _buildPaymentOption('CBE Birr', '+251 91 **** 782', '🏦', false),
              _buildPaymentOption('Cash on Delivery', 'Pay provider in cash upon completion', '💵', false),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPaymentOption(String title, String subtitle, String icon, bool isDefault) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                    if (isDefault) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('RECOMMENDED', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w800)),
                      ),
                    ],
                  ],
                ),
                Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
          ),
          const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 18),
        ],
      ),
    );
  }

  void _showHelpSupport(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
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
                'Help & Support',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(color: const Color(0xFFE0F2FE), borderRadius: BorderRadius.circular(10)),
                  alignment: Alignment.center,
                  child: const Text('🤖', style: TextStyle(fontSize: 18)),
                ),
                title: const Text('Ask LINC AI Assistant', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
                subtitle: const Text('Instant answers to booking & service questions', style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                trailing: const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
                onTap: () {
                  Navigator.pop(ctx);
                  context.go('/ai');
                },
              ),
              const Divider(height: 1, color: Color(0xFFF1F5F9)),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(10)),
                  alignment: Alignment.center,
                  child: const Icon(Icons.phone_in_talk_rounded, color: Color(0xFF059669), size: 18),
                ),
                title: const Text('Call Support Hotline', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
                subtitle: const Text('8844 (Toll-Free in Ethiopia)', style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                trailing: const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
                onTap: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Calling LINC Support at 8844...')),
                  );
                },
              ),
              const Divider(height: 1, color: Color(0xFFF1F5F9)),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(10)),
                  alignment: Alignment.center,
                  child: const Icon(Icons.email_outlined, color: Color(0xFFD97706), size: 18),
                ),
                title: const Text('Email Support', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
                subtitle: const Text('support@linc.et', style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                trailing: const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
                onTap: () {
                  Navigator.pop(ctx);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showSignOutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
          content: const Text('Are you sure you want to sign out of LINC?', style: TextStyle(color: Color(0xFF64748B), fontSize: 13.5)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                Navigator.pop(ctx);
                ref.read(authProvider.notifier).signOut();
                context.go('/welcome');
              },
              child: const Text('Sign Out', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            ),
          ],
        );
      },
    );
  }

  Future<void> _changeProfilePicture() async {
    final user = ref.read(authProvider).user;
    if (user == null) return;

    await AvatarPickerDialog.show(
      context: context,
      currentAvatarUrl: user.avatarUrl,
      initials: user.initials,
      onAvatarSelected: (newAvatarUrl) async {
        try {
          await ref.read(authProvider.notifier).updateProfile(avatarUrl: newAvatarUrl);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Profile picture updated successfully!'),
                backgroundColor: Color(0xFF10B981),
                duration: Duration(seconds: 2),
              ),
            );
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Failed to update photo: $e')),
            );
          }
        }
      },
    );
  }

  void _showEditProfileDialog(BuildContext context) {
    final user = ref.read(authProvider).user;
    if (user == null) return;

    final nameController = TextEditingController(text: user.fullName);
    final phoneController = TextEditingController(text: user.phone ?? '');
    final cityController = TextEditingController(text: user.locationCity ?? 'Addis Ababa');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(width: 40, height: 4, decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2))),
            ),
            const SizedBox(height: 16),
            const Text('Edit Profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
            const SizedBox(height: 16),
            Center(
              child: UserAvatar(
                avatarUrl: user.avatarUrl,
                initials: user.initials,
                size: 72,
                borderRadius: 22,
                showEditBadge: true,
                onTap: () {
                  Navigator.pop(ctx);
                  _changeProfilePicture();
                },
              ),
            ),
            const SizedBox(height: 6),
            Center(
              child: TextButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  _changeProfilePicture();
                },
                icon: const Icon(Icons.camera_alt_outlined, size: 16, color: Color(0xFF0284C7)),
                label: const Text('Change Photo', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0284C7))),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Full Name',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                hintText: '+251 91 122 3344',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: cityController,
              decoration: const InputDecoration(
                labelText: 'City / Location',
                hintText: 'Addis Ababa, Bole',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () async {
                  final newName = nameController.text.trim();
                  final newPhone = phoneController.text.trim();
                  final newCity = cityController.text.trim();

                  final messenger = ScaffoldMessenger.of(context);
                  Navigator.pop(ctx);

                  try {
                    await ref.read(authProvider.notifier).updateProfile(
                      fullName: newName.isNotEmpty ? newName : null,
                      phone: newPhone.isNotEmpty ? newPhone : null,
                      locationCity: newCity.isNotEmpty ? newCity : null,
                    );
                    if (mounted) {
                      messenger.showSnackBar(
                        const SnackBar(
                          content: Text('Profile details updated!'),
                          backgroundColor: Color(0xFF10B981),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      messenger.showSnackBar(
                        SnackBar(content: Text('Failed to update profile: $e')),
                      );
                    }
                  }
                },
                child: const Text('Save Changes', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final appMode = ref.watch(appModeProvider);
    final isProvider = appMode == AppMode.provider;

    final group1 = [
      {'icon': '👤', 'label': 'Edit Profile & Photo', 'badge': null, 'highlight': false, 'action': () => _showEditProfileDialog(context)},
      {'icon': '🔔', 'label': 'Notifications', 'badge': '3', 'highlight': false, 'action': () => _showHelpSupport(context)},
      {'icon': '📍', 'label': 'Saved Locations', 'badge': null, 'highlight': false, 'action': () {}},
      {'icon': '💳', 'label': 'Payment Methods & Escrow', 'badge': null, 'highlight': false, 'action': () => _showPaymentMethods(context)},
      {'icon': '🌐', 'label': 'Language / ቋንቋ', 'badge': _selectedLanguage.split(' ').first, 'highlight': false, 'action': () => _showLanguageSelector(context)},
    ];

    final group2 = [
      if (isProvider)
        {'icon': '🛠️', 'label': 'Edit Provider Profile & Trade', 'badge': null, 'highlight': false, 'action': () => context.push('/provider-setup')},
      {'icon': '🛡️', 'label': 'Trust & Verification', 'badge': 'Recommended', 'highlight': true, 'action': () => context.push('/verification')},
      {'icon': isProvider ? '👤' : '💼', 'label': isProvider ? 'Switch to Client View' : 'Switch to Provider Dashboard', 'badge': null, 'highlight': false, 'action': () {
        ref.read(appModeProvider.notifier).state = isProvider ? AppMode.client : AppMode.provider;
        context.go('/home');
      }},
      {'icon': '❓', 'label': 'Help & Support', 'badge': null, 'highlight': false, 'action': () => _showHelpSupport(context)},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Cyan Profile Header
              Container(
                width: double.infinity,
                decoration: const BoxDecoration(color: Color(0xFF7EC8E3)),
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Profile', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                        GestureDetector(
                          onTap: () => _showHelpSupport(context),
                          child: Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(color: const Color(0x26FFFFFF), borderRadius: BorderRadius.circular(10)),
                            child: const Icon(Icons.help_outline_rounded, color: Color(0xFF0F172A), size: 20),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        UserAvatar(
                          avatarUrl: user?.avatarUrl,
                          initials: user?.initials ?? 'YM',
                          size: 64,
                          borderRadius: 20,
                          backgroundColor: const Color(0x66FFFFFF),
                          textColor: const Color(0xFF0F172A),
                          showEditBadge: true,
                          onTap: _changeProfilePicture,
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user?.fullName.isNotEmpty == true ? user!.fullName : 'Yonas Molla',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0F172A),
                                  letterSpacing: -0.02,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                user?.email.isNotEmpty == true ? user!.email : 'yonas.molla@email.com',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF1E5F7A)),
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
                                  GestureDetector(
                                    onTap: _changeProfilePicture,
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: const Color(0x80FFFFFF),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.camera_alt_outlined, size: 10, color: Color(0xFF0F172A)),
                                          SizedBox(width: 3),
                                          Text(
                                            'EDIT PHOTO',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w800,
                                              color: Color(0xFF0F172A),
                                              letterSpacing: 0.06,
                                            ),
                                          ),
                                        ],
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
                                    child: Text(
                                      isProvider ? '💼 Provider' : '👤 Client',
                                      style: const TextStyle(
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
                      ],
                    ),
                  ],
                ),
              ),

              // Metric Stats Bar
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
                            children: [
                              Text(
                                '${ref.watch(bookingListProvider).value?.length ?? 0}',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.02),
                              ),
                              const SizedBox(height: 2),
                              const Text('Bookings', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                      const VerticalDivider(width: 1, color: Color(0xFFE2E8F0)),
                      const Expanded(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '5.0',
                                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.02),
                              ),
                              SizedBox(height: 2),
                              Text('Rating ★', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                      const VerticalDivider(width: 1, color: Color(0xFFE2E8F0)),
                      const Expanded(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '100%',
                                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.02),
                              ),
                              SizedBox(height: 2),
                              Text('Escrow Trust', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
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
                padding: const EdgeInsets.only(top: 8, bottom: 24),
                child: Center(
                  child: TextButton.icon(
                    onPressed: () => _showSignOutDialog(context),
                    icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 18),
                    label: const Text(
                      'Sign Out',
                      style: TextStyle(
                        fontSize: 14,
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
                      color: isHighlight ? const Color(0xFFE0F2FE) : const Color(0xFFF8FAFC),
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
                        color: isHighlight ? const Color(0xFF0284C7) : const Color(0xFF1E293B),
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      if (badge != null) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: BoxDecoration(
                            color: isHighlight ? const Color(0xFF0284C7) : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            badge,
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              color: isHighlight ? Colors.white : const Color(0xFF64748B),
                            ),
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
