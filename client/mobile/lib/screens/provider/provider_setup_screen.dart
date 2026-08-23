import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../services/provider_service.dart';
import '../../widgets/user_avatar.dart';
import '../../widgets/avatar_picker_dialog.dart';

class ProviderSetupScreen extends ConsumerStatefulWidget {
  const ProviderSetupScreen({super.key});

  @override
  ConsumerState<ProviderSetupScreen> createState() => _ProviderSetupScreenState();
}

class _ProviderSetupScreenState extends ConsumerState<ProviderSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _headlineController = TextEditingController();
  final _bioController = TextEditingController();
  final _rateController = TextEditingController(text: '350');
  final _cityController = TextEditingController(text: 'Addis Ababa, Bole');

  String _selectedCategory = 'plumbing';
  String _selectedAvailability = 'available';
  bool _isLoading = false;
  String? _errorMessage;

  final List<Map<String, dynamic>> _categories = [
    {'id': '1', 'slug': 'plumbing', 'name': 'Plumbing & Water', 'icon': Icons.plumbing, 'suggestedHeadline': 'Master Plumber & Pipe Specialist'},
    {'id': '3', 'slug': 'electric', 'name': 'Electrical Work', 'icon': Icons.bolt_outlined, 'suggestedHeadline': 'Certified Electrician & Wiring Pro'},
    {'id': '2', 'slug': 'cleaning', 'name': 'Cleaning & Maid', 'icon': Icons.cleaning_services_outlined, 'suggestedHeadline': 'Professional Deep Cleaning Specialist'},
    {'id': '4', 'slug': 'it-tech', 'name': 'IT & Computer', 'icon': Icons.computer_outlined, 'suggestedHeadline': 'Computer Repair & IT Technician'},
    {'id': '5', 'slug': 'tutoring', 'name': 'Tutoring & Skills', 'icon': Icons.school_outlined, 'suggestedHeadline': 'Experienced Academic & Language Tutor'},
    {'id': '6', 'slug': 'transport', 'name': 'Transport & Cargo', 'icon': Icons.directions_car_outlined, 'suggestedHeadline': 'Safe Driver & Moving Logistics Pro'},
    {'id': '7', 'slug': 'wellness', 'name': 'Health & Wellness', 'icon': Icons.spa_outlined, 'suggestedHeadline': 'Certified Personal Trainer & Wellness Pro'},
    {'id': '8', 'slug': 'creative', 'name': 'Painting & Design', 'icon': Icons.brush_outlined, 'suggestedHeadline': 'Interior Painter & Decorating Specialist'},
  ];

  final List<String> _locationSuggestions = [
    'Bole, Addis Ababa',
    'Kazanchis, Addis Ababa',
    'Sarbet, Addis Ababa',
    'CMC / Ayat, Addis Ababa',
    'Piassa / Arada, Addis Ababa',
    'Megenagna, Addis Ababa',
  ];

  @override
  void initState() {
    super.initState();
    _headlineController.text = _categories[0]['suggestedHeadline'];
    _loadExistingProfile();
  }

  Future<void> _loadExistingProfile() async {
    try {
      final profile = await ProviderService().getMyProfile();
      if (profile != null && mounted) {
        setState(() {
          if (profile['headline'] != null) {
            _headlineController.text = profile['headline'].toString();
          }
          if (profile['bio'] != null) {
            _bioController.text = profile['bio'].toString();
          }
          if (profile['hourly_rate'] != null) {
            _rateController.text = profile['hourly_rate'].toString();
          }
          if (profile['location_city'] != null) {
            _cityController.text = profile['location_city'].toString();
          }
          if (profile['availability_status'] != null) {
            _selectedAvailability = profile['availability_status'].toString();
          }
          // Match category from categories or headline
          final headline = (profile['headline'] ?? '').toString().toLowerCase();
          final matchingCat = _categories.firstWhere(
            (c) => headline.contains(c['slug']) || headline.contains(c['name'].toString().toLowerCase()),
            orElse: () => _categories[0],
          );
          _selectedCategory = matchingCat['slug'];
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _headlineController.dispose();
    _bioController.dispose();
    _rateController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final rate = double.tryParse(_rateController.text.trim()) ?? 350.0;
      final selectedCatObj = _categories.firstWhere(
        (c) => c['slug'] == _selectedCategory,
        orElse: () => _categories[0],
      );

      await ProviderService().createMyProfile(
        headline: _headlineController.text.trim(),
        bio: _bioController.text.trim().isNotEmpty
            ? _bioController.text.trim()
            : 'Dedicated and verified professional providing high quality service across ${_cityController.text.trim()}.',
        hourlyRate: rate,
        currency: 'ETB',
        locationCity: _cityController.text.trim(),
        categoryIds: [selectedCatObj['id'].toString()],
        availabilityStatus: _selectedAvailability,
      );

      // Clear needsProviderSetup flag and set App Mode to Provider Dashboard
      ref.read(needsProviderSetupProvider.notifier).state = false;
      ref.read(appModeProvider.notifier).state = AppMode.provider;
      ref.invalidate(providerListProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Provider profile created successfully! Welcome aboard.'),
            backgroundColor: Color(0xFF10B981),
            duration: Duration(seconds: 3),
          ),
        );
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final firstName = user?.fullName.trim().split(' ').first ?? 'Provider';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            // Cyan Header
            Container(
              width: double.infinity,
              color: AppColors.headerBg,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 16,
                left: 16,
                right: 16,
                bottom: 20,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        onPressed: () {
                          ref.read(needsProviderSetupProvider.notifier).state = false;
                          if (context.canPop()) {
                            context.pop();
                          } else {
                            context.go('/home');
                          }
                        },
                        icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary, size: 20),
                      ),
                      TextButton(
                        onPressed: () {
                          ref.read(needsProviderSetupProvider.notifier).state = false;
                          ref.read(appModeProvider.notifier).state = AppMode.provider;
                          context.go('/home');
                        },
                        child: const Text(
                          'Skip for now',
                          style: TextStyle(color: Color(0xFF1E5F7A), fontWeight: FontWeight.w700, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Welcome, $firstName!',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.02,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Set up your professional profile to start getting service bookings.',
                    style: TextStyle(
                      fontSize: 13,
                      color: Color(0xFF1E5F7A),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (_errorMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFFCA5A5)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(color: Color(0xFFDC2626), fontSize: 12, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // 0. PROFILE PICTURE
                      Builder(builder: (context) {
                        final user = ref.watch(authProvider).user;
                        return _buildSectionCard(
                          title: 'Professional Profile Photo',
                          subtitle: 'Upload a clear headshot or business logo to build trust',
                          child: Row(
                            children: [
                              UserAvatar(
                                avatarUrl: user?.avatarUrl,
                                initials: user?.initials ?? 'SP',
                                size: 64,
                                borderRadius: 18,
                                showEditBadge: true,
                                onTap: () async {
                                  if (user == null) return;
                                  await AvatarPickerDialog.show(
                                    context: context,
                                    currentAvatarUrl: user.avatarUrl,
                                    initials: user.initials,
                                    onAvatarSelected: (newAvatarUrl) async {
                                      try {
                                        await ref.read(authProvider.notifier).updateProfile(avatarUrl: newAvatarUrl);
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(
                                              content: Text('Profile photo updated!'),
                                              backgroundColor: Color(0xFF10B981),
                                              duration: Duration(seconds: 2),
                                            ),
                                          );
                                        }
                                      } catch (e) {
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(content: Text('Failed to update photo: $e')),
                                          );
                                        }
                                      }
                                    },
                                  );
                                },
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFFE0F2FE),
                                        foregroundColor: const Color(0xFF0284C7),
                                        elevation: 0,
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      onPressed: () async {
                                        if (user == null) return;
                                        await AvatarPickerDialog.show(
                                          context: context,
                                          currentAvatarUrl: user.avatarUrl,
                                          initials: user.initials,
                                          onAvatarSelected: (newAvatarUrl) async {
                                            try {
                                              await ref.read(authProvider.notifier).updateProfile(avatarUrl: newAvatarUrl);
                                              if (context.mounted) {
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  const SnackBar(
                                                    content: Text('Profile photo updated!'),
                                                    backgroundColor: Color(0xFF10B981),
                                                    duration: Duration(seconds: 2),
                                                  ),
                                                );
                                              }
                                            } catch (e) {
                                              if (context.mounted) {
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  SnackBar(content: Text('Failed to update photo: $e')),
                                                );
                                              }
                                            }
                                          },
                                        );
                                      },
                                      icon: const Icon(Icons.camera_alt_outlined, size: 16),
                                      label: Text(
                                        user?.avatarUrl != null && user!.avatarUrl!.isNotEmpty ? 'Change Photo' : 'Upload Photo',
                                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    const Text(
                                      'JPG or PNG · Up to 5MB',
                                      style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                      const SizedBox(height: 16),

                      // 1. SELECT TRADE / CATEGORY
                      _buildSectionCard(
                        title: '1. Primary Trade / Specialty',
                        subtitle: 'Select the main type of service you provide',
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _categories.map((cat) {
                            final isSelected = _selectedCategory == cat['slug'];
                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedCategory = cat['slug'];
                                  if (_headlineController.text.isEmpty ||
                                      _categories.any((c) => c['suggestedHeadline'] == _headlineController.text)) {
                                    _headlineController.text = cat['suggestedHeadline'];
                                  }
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFF7EC8E3) : const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isSelected ? const Color(0xFF0284C7) : const Color(0xFFE2E8F0),
                                    width: isSelected ? 1.5 : 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      cat['icon'] as IconData,
                                      size: 15,
                                      color: isSelected ? Colors.white : const Color(0xFF0284C7),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      cat['name'] as String,
                                      style: TextStyle(
                                        fontSize: 12.5,
                                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                        color: isSelected ? Colors.white : const Color(0xFF334155),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 2. PROFESSIONAL HEADLINE
                      _buildSectionCard(
                        title: '2. Professional Headline',
                        subtitle: 'This will appear at the top of your profile card',
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            TextFormField(
                              controller: _headlineController,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                              decoration: InputDecoration(
                                hintText: 'e.g. Certified Electrician & Home Wiring Pro',
                                filled: true,
                                fillColor: const Color(0xFFF8FAFC),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF7EC8E3), width: 1.5)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                              ),
                              validator: (val) {
                                if (val == null || val.trim().isEmpty) return 'Headline is required';
                                if (val.trim().length < 4) return 'Please enter a more descriptive headline';
                                return null;
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 3. HOURLY RATE & OPERATING LOCATION
                      _buildSectionCard(
                        title: '3. Rates & Operating Location',
                        subtitle: 'Set your standard starting rate and location',
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  flex: 5,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Hourly Rate (ETB)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF475569))),
                                      const SizedBox(height: 6),
                                      TextFormField(
                                        controller: _rateController,
                                        keyboardType: TextInputType.number,
                                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                                        decoration: InputDecoration(
                                          prefixText: 'ETB ',
                                          prefixStyle: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.w800, fontSize: 13),
                                          suffixText: '/hr',
                                          suffixStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                                          filled: true,
                                          fillColor: const Color(0xFFF8FAFC),
                                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF7EC8E3), width: 1.5)),
                                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                        ),
                                        validator: (val) {
                                          if (val == null || val.trim().isEmpty) return 'Enter rate';
                                          if (double.tryParse(val.trim()) == null) return 'Valid number';
                                          return null;
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  flex: 6,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('City / Sub-city', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF475569))),
                                      const SizedBox(height: 6),
                                      TextFormField(
                                        controller: _cityController,
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                                        decoration: InputDecoration(
                                          prefixIcon: const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFF0284C7)),
                                          filled: true,
                                          fillColor: const Color(0xFFF8FAFC),
                                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF7EC8E3), width: 1.5)),
                                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: _locationSuggestions.map((loc) {
                                  return GestureDetector(
                                    onTap: () => setState(() => _cityController.text = loc),
                                    child: Container(
                                      margin: const EdgeInsets.only(right: 6),
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF1F5F9),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        loc.split(',').first,
                                        style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 4. BIO & EXPERIENCE
                      _buildSectionCard(
                        title: '4. About Your Services & Experience',
                        subtitle: 'Highlight your skills, background, tools, and response time',
                        child: TextFormField(
                          controller: _bioController,
                          maxLines: 4,
                          style: const TextStyle(fontSize: 13.5, color: Color(0xFF0F172A), height: 1.4),
                          decoration: InputDecoration(
                            hintText: 'E.g. Certified technician with 6+ years experience in Addis Ababa. I carry modern diagnostic tools, offer quick same-day emergency repairs, and guarantee all my work with escrow safety.',
                            hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8), height: 1.4),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF7EC8E3), width: 1.5)),
                            contentPadding: const EdgeInsets.all(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 5. AVAILABILITY STATUS
                      _buildSectionCard(
                        title: '5. Initial Availability Status',
                        subtitle: 'Clients can see when you are open for work',
                        child: Row(
                          children: [
                            Expanded(
                              child: _buildAvailabilityCard('available', const Color(0xFF10B981), 'Available', 'Accepting jobs now'),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildAvailabilityCard('busy', const Color(0xFFF59E0B), 'Busy', 'Book in advance'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),

                      // SUBMIT BUTTON
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F172A),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                          onPressed: _isLoading ? null : _handleSave,
                          child: _isLoading
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Text(
                                  'Save & Launch Provider Profile',
                                  style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCard({required String title, required String subtitle, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }

  Widget _buildAvailabilityCard(String id, Color dotColor, String label, String sub) {
    final isSelected = _selectedAvailability == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedAvailability = id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE0F2FE) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF38BDF8) : const Color(0xFFE2E8F0),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: dotColor,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Text(sub, style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B))),
          ],
        ),
      ),
    );
  }
}
