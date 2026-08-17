import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../config/text_styles.dart';
import '../../data/mock_data.dart';
import '../../widgets/provider_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _queryController = TextEditingController();
  String _activeFilter = 'all';
  String _sortBy = 'match'; // best, near, rated

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Filter providers
    var filteredProviders = MockData.allProviders.where((p) {
      if (_activeFilter == 'verified' && !p.verified) return false;
      if (_activeFilter == 'nearby') {
        double dist = double.tryParse(p.distance.split(' ')[0]) ?? 0;
        if (dist >= 2) return false;
      }
      if (_activeFilter == 'toprated' && p.rating < 4.8) return false;
      
      // Simple text filter
      if (_queryController.text.isNotEmpty) {
        final query = _queryController.text.toLowerCase();
        if (!p.name.toLowerCase().contains(query) && !p.headline.toLowerCase().contains(query)) {
          return false;
        }
      }
      return true;
    }).toList();

    // Sorting mock
    if (_sortBy == 'rated') {
      filteredProviders.sort((a, b) => b.rating.compareTo(a.rating));
    } else if (_sortBy == 'near') {
      filteredProviders.sort((a, b) {
        double distA = double.tryParse(a.distance.split(' ')[0]) ?? 0;
        double distB = double.tryParse(b.distance.split(' ')[0]) ?? 0;
        return distA.compareTo(distB);
      });
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // AppColors.appBackground
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // CYAN HEADER
            Container(
              color: const Color(0xFF7EC8E3), // AppColors.headerBg
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
                    child: const Icon(Icons.chevron_left, color: Color(0xFF1E5F7A), size: 28),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _queryController,
                      onChanged: (_) => setState(() {}),
                      style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w600, fontSize: 13.5),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: Colors.white.withValues(alpha: 0.45),
                        prefixIcon: const Icon(Icons.search, color: Color(0xFF1E5F7A), size: 18),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 11, horizontal: 14),
                        hintText: 'Search providers, services…',
                        hintStyle: const TextStyle(color: Color(0xFF1E5F7A), fontWeight: FontWeight.w500, fontSize: 13),
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: () {},
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.40),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.60)),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.tune_rounded, color: Color(0xFF1E5F7A), size: 16),
                    ),
                  ),
                ],
              ),
            ),

            // 1. Filter Chips
            Container(
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('all', 'All'),
                    _buildFilterChip('verified', '🛡️ Verified'),
                    _buildFilterChip('nearby', '📍 < 2 km'),
                    _buildFilterChip('toprated', '★ 4.8+'),
                    _buildFilterChip('available', '⚡ Available now'),
                  ],
                ),
              ),
            ),

            // 2. Sort + count bar
            Container(
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: Row(
                children: [
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: '${filteredProviders.length}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const TextSpan(
                          text: ' results',
                          style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  _buildSortBtn('Best', 'match'),
                  const SizedBox(width: 6),
                  _buildSortBtn('Near', 'near'),
                  const SizedBox(width: 6),
                  _buildSortBtn('Rated', 'rated'),
                ],
              ),
            ),

            // 3. Expanded results list
            Expanded(
              child: Container(
                color: Colors.white,
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8),
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

  Widget _buildFilterChip(String id, String label) {
    final isActive = _activeFilter == id;
    return GestureDetector(
      onTap: () => setState(() => _activeFilter = id),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 13),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
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
        padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 10),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF7EC8E3) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(7),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w600,
            color: isActive ? Colors.white : const Color(0xFF64748B),
          ),
        ),
      ),
    );
  }
}
