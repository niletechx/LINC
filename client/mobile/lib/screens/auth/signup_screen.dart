import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../services/provider_service.dart';
import '../../widgets/server_config_dialog.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  int _step = 1;
  String _name = '';
  String _email = '';
  String _phone = '';
  String _password = '';
  String _confirmPw = '';
  bool _showPw = false;
  bool _loading = false;
  String _error = '';
  String _mode = 'client';

  // Provider specific fields (Step 4)
  final _headlineController = TextEditingController(text: 'Master Plumber & Pipe Specialist');
  final _bioController = TextEditingController();
  final _rateController = TextEditingController(text: '350');
  final _cityController = TextEditingController(text: 'Addis Ababa, Bole');
  String _selectedCategory = 'plumbing';
  String _selectedAvailability = 'available';

  final List<Map<String, dynamic>> _categories = [
    {'id': '1', 'slug': 'plumbing', 'name': 'Plumbing & Water', 'emoji': '🔧', 'suggestedHeadline': 'Master Plumber & Pipe Specialist'},
    {'id': '3', 'slug': 'electric', 'name': 'Electrical Work', 'emoji': '⚡', 'suggestedHeadline': 'Certified Electrician & Wiring Pro'},
    {'id': '2', 'slug': 'cleaning', 'name': 'Cleaning & Maid', 'emoji': '🧹', 'suggestedHeadline': 'Professional Deep Cleaning Specialist'},
    {'id': '4', 'slug': 'it-tech', 'name': 'IT & Computer', 'emoji': '💻', 'suggestedHeadline': 'Computer Repair & IT Technician'},
    {'id': '5', 'slug': 'tutoring', 'name': 'Tutoring & Skills', 'emoji': '📚', 'suggestedHeadline': 'Experienced Academic & Language Tutor'},
    {'id': '6', 'slug': 'transport', 'name': 'Transport & Cargo', 'emoji': '🚗', 'suggestedHeadline': 'Safe Driver & Moving Logistics Pro'},
    {'id': '7', 'slug': 'wellness', 'name': 'Health & Wellness', 'emoji': '💆', 'suggestedHeadline': 'Certified Personal Trainer & Wellness Pro'},
    {'id': '8', 'slug': 'creative', 'name': 'Painting & Design', 'emoji': '🎨', 'suggestedHeadline': 'Interior Painter & Decorating Specialist'},
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
  void dispose() {
    _headlineController.dispose();
    _bioController.dispose();
    _rateController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  void _showServerConfigDialog(BuildContext context) {
    ServerConfigDialog.show(context).then((_) {
      if (mounted) setState(() {});
    });
  }

  void _handleNext() {
    setState(() {
      _error = '';
    });

    if (_step == 1) {
      final name = _name.trim();
      final email = _email.trim();
      final phone = _phone.trim();

      if (name.isEmpty || email.isEmpty || phone.isEmpty) {
        setState(() => _error = 'Please fill all fields');
        return;
      }

      final nameRegex = RegExp(r'^[a-zA-Z\s]+$');
      if (!nameRegex.hasMatch(name)) {
        setState(() => _error = 'Please enter a valid name (letters only)');
        return;
      }

      final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
      if (!emailRegex.hasMatch(email)) {
        setState(() => _error = 'Please enter a valid email address');
        return;
      }

      final phoneRegex = RegExp(r'^\+?[0-9\s\-]+$');
      if (!phoneRegex.hasMatch(phone)) {
        setState(() => _error = 'Please enter a valid phone number');
        return;
      }

      setState(() => _step = 2);
    } else if (_step == 2) {
      if (_password.isEmpty) {
        setState(() => _error = 'Please enter a password');
        return;
      }
      if (_password.length <= 6) {
        setState(() => _error = 'Password must be more than 6 characters');
        return;
      }
      if (_password != _confirmPw) {
        setState(() => _error = 'Passwords do not match');
        return;
      }
      setState(() => _step = 3);
    } else if (_step == 3) {
      if (_mode == 'provider') {
        setState(() => _step = 4);
      } else {
        _handleSignup();
      }
    } else if (_step == 4) {
      if (_headlineController.text.trim().isEmpty) {
        setState(() => _error = 'Please enter your professional headline');
        return;
      }
      _handleSignup();
    }
  }

  void _handleBack() {
    if (_step > 1) {
      setState(() => _step--);
    } else {
      context.go('/welcome');
    }
  }

  Future<void> _handleSignup() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    
    try {
      String cleanUsername = _name.replaceAll(RegExp(r'[^a-zA-Z0-9_]'), '').toLowerCase();
      if (cleanUsername.length < 3) {
        cleanUsername = '${cleanUsername}_${DateTime.now().millisecondsSinceEpoch % 10000}';
      }

      if (_mode == 'provider') {
        ref.read(appModeProvider.notifier).state = AppMode.provider;
        ref.read(needsProviderSetupProvider.notifier).state = false;
      } else {
        ref.read(appModeProvider.notifier).state = AppMode.client;
        ref.read(needsProviderSetupProvider.notifier).state = false;
      }

      // 1. Register base account
      await ref.read(authProvider.notifier).register(
        email: _email.trim(),
        password: _password,
        fullName: _name.trim(),
        username: cleanUsername,
        phone: _phone.trim(),
        role: _mode,
        locationCity: _cityController.text.trim().isNotEmpty ? _cityController.text.trim() : 'Addis Ababa',
        headline: _mode == 'provider' ? _headlineController.text.trim() : null,
      );

      // 2. If provider, persist full provider profile to database
      if (_mode == 'provider') {
        final rate = double.tryParse(_rateController.text.trim()) ?? 350.0;
        final selectedCatObj = _categories.firstWhere(
          (c) => c['slug'] == _selectedCategory,
          orElse: () => _categories[0],
        );

        try {
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
          ref.invalidate(providerListProvider);
        } catch (e) {
          debugPrint('Provider profile creation warning: $e');
        }
      }

      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    String title = 'Create Account';
    if (_step == 2) title = 'Secure Account';
    if (_step == 3) title = 'Choose Role';
    if (_step == 4) title = 'Provider Details';

    final totalSteps = _mode == 'provider' ? 4 : 3;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            color: AppColors.headerBg,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 16,
              left: 16,
              right: 16,
              bottom: 24,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      onPressed: _handleBack,
                      icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                    ),
                    GestureDetector(
                      onTap: () => _showServerConfigDialog(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.35),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.wifi_tethering, color: Color(0xFF0F172A), size: 14),
                            SizedBox(width: 4),
                            Text(
                              'Server IP',
                              style: TextStyle(
                                color: Color(0xFF0F172A),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: List.generate(totalSteps, (index) {
                          return Expanded(
                            child: Container(
                              height: 4,
                              margin: EdgeInsets.only(right: index < totalSteps - 1 ? 8 : 0),
                              decoration: BoxDecoration(
                                color: _step >= index + 1 ? AppColors.textPrimary : AppColors.textPrimary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_error.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        border: Border.all(color: Colors.red.shade200),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _error,
                              style: const TextStyle(color: Colors.red, fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    ),
                  
                  if (_step == 1) _buildStep1(),
                  if (_step == 2) _buildStep2(),
                  if (_step == 3) _buildStep3(),
                  if (_step == 4) _buildStep4(),
                  
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _handleNext,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.textPrimary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: _loading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text(
                              _getButtonLabel(),
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                    ),
                  ),
                  if (_step == 1) ...[
                    const SizedBox(height: 32),
                    Center(
                      child: GestureDetector(
                        onTap: () => context.go('/login'),
                        child: const Text.rich(
                          TextSpan(
                            text: 'Already have account? ',
                            style: TextStyle(color: AppColors.secondaryText, fontSize: 14),
                            children: [
                              TextSpan(
                                text: 'Sign In',
                                style: TextStyle(
                                  color: AppColors.primaryBlue,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getButtonLabel() {
    if (_step == 1 || _step == 2) return 'Continue';
    if (_step == 3) {
      return _mode == 'provider' ? 'Next: Service Details 👉' : 'Create My Account';
    }
    return 'Create Provider Account 🚀';
  }

  Widget _buildStep1() {
    return Column(
      children: [
        _buildTextField(
          label: 'Full Name',
          hint: 'Enter your full name',
          onChanged: (v) => setState(() => _name = v),
        ),
        const SizedBox(height: 20),
        _buildTextField(
          label: 'Email Address',
          hint: 'Enter your email',
          keyboardType: TextInputType.emailAddress,
          onChanged: (v) => setState(() => _email = v),
        ),
        const SizedBox(height: 20),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Phone Number',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(13),
                border: Border.all(color: AppColors.divider, width: 1.5),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    decoration: const BoxDecoration(
                      border: Border(right: BorderSide(color: AppColors.divider, width: 1.5)),
                    ),
                    child: const Text(
                      '🇪🇹 +251',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      keyboardType: TextInputType.phone,
                      onChanged: (v) => setState(() => _phone = v),
                      decoration: const InputDecoration(
                        hintText: '9XX XXX XXX',
                        hintStyle: TextStyle(color: AppColors.muted),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      children: [
        _buildTextField(
          label: 'Password',
          hint: 'Create a password',
          obscureText: !_showPw,
          onChanged: (v) => setState(() => _password = v),
          suffixIcon: IconButton(
            icon: Icon(
              _showPw ? Icons.visibility_off : Icons.visibility,
              color: AppColors.secondaryText,
            ),
            onPressed: () => setState(() => _showPw = !_showPw),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: List.generate(4, (index) {
            Color c = AppColors.divider;
            if (_password.length > index * 2) {
              if (index < 2) {
                c = Colors.red;
              } else if (index < 3) {
                c = AppColors.amber;
              } else {
                c = AppColors.emerald;
              }
            }
            return Expanded(
              child: Container(
                height: 4,
                margin: EdgeInsets.only(right: index < 3 ? 4 : 0),
                decoration: BoxDecoration(
                  color: c,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 24),
        _buildTextField(
          label: 'Confirm Password',
          hint: 'Repeat your password',
          obscureText: !_showPw,
          onChanged: (v) => setState(() => _confirmPw = v),
        ),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      children: [
        _buildRoleCard(
          'client',
          'Client',
          '👤',
          'I want to find and book services',
        ),
        const SizedBox(height: 16),
        _buildRoleCard(
          'provider',
          'Provider',
          '💼',
          'I want to offer my services',
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.amber.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.amber.withValues(alpha: 0.3)),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline, color: AppColors.amber, size: 20),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'You can always switch roles or offer services anytime from your account settings.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textPrimary,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Step 4: Provider Details ──────────────────────────────────────────────
  Widget _buildStep4() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Specialty / Trade
        _buildCardWrapper(
          title: '1. Primary Trade / Specialty',
          subtitle: 'Choose what service category you provide',
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
                  padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
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
                      Text(cat['emoji'] as String, style: const TextStyle(fontSize: 14)),
                      const SizedBox(width: 6),
                      Text(
                        cat['name'] as String,
                        style: TextStyle(
                          fontSize: 12,
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

        // 2. Headline
        _buildCardWrapper(
          title: '2. Professional Headline',
          subtitle: 'A short headline describing your expertise',
          child: TextField(
            controller: _headlineController,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
            decoration: InputDecoration(
              hintText: 'e.g. Master Plumber & Pipe Specialist',
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF7EC8E3), width: 1.5)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // 3. Rate & City
        _buildCardWrapper(
          title: '3. Hourly Rate & Area',
          subtitle: 'Starting rate in ETB and your operating location',
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    flex: 5,
                    child: TextField(
                      controller: _rateController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                      decoration: InputDecoration(
                        labelText: 'Rate',
                        prefixText: 'ETB ',
                        prefixStyle: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.w800, fontSize: 12),
                        suffixText: '/hr',
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF7EC8E3), width: 1.5)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 6,
                    child: TextField(
                      controller: _cityController,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                      decoration: InputDecoration(
                        labelText: 'City / Sub-city',
                        prefixIcon: const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFF0284C7)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF7EC8E3), width: 1.5)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
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

        // 4. Bio / Experience
        _buildCardWrapper(
          title: '4. Bio & Experience',
          subtitle: 'What tools, background, and guarantees do you offer?',
          child: TextField(
            controller: _bioController,
            maxLines: 3,
            style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
            decoration: InputDecoration(
              hintText: 'e.g. Certified specialist with 5+ years experience in Addis Ababa. I carry modern tools and offer same-day emergency repairs.',
              hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
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

        // 5. Initial Availability
        _buildCardWrapper(
          title: '5. Initial Availability',
          subtitle: 'Clients can see when you are open for work',
          child: Row(
            children: [
              Expanded(
                child: _buildAvailabilityChip('available', '🟢 Available', 'Accepting jobs now'),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildAvailabilityChip('busy', '🟡 Busy', 'Book in advance'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCardWrapper({required String title, required String subtitle, required Widget child}) {
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
          Text(title, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildAvailabilityChip(String id, String label, String sub) {
    final isSelected = _selectedAvailability == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedAvailability = id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
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
            Text(label, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
            const SizedBox(height: 2),
            Text(sub, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleCard(String modeValue, String title, String emoji, String subtitle) {
    bool isSelected = _mode == modeValue;
    return GestureDetector(
      onTap: () => setState(() => _mode = modeValue),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primaryBlue : AppColors.divider,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: AppColors.primaryBlue.withValues(alpha: 0.1), blurRadius: 10)]
              : [],
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: Text(emoji, style: const TextStyle(fontSize: 24)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.secondaryText,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.primaryBlue : AppColors.divider,
                  width: isSelected ? 6 : 2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required String hint,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType? keyboardType,
    required Function(String) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          obscureText: obscureText,
          keyboardType: keyboardType,
          onChanged: onChanged,
          style: const TextStyle(fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.muted),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: const BorderSide(color: AppColors.divider, width: 1.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: const BorderSide(color: AppColors.divider, width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(13),
              borderSide: const BorderSide(color: AppColors.primaryBlue, width: 1.5),
            ),
            suffixIcon: suffixIcon,
          ),
        ),
      ],
    );
  }
}
