import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/mock_data.dart';
import '../../widgets/provider_card.dart';
import '../../providers/data_providers.dart';

class SearchScreen extends ConsumerStatefulWidget {
  final String? initialQuery;
  final String? initialCategory;
  const SearchScreen({super.key, this.initialQuery, this.initialCategory});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  late final TextEditingController _queryController;
  String _activeFilter = 'all';
  late String _activeCategory;
  String _sortBy = 'match';

  @override
  void initState() {
    super.initState();
    _queryController = TextEditingController(text: widget.initialQuery ?? '');
    _activeCategory = widget.initialCategory ?? 'all';
  }

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final providersAsync = ref.watch(providerListProvider);
    final sourceProviders = (providersAsync.value != null && providersAsync.value!.isNotEmpty)
        ? providersAsync.value!
        : MockData.allProviders;

    var filteredProviders = sourceProviders.where((p) {
      if (_activeFilter == 'verified' && !p.verified) return false;
      if (_activeFilter == 'nearby') {
        double dist = double.tryParse(p.distance.split(' ')[0]) ?? 0;
        if (dist >= 2.0) return false;
      }
      if (_activeFilter == 'toprated' && p.rating < 4.8) return false;

      if (_activeCategory != 'all') {
        final headline = p.headline.toLowerCase();
        final about = p.about.toLowerCase();
        if (!headline.contains(_activeCategory.toLowerCase()) && !about.contains(_activeCategory.toLowerCase())) {
          return false;
        }
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

            // 1. Categories Horizontal Row
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildCategoryChip('all', 'All Services'),
                    _buildCategoryChip('plumbing', '🔧 Plumbing'),
                    _buildCategoryChip('electric', '⚡ Electric'),
                    _buildCategoryChip('cleaning', '🧹 Cleaning'),
                    _buildCategoryChip('it', '💻 Tech & IT'),
                    _buildCategoryChip('tutor', '📚 Tutoring'),
                    _buildCategoryChip('transport', '🚗 Transport'),
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
                    _buildFilterBadge('verified', '🛡️ Verified Only'),
                    _buildFilterBadge('nearby', '📍 Near Me (< 2 km)'),
                    _buildFilterBadge('toprated', '★ 4.8+ Rated'),
                  ],
                ),
              ),
            ),

            // 3. Results Count & Sorting bar
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
                        const TextSpan(
                          text: ' verified specialists',
                          style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
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

            // 4. Expanded Results List or Empty State
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
                              child: const Text('🔍', style: TextStyle(fontSize: 28)),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'No matching providers found',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Try searching for another service, keyword, or clear your filters.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B), height: 1.4),
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
                              child: const Text('Clear Filters', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
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
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String id, String label) {
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
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
            color: isActive ? Colors.white : const Color(0xFF334155),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterBadge(String id, String label) {
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
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            color: isActive ? Colors.white : const Color(0xFF475569),
          ),
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
