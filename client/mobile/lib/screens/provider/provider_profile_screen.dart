import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/mock_data.dart';
import '../../models/provider_model.dart';
import '../../providers/data_providers.dart';

class ProviderProfileScreen extends ConsumerStatefulWidget {
  final int providerId;
  const ProviderProfileScreen({super.key, required this.providerId});

  @override
  ConsumerState<ProviderProfileScreen> createState() => _ProviderProfileScreenState();
}

class _ProviderProfileScreenState extends ConsumerState<ProviderProfileScreen> {
  int? expandedService;

  @override
  Widget build(BuildContext context) {
    final providersAsync = ref.watch(providerListProvider);
    final sourceList = (providersAsync.value != null && providersAsync.value!.isNotEmpty)
        ? providersAsync.value!
        : MockData.providers;
    final p = sourceList.firstWhere(
      (prov) => prov.id == widget.providerId,
      orElse: () => sourceList.first,
    );

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                flex: 1,
                child: InkWell(
                  onTap: () => context.push('/dm/1'),
                  child: Container(
                    height: 50,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      border: Border(right: BorderSide(color: Color(0xFFF1F5F9))),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'Message',
                      style: TextStyle(
                        color: Color(0xFF334155),
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                flex: 2,
                child: InkWell(
                  onTap: () => context.push('/booking/${p.id}'),
                  child: Container(
                    height: 50,
                    color: const Color(0xFF0F172A),
                    alignment: Alignment.center,
                    child: Text(
                      'Book Now · ${p.price}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Column(
              children: [
                _buildHero(p),
                _buildStats(p),
                _buildAbout(p),
                _buildServices(p),
                _buildReviews(p),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHero(ProviderModel p) {
    return Container(
      color: const Color(0xFF7EC8E3),
      padding: EdgeInsets.fromLTRB(24, MediaQuery.of(context).padding.top + 20, 24, 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 66,
            height: 66,
            decoration: BoxDecoration(
              color: p.color,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withValues(alpha: 0.12), width: 2.5),
            ),
            alignment: Alignment.center,
            child: Text(
              p.name.substring(0, 1),
              style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  p.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.02,
                  ),
                ),
                Text(
                  p.headline,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF1E5F7A),
                  ),
                ),
                const SizedBox(height: 9),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.25)),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        '🛡️ VERIFIED',
                        style: TextStyle(
                          color: Color(0xFFF59E0B),
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.12),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.20)),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '⚡ ${p.response}',
                        style: const TextStyle(
                          color: Color(0xFF34D399),
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
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
    );
  }

  Widget _buildStats(ProviderModel p) {
    return Container(
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
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('★ ${p.rating}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFFF59E0B))),
                    Text('${p.reviews} reviews', style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8))),
                  ],
                ),
              ),
            ),
            const VerticalDivider(width: 1, color: Color(0xFFE2E8F0)),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('${p.jobs}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                    const Text('completed', style: TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8))),
                  ],
                ),
              ),
            ),
            const VerticalDivider(width: 1, color: Color(0xFFE2E8F0)),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(p.distance, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                    const Text('from you', style: TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8))),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAbout(ProviderModel p) {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
      margin: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('About', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
          const SizedBox(height: 8),
          Text(
            p.about,
            style: const TextStyle(fontSize: 13, color: Color(0xFF475569), height: 1.65),
          ),
        ],
      ),
    );
  }

  Widget _buildServices(ProviderModel p) {
    return Container(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            width: double.infinity,
            child: const Text('Services Offered', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
          ),
          ...List.generate(p.services.length, (i) {
            final service = p.services[i];
            final isExpanded = expandedService == i;
            final isLast = i == p.services.length - 1;

            return GestureDetector(
              onTap: () {
                setState(() {
                  expandedService = isExpanded ? null : i;
                });
              },
              child: Container(
                decoration: BoxDecoration(
                  color: isExpanded ? const Color(0xFFFAFBFF) : Colors.white,
                  border: Border(
                    bottom: (!isLast && !isExpanded)
                        ? const BorderSide(color: Color(0xFFE2E8F0))
                        : BorderSide.none,
                  ),
                ),
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(service.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                                const SizedBox(height: 4),
                                Wrap(
                                  spacing: 4,
                                  runSpacing: 4,
                                  children: service.tags.map((tag) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF1F5F9),
                                      borderRadius: BorderRadius.circular(5),
                                    ),
                                    child: Text(tag, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF64748B))),
                                  )).toList(),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(service.price, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF7EC8E3))),
                              Text(service.duration, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                            ],
                          ),
                        ],
                      ),
                    ),
                    if (isExpanded)
                      Container(
                        decoration: const BoxDecoration(
                          border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
                        ),
                        child: IntrinsicHeight(
                          child: Row(
                            children: [
                              Expanded(
                                child: TextButton(
                                  onPressed: () {},
                                  child: const Text('Ask a Question', style: TextStyle(color: Color(0xFF475569))),
                                ),
                              ),
                              const VerticalDivider(width: 1, color: Color(0xFFF1F5F9)),
                              Expanded(
                                child: TextButton(
                                  style: TextButton.styleFrom(
                                    backgroundColor: const Color(0xFF0F172A),
                                    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                                  ),
                                  onPressed: () => context.push('/booking/${p.id}'),
                                  child: const Text('Book This', style: TextStyle(color: Colors.white)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildReviews(ProviderModel p) {
    final reviews = [
      {'name':'Mekdes A.','initials':'MA','color':const Color(0xFF7C3AED),'stars':5,'text':'Incredibly professional. Fixed our leak in under an hour and cleaned up after himself.','date':'Aug 3','verified':true},
      {'name':'Yared G.','initials':'YG','color':const Color(0xFF0891B2),'stars':5,'text':'Fast response, fair price, quality work. Will definitely call again.','date':'Jul 19','verified':true},
      {'name':'Tigist B.','initials':'TB','color':const Color(0xFF059669),'stars':4,'text':'Good work overall. Came on time and was very honest about what needed repair vs replacement.','date':'Jun 28','verified':false},
    ];

    return Container(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 8),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0)))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Reviews', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                Text('★ ${p.rating} · ${p.reviews} total', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFFF59E0B))),
              ],
            ),
          ),
          ...reviews.asMap().entries.map((e) {
            final idx = e.key;
            final rev = e.value;
            final isLast = idx == reviews.length - 1;

            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                border: Border(
                  bottom: isLast ? BorderSide.none : const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: rev['color'] as Color,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text(rev['initials'] as String, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(rev['name'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                            if (rev['verified'] as bool) ...[
                              const SizedBox(width: 4),
                              Container(
                                width: 12, height: 12,
                                decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                                alignment: Alignment.center,
                                child: const Icon(Icons.check, color: Colors.white, size: 8),
                              ),
                            ],
                            const Spacer(),
                            Text(rev['date'] as String, style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8))),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: List.generate(5, (starIdx) {
                            final stars = rev['stars'] as int;
                            return Text(
                              '★',
                              style: TextStyle(
                                color: starIdx < stars ? const Color(0xFFF59E0B) : const Color(0xFFE2E8F0),
                                fontSize: 11.5,
                                letterSpacing: 0.04,
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          rev['text'] as String,
                          style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569), height: 1.55),
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
  }
}
