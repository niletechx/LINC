import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/provider_card.dart';
import '../../providers/data_providers.dart';

class SearchScreen extends ConsumerStatefulWidget {
  final String? initialQuery;
  final String? initialCategory;
  final String? initialFilter;
  const SearchScreen({super.key, this.initialQuery, this.initialCategory, this.initialFilter});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  late final TextEditingController _queryController;
  late String _activeFilter;
  late String _activeCategory;
  String _sortBy = 'match';

  @override
  void initState() {
    super.initState();
    _queryController = TextEditingController(text: widget.initialQuery ?? '');
    _activeCategory = widget.initialCategory ?? 'all';
    _activeFilter = widget.initialFilter ?? 'all';
  }

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  String _getCategoryDisplayName(String slug) {
    switch (slug.toLowerCase()) {
      case 'plumbing': return 'Plumbing & Water';
      case 'electric': return 'Electrical Work';
      case 'cleaning': return 'Cleaning & Maid';
      case 'it-tech':
      case 'it': return 'IT & Tech Support';
      case 'tutoring':
      case 'tutor': return 'Tutoring & Lessons';
      case 'transport': return 'Transport & Moving';
      case 'wellness': return 'Health & Wellness';
      case 'creative': return 'Painting & Design';
      default: return 'Service';
    }
  }

  bool _isProviderInCategory(dynamic provider, String catSlug) {
    if (catSlug == 'all') return true;
    final headline = provider.headline.toLowerCase();
    final about = provider.about.toLowerCase();
    final servicesText = provider.services.map((s) => s.name.toLowerCase()).join(' ');
    final combined = '$headline $about $servicesText';

    switch (catSlug.toLowerCase()) {
      case 'plumbing':
      case 'repairs':
        return combined.contains('plumb') ||
            combined.contains('pipe') ||
            combined.contains('leak') ||
            combined.contains('drain') ||
            combined.contains('water') ||
            combined.contains('sanitary') ||
            combined.contains('repair');
      case 'electric':
      case 'electrical':
        return combined.contains('electr') ||
            combined.contains('wire') ||
            combined.contains('circuit') ||
            combined.contains('breaker') ||
            combined.contains('light') ||
            combined.contains('power') ||
            combined.contains('solar') ||
            combined.contains('socket');
      case 'cleaning':
        return combined.contains('clean') ||
            combined.contains('maid') ||
            combined.contains('housekeep') ||
            combined.contains('sanitize') ||
            combined.contains('wash') ||
            combined.contains('scrub') ||
            combined.contains('carpet');
      case 'it-tech':
      case 'it':
      case 'tech':
        return combined.contains('it') ||
            combined.contains('tech') ||
            combined.contains('computer') ||
            combined.contains('laptop') ||
            combined.contains('screen') ||
            combined.contains('software') ||
            combined.contains('hardware') ||
            combined.contains('network') ||
            combined.contains('windows');
      case 'tutoring':
      case 'tutor':
        return combined.contains('tutor') ||
            combined.contains('teach') ||
            combined.contains('math') ||
            combined.contains('english') ||
            combined.contains('calculus') ||
            combined.contains('lesson') ||
            combined.contains('study') ||
            combined.contains('academic');
      case 'transport':
        return combined.contains('transport') ||
            combined.contains('move') ||
            combined.contains('driver') ||
            combined.contains('cargo') ||
            combined.contains('freight') ||
            combined.contains('truck') ||
            combined.contains('relocation');
      case 'wellness':
        return combined.contains('wellness') ||
            combined.contains('massage') ||
            combined.contains('fitness') ||
            combined.contains('trainer') ||
            combined.contains('gym') ||
            combined.contains('physio') ||
            combined.contains('health');
      case 'creative':
        return combined.contains('creative') ||
            combined.contains('paint') ||
            combined.contains('decor') ||
            combined.contains('interior') ||
            combined.contains('carpenter') ||
            combined.contains('wood') ||
            combined.contains('renovation') ||
            combined.contains('design');
      default:
        return combined.contains(catSlug.toLowerCase());
    }
  }

