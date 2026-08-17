import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/chat_message_model.dart';
import '../../models/provider_model.dart';
import '../../providers/ai_provider.dart';
import '../../widgets/formatted_markdown_text.dart';

class AiScreen extends ConsumerStatefulWidget {
  const AiScreen({super.key});

  @override
  ConsumerState<AiScreen> createState() => _AiScreenState();
}

class _AiScreenState extends ConsumerState<AiScreen> with SingleTickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _textController = TextEditingController();
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _textController.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent + 80,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final aiState = ref.watch(aiChatProvider);

    ref.listen(aiChatProvider, (previous, next) {
      if (previous?.messages.length != next.messages.length || (previous?.loading != next.loading)) {
        _scrollToBottom();
      }
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // ── TOP HEADER BAR ──────────────────────────────────────────
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
              decoration: const BoxDecoration(
                color: Color(0xFF7EC8E3),
                boxShadow: [
                  BoxShadow(
                    color: Color(0x0D000000),
                    blurRadius: 8,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: const Text('✨', style: TextStyle(fontSize: 18)),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'LINC AI Assistant',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F172A),
                              letterSpacing: -0.2,
                            ),
                          ),
                          SizedBox(width: 6),
                          Icon(Icons.verified, size: 14, color: Color(0xFF0F172A)),
                        ],
                      ),
                      Text(
                        'Powered by Gemini 3.6 & Supabase RAG',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1E5F7A),
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF0F172A).withValues(alpha: 0.2)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFF10B981),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 5),
                        const Text(
                          'LIVE',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                            letterSpacing: 0.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // ── CHAT MESSAGES CANVAS ─────────────────────────────────────
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                itemCount: aiState.messages.length + (aiState.loading ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index == aiState.messages.length && aiState.loading) {
                    return _buildLoadingIndicator();
                  }
                  final msg = aiState.messages[index];
                  if (msg.role == MessageRole.ai) {
                    return _buildAiMessage(msg);
                  } else {
                    return _buildUserMessage(msg);
                  }
                },
              ),
            ),

            // ── SUGGESTIONS QUICK BAR ────────────────────────────────────
            _buildSuggestionsRow(),

            // ── BOTTOM INPUT BAR ─────────────────────────────────────────
            _buildInputBar(),
          ],
        ),
      ),
    );
  }

  // ── AI MESSAGE CARD ────────────────────────────────────────────────────────
  Widget _buildAiMessage(ChatMessage msg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // AI Icon Avatar
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF7EC8E3), Color(0xFF0284C7)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0284C7).withValues(alpha: 0.25),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            alignment: Alignment.center,
            child: const Text('✨', style: TextStyle(fontSize: 15)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Speech Bubble
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(4),
                      topRight: Radius.circular(16),
                      bottomLeft: Radius.circular(16),
                      bottomRight: Radius.circular(16),
                    ),
                    border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x08000000),
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: FormattedMarkdownText(
                    text: msg.text,
                    baseStyle: const TextStyle(
                      fontSize: 14.5,
                      height: 1.45,
                      color: Color(0xFF1E293B),
                      fontWeight: FontWeight.w400,
                    ),
                    boldColor: const Color(0xFF0F172A),
                  ),
                ),

                // Providers Matches if any
                if (msg.hasProviders) ...[
                  const SizedBox(height: 12),
                  const Padding(
                    padding: EdgeInsets.only(left: 4, bottom: 8),
                    child: Row(
                      children: [
                        Icon(Icons.hub_rounded, size: 14, color: Color(0xFF0284C7)),
                        SizedBox(width: 6),
                        Text(
                          'Top Recommended Providers',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF0369A1),
                            letterSpacing: 0.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (msg.providers != null && msg.providers!.isNotEmpty)
                    ...msg.providers!.take(3).map((p) => _buildProviderCard(p))
                  else
                    ..._buildDefaultProviderCards(),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── USER MESSAGE BUBBLE ───────────────────────────────────────────────────
  Widget _buildUserMessage(ChatMessage msg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.76,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(4),
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.15),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              msg.text,
              style: const TextStyle(
                fontSize: 14.5,
                height: 1.4,
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: const Color(0xFF7EC8E3),
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.person, color: Color(0xFF0F172A), size: 16),
          ),
        ],
      ),
    );
  }

  // ── PROVIDER MATCH CARD ───────────────────────────────────────────────────
  Widget _buildProviderCard(dynamic provider) {
    String name = 'Samuel Girma';
    String headline = 'Master Plumber & Pipe Specialist';
    String rating = '4.9';
    String reviews = '38';
    String location = 'Bole, Addis Ababa';
    String price = '350 ETB/hr';
    String id = '1';

    if (provider is ProviderModel) {
      name = provider.name;
      headline = provider.headline;
      rating = provider.rating.toString();
      reviews = provider.reviews.toString();
      location = provider.distance;
      price = provider.price;
      id = provider.id.toString();
    } else if (provider is Map) {
      name = provider['name']?.toString() ?? 'Samuel Girma';
      headline = provider['headline']?.toString() ?? 'Verified Provider';
      rating = provider['avg_rating']?.toString() ?? '4.9';
      reviews = provider['total_reviews']?.toString() ?? '38';
      location = provider['location_city']?.toString() ?? 'Addis Ababa';
      price = '${provider['hourly_rate'] ?? 300} ${provider['currency'] ?? 'ETB'}/hr';
      id = provider['id']?.toString() ?? '1';
    }

    final initial = name.isNotEmpty ? name.substring(0, 1).toUpperCase() : 'P';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar with Verified badge
                Stack(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0284C7), Color(0xFF0369A1)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        initial,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: -1,
                      right: -1,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check_circle, size: 14, color: Color(0xFF0284C7)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 12),
                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        headline,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF64748B),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 16),
                          const SizedBox(width: 2),
                          Text(
                            rating,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          Text(
                            ' ($reviews)',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                          ),
                          const SizedBox(width: 10),
                          const Icon(Icons.location_on_outlined, size: 13, color: Color(0xFF94A3B8)),
                          const SizedBox(width: 2),
                          Expanded(
                            child: Text(
                              location,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Price
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0F9FF),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFBAE6FD)),
                  ),
                  child: Text(
                    price,
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0369A1),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => context.push('/booking/$id'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      color: Color(0xFF0F172A),
                      borderRadius: BorderRadius.only(bottomLeft: Radius.circular(13)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.bolt, color: Color(0xFF7EC8E3), size: 16),
                        SizedBox(width: 4),
                        Text(
                          'Book Now',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: InkWell(
                  onTap: () => context.push('/provider/$id'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.only(bottomRight: Radius.circular(13)),
                    ),
                    child: const Text(
                      'View Profile',
                      style: TextStyle(
                        color: Color(0xFF334155),
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDefaultProviderCards() {
    return [
      _buildProviderCard({
        'name': 'Samuel Girma',
        'headline': 'Master Plumber & Pipe Specialist',
        'avg_rating': 4.9,
        'total_reviews': 38,
        'location_city': 'Bole, Addis Ababa',
        'hourly_rate': 350,
        'currency': 'ETB',
        'id': '1',
      }),
      _buildProviderCard({
        'name': 'Helen Tadesse',
        'headline': 'Professional Home & Office Cleaner',
        'avg_rating': 5.0,
        'total_reviews': 52,
        'location_city': 'Kazanchis, Addis Ababa',
        'hourly_rate': 280,
        'currency': 'ETB',
        'id': '2',
      }),
    ];
  }

  // ── TYPING / THINKING INDICATOR ───────────────────────────────────────────
  Widget _buildLoadingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF7EC8E3), Color(0xFF0284C7)],
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: const Text('✨', style: TextStyle(fontSize: 15)),
          ),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0284C7)),
                  ),
                ),
                const SizedBox(width: 10),
                const Text(
                  'LINC AI is searching database...',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── SUGGESTIONS ROW ───────────────────────────────────────────────────────
  Widget _buildSuggestionsRow() {
    final suggestions = [
      '🔧 Emergency plumber in Bole',
      '💻 Laptop screen repair',
      '🧹 3-Bedroom house cleaning',
      '📚 High school math tutor',
      '⚡ Electrician for wiring',
    ];

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: Row(
          children: suggestions.map((s) {
            return GestureDetector(
              onTap: () {
                _textController.text = s;
                ref.read(aiChatProvider.notifier).sendPrompt(s);
                _textController.clear();
              },
              child: Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  border: Border.all(color: const Color(0xFFCBD5E1), width: 1.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  s,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF334155),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // ── INPUT BAR ─────────────────────────────────────────────────────────────
  Widget _buildInputBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            border: Border.all(color: const Color(0xFFCBD5E1), width: 1.4),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _textController,
                  onSubmitted: (val) {
                    if (val.trim().isNotEmpty) {
                      ref.read(aiChatProvider.notifier).setInput(val);
                      ref.read(aiChatProvider.notifier).send();
                      _textController.clear();
                    }
                  },
                  onChanged: (val) => ref.read(aiChatProvider.notifier).setInput(val),
                  style: const TextStyle(fontSize: 14, color: Color(0xFF0F172A)),
                  decoration: const InputDecoration(
                    hintText: 'Describe what you need in plain text...',
                    hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 13.5),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.fromLTRB(16, 12, 10, 12),
                    isDense: true,
                  ),
                ),
              ),
              GestureDetector(
                onTap: () {
                  final text = _textController.text;
                  if (text.trim().isNotEmpty) {
                    ref.read(aiChatProvider.notifier).setInput(text);
                    ref.read(aiChatProvider.notifier).send();
                    _textController.clear();
                  }
                },
                child: Container(
                  width: 40,
                  height: 40,
                  margin: const EdgeInsets.only(right: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.25),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.arrow_upward_rounded, color: Color(0xFF7EC8E3), size: 18),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
