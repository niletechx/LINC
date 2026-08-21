import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/provider_model.dart';
import '../../providers/data_providers.dart';
import '../../services/message_service.dart';
import '../../services/review_service.dart';
import '../../providers/auth_provider.dart';

class ProviderProfileScreen extends ConsumerStatefulWidget {
  final dynamic providerId;
  const ProviderProfileScreen({super.key, required this.providerId});

  @override
  ConsumerState<ProviderProfileScreen> createState() => _ProviderProfileScreenState();
}

class _ProviderProfileScreenState extends ConsumerState<ProviderProfileScreen> {
  int? expandedService;
  List<dynamic> _reviews = [];
  bool _reviewsLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    try {
      final reviews = await ReviewService().getReviewsForEntity(
        'provider',
        widget.providerId.toString(),
      );
      if (mounted) setState(() { _reviews = reviews; _reviewsLoading = false; });
    } catch (_) {
      if (mounted) setState(() { _reviewsLoading = false; });
    }
  }

  Future<void> _startChatWithProvider(ProviderModel p) async {
    try {
      final user = ref.read(authProvider).user;
      final conv = await MessageService.instance.createOrGetConversation(
        currentUserId: user?.id ?? '1',
        participantType: 'provider',
        participantId: p.id.toString(),
      );
      if (mounted) {
        context.push('/dm/${conv.id}');
      }
    } catch (_) {
      if (mounted) {
        context.push('/dm/${p.id}');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final providerAsync = ref.watch(providerDetailProvider(widget.providerId.toString()));

    return providerAsync.when(
      loading: () => Scaffold(
        backgroundColor: const Color(0xFFF1F5F9),
        appBar: AppBar(
          backgroundColor: const Color(0xFF7EC8E3),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A)),
            onPressed: () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/home');
              }
            },
          ),
          title: const Text('Provider Profile', style: TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.w800)),
        ),
        body: const Center(
          child: CircularProgressIndicator(color: Color(0xFF7EC8E3)),
        ),
      ),
      error: (err, _) => Scaffold(
        backgroundColor: const Color(0xFFF1F5F9),
        appBar: AppBar(
          backgroundColor: const Color(0xFF7EC8E3),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A)),
            onPressed: () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/home');
              }
            },
          ),
          title: const Text('Provider Profile', style: TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.w800)),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.person_off_outlined, size: 48, color: Color(0xFF94A3B8)),
                const SizedBox(height: 12),
                const Text('Unable to load provider profile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                const SizedBox(height: 6),
                Text(err.toString(), textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                const SizedBox(height: 16),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white),
                  onPressed: () => ref.refresh(providerDetailProvider(widget.providerId.toString())),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
      data: (p) => Scaffold(
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
                    onTap: () => _startChatWithProvider(p),
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
                    onTap: () {
                      final authState = ref.read(authProvider);
                      if (!authState.isAuthed) {
                        context.go('/welcome');
                        return;
                      }
                      context.push('/booking/${p.id}');
                    },
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
      ),
    );
  }

  Widget _buildHero(ProviderModel p) {
    final topPadding = MediaQuery.of(context).padding.top;
    return Container(
      color: const Color(0xFF7EC8E3),
      padding: EdgeInsets.fromLTRB(16, topPadding + 8, 16, 20),
      child: Column(
        children: [
          // Top bar with Back Button, Share & Bookmark
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 18),
                ),
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Provider link copied to clipboard!'), duration: Duration(seconds: 2)),
                      );
                    },
                    child: Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.share_outlined, color: Color(0xFF0F172A), size: 18),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Saved to your favorites!'), duration: Duration(seconds: 2)),
                      );
                    },
                    child: Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.bookmark_border_rounded, color: Color(0xFF0F172A), size: 20),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
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
                              color: Color(0xFF065F46),
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
                                  onPressed: () => _startChatWithProvider(p),
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
                                  onPressed: () {
                                    final authState = ref.read(authProvider);
                                    if (!authState.isAuthed) {
                                      context.go('/welcome');
                                      return;
                                    }
                                    context.push('/booking/${p.id}');
                                  },
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
    final colors = [
      const Color(0xFF7C3AED),
      const Color(0xFF0891B2),
      const Color(0xFF059669),
      const Color(0xFFD97706),
      const Color(0xFF0284C7),
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
          if (_reviewsLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF7EC8E3))),
            )
          else if (_reviews.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.star_outline_rounded, size: 36, color: Color(0xFFCBD5E1)),
                    SizedBox(height: 8),
                    Text('No reviews yet', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF64748B))),
                    SizedBox(height: 4),
                    Text('Be the first to leave a review after your booking.', textAlign: TextAlign.center, style: TextStyle(fontSize: 11.5, color: Color(0xFF94A3B8))),
                  ],
                ),
              ),
            )
          else
            ..._reviews.asMap().entries.map((e) {
              final idx = e.key;
              final rev = e.value as Map<String, dynamic>;
              final isLast = idx == _reviews.length - 1;
              final reviewerName = rev['users']?['full_name'] ?? rev['reviewer_name'] ?? 'Verified Client';
              final initials = reviewerName.isNotEmpty ? reviewerName.substring(0, 1).toUpperCase() : 'V';
              final stars = (rev['rating'] as num?)?.toInt() ?? 5;
              final comment = rev['comment'] as String? ?? '';
              final date = rev['created_at'] != null
                  ? _formatDate(rev['created_at'] as String)
                  : '';
              final avatarColor = colors[idx % colors.length];

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
                        color: avatarColor,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Row(
                                  children: [
                                    Text(reviewerName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                                    const SizedBox(width: 4),
                                    Container(
                                      width: 12, height: 12,
                                      decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                                      alignment: Alignment.center,
                                      child: const Icon(Icons.check, color: Colors.white, size: 8),
                                    ),
                                  ],
                                ),
                              ),
                              Text(date, style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8))),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: List.generate(5, (starIdx) {
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
                          if (comment.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(
                              comment,
                              style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569), height: 1.55),
                            ),
                          ],
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

  String _formatDate(String isoDate) {
    try {
      final dt = DateTime.parse(isoDate);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return '${months[dt.month - 1]} ${dt.day}';
    } catch (_) {
      return '';
    }
  }
}