  @override
  Widget build(BuildContext context) {
    final providersAsync = ref.watch(providerListProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // CYAN SEARCH HEADER
            Container(
              color: const Color(0xFF7EC8E3),
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 14),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      if (context.canPop()) {
                        context.pop();
                      } else {
                        context.go('/home');
                      }
                    },
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 16),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _queryController,
                      onChanged: (_) => setState(() {}),
                      style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w600, fontSize: 13.5),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: Colors.white.withValues(alpha: 0.55),
                        prefixIcon: const Icon(Icons.search, color: Color(0xFF1E5F7A), size: 18),
                        suffixIcon: _queryController.text.isNotEmpty
                            ? GestureDetector(
                                onTap: () {
                                  _queryController.clear();
                                  setState(() {});
                                },
                                child: const Icon(Icons.clear_rounded, color: Color(0xFF1E5F7A), size: 16),
                              )
                            : null,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                        hintText: 'Search plumbers, electricians, tutors…',
                        hintStyle: const TextStyle(color: Color(0xFF1E5F7A), fontWeight: FontWeight.w500, fontSize: 13),
                        isDense: true,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 1. Categories Horizontal Row (All 8 categories)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildCategoryChip('all', 'All Services', icon: Icons.grid_view_rounded),
                    _buildCategoryChip('plumbing', 'Plumbing', icon: Icons.plumbing),
                    _buildCategoryChip('electric', 'Electric', icon: Icons.bolt_outlined),
                    _buildCategoryChip('cleaning', 'Cleaning', icon: Icons.cleaning_services_outlined),
                    _buildCategoryChip('it-tech', 'Tech & IT', icon: Icons.computer_outlined),
                    _buildCategoryChip('tutoring', 'Tutoring', icon: Icons.school_outlined),
                    _buildCategoryChip('transport', 'Transport', icon: Icons.directions_car_outlined),
                    _buildCategoryChip('wellness', 'Wellness', icon: Icons.spa_outlined),
                    _buildCategoryChip('creative', 'Painting & Design', icon: Icons.brush_outlined),
                  ],
                ),
              ),
            ),

            // 2. Filter Badges Row
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              decoration: const BoxDecoration(
                color: Color(0xFFF8FAFC),
                border: Border(
                  top: BorderSide(color: Color(0xFFE2E8F0)),
                  bottom: BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterBadge('all', 'Everything'),
                    _buildFilterBadge('verified', 'Verified Only', icon: Icons.verified),
                    _buildFilterBadge('nearby', 'Near Me (< 2 km)', icon: Icons.location_on_outlined),
                    _buildFilterBadge('toprated', '4.8+ Rated', icon: Icons.star_rounded),
                  ],
                ),
              ),
            ),

            // 3. Body with loading/error/results
            Expanded(
              child: providersAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0284C7)),
                ),
                error: (err, _) => Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.wifi_off_rounded, size: 48, color: Color(0xFF94A3B8)),
                        const SizedBox(height: 12),
                        const Text(
                          'Cannot load providers',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          err.toString(),
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () => ref.refresh(providerListProvider),
                          icon: const Icon(Icons.refresh, size: 16),
                          label: const Text('Try Again'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F172A),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                data: (sourceProviders) {
                  var filteredProviders = sourceProviders.where((p) {
                    if (_activeFilter == 'verified' && !p.verified) return false;
                    if (_activeFilter == 'nearby') {
                      double dist = double.tryParse(p.distance.split(' ')[0]) ?? 0;
                      if (dist >= 2.0) return false;
                    }
                    if (_activeFilter == 'toprated' && p.rating < 4.8) return false;

                    if (!_isProviderInCategory(p, _activeCategory)) {
                      return false;
                    }

                    if (_queryController.text.isNotEmpty) {
                      final query = _queryController.text.toLowerCase();
                      if (!p.name.toLowerCase().contains(query) &&
                          !p.headline.toLowerCase().contains(query) &&
                          !p.about.toLowerCase().contains(query)) {
                        return false;
                      }
                    }
                    return true;
                  }).toList();

                  // Sorting
                  if (_sortBy == 'rated') {
                    filteredProviders.sort((a, b) => b.rating.compareTo(a.rating));
                  } else if (_sortBy == 'near') {
                    filteredProviders.sort((a, b) {
                      double distA = double.tryParse(a.distance.split(' ')[0]) ?? 0;
                      double distB = double.tryParse(b.distance.split(' ')[0]) ?? 0;
                      return distA.compareTo(distB);
                    });
                  } else if (_sortBy == 'price') {
                    filteredProviders.sort((a, b) {
                      final priceA = int.tryParse(a.price.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
                      final priceB = int.tryParse(b.price.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
                      return priceA.compareTo(priceB);
                    });
                  }

                  final isCategoryEmpty = _activeCategory != 'all' && filteredProviders.isEmpty;

                  return Column(
                    children: [
                      // Results count & sort bar
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                        color: Colors.white,
                        child: Row(
                          children: [
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: '${filteredProviders.length}',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                                  ),
                                  TextSpan(
                                    text: _activeCategory != 'all'
                                        ? ' ${_getCategoryDisplayName(_activeCategory)} specialists'
                                        : ' verified specialists',
                                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                                  ),
                                ],
                              ),
                            ),
                            const Spacer(),
                            _buildSortBtn('Match', 'match'),
                            const SizedBox(width: 6),
                            _buildSortBtn('Distance', 'near'),
                            const SizedBox(width: 6),
                            _buildSortBtn('Rating', 'rated'),
                            const SizedBox(width: 6),
                            _buildSortBtn('Price', 'price'),
                          ],
                        ),
                      ),
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),

                      // Results list or empty state
                      Expanded(
                        child: filteredProviders.isEmpty
                            ? Container(
                                color: Colors.white,
                                padding: const EdgeInsets.all(32),
                                child: Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 64,
                                        height: 64,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF1F5F9),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        alignment: Alignment.center,
                                        child: Icon(
                                          isCategoryEmpty ? Icons.folder_open_rounded : Icons.search_off_rounded,
                                          size: 28,
                                          color: const Color(0xFF94A3B8),
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      Text(
                                        isCategoryEmpty
                                            ? 'No service providers in this category yet'
                                            : (_queryController.text.isNotEmpty
                                                ? 'No providers matching "${_queryController.text}"'
                                                : 'No matching providers found'),
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        isCategoryEmpty
                                            ? 'There are currently no verified ${_getCategoryDisplayName(_activeCategory)} specialists registered in your area.'
                                            : 'Try searching for another service, keyword, or clear your filters.',
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B), height: 1.4),
                                      ),
                                      const SizedBox(height: 18),
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF0F172A),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                        onPressed: () {
                                          setState(() {
                                            _queryController.clear();
                                            _activeFilter = 'all';
                                            _activeCategory = 'all';
                                          });
                                        },
                                        child: Text(
                                          isCategoryEmpty ? 'View All Service Providers' : 'Clear Filters',
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            : Container(
                                color: Colors.white,
                                child: ListView.builder(
                                  padding: const EdgeInsets.symmetric(vertical: 4),
                                  itemCount: filteredProviders.length,
                                  itemBuilder: (context, index) {
                                    final p = filteredProviders[index];
                                    return ProviderListTile(
                                      provider: p,
                                      onTap: () => context.push('/provider/${p.id}'),
                                    );
                                  },
                                ),
                              ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String id, String label, {IconData? icon}) {
    final isActive = _activeCategory == id;
    return GestureDetector(
      onTap: () => setState(() => _activeCategory = id),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF7EC8E3) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 13,
                color: isActive ? Colors.white : const Color(0xFF0284C7),
              ),
              const SizedBox(width: 5),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                color: isActive ? Colors.white : const Color(0xFF334155),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterBadge(String id, String label, {IconData? icon}) {
    final isActive = _activeFilter == id;
    return GestureDetector(
      onTap: () => setState(() => _activeFilter = id),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 10),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isActive ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 12,
                color: isActive ? Colors.white : (id == 'toprated' ? const Color(0xFFF59E0B) : const Color(0xFF0284C7)),
              ),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? Colors.white : const Color(0xFF475569),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSortBtn(String label, String id) {
    final isActive = _sortBy == id;
    return GestureDetector(
      onTap: () => setState(() => _sortBy = id),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10.5,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w600,
            color: isActive ? Colors.white : const Color(0xFF64748B),
          ),
        ),
      ),
    );
  }
}
