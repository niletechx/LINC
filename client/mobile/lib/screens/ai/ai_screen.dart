import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/chat_message_model.dart';
import '../../models/provider_model.dart';
import '../../providers/ai_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/formatted_markdown_text.dart';

class AiScreen extends ConsumerStatefulWidget {
  const AiScreen({super.key});

  @override
  ConsumerState<AiScreen> createState() => _AiScreenState();
}

class _AiScreenState extends ConsumerState<AiScreen> with SingleTickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _textController = TextEditingController();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
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
          _scrollController.position.maxScrollExtent + 120,
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
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: _buildSessionsDrawer(aiState),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // ── TOP HEADER BAR WITH SESSIONS & NEW CHAT ─────────────────
            Container(
              padding: const EdgeInsets.fromLTRB(12, 10, 14, 12),
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
                  // History Drawer Toggle
                  IconButton(
                    icon: const Icon(Icons.history_rounded, color: Color(0xFF0F172A), size: 24),
                    onPressed: () {
                      ref.read(aiChatProvider.notifier).loadSessions();
                      _scaffoldKey.currentState?.openDrawer();
                    },
                    tooltip: 'Chat History',
                  ),
                  const SizedBox(width: 4),
                  // App Title & Active Session
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Text(
                              'LINC AI Advisor',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0F172A),
                                letterSpacing: -0.2,
                              ),
                            ),
                            SizedBox(width: 5),
                            Icon(Icons.verified, size: 14, color: Color(0xFF0F172A)),
                          ],
                        ),
                        Text(
                          aiState.activeTitle ?? 'New Session',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1E5F7A),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // New Chat Button
                  InkWell(
                    onTap: () => ref.read(aiChatProvider.notifier).startNewSession(),
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.15),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add, color: Color(0xFF7EC8E3), size: 16),
                          SizedBox(width: 4),
                          Text(
                            'New Chat',
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
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

  // ── SESSIONS HISTORY DRAWER ────────────────────────────────────────────────
  Widget _buildSessionsDrawer(AIChatState aiState) {
    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Drawer Header
            Container(
              padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
              decoration: const BoxDecoration(
                color: Color(0xFF0F172A),
                border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFF7EC8E3),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.forum_rounded, color: Color(0xFF0F172A), size: 18),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Chat Sessions',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            // New Chat Action in Drawer
            Padding(
              padding: const EdgeInsets.all(12),
              child: InkWell(
                onTap: () {
                  ref.read(aiChatProvider.notifier).startNewSession();
                  Navigator.pop(context);
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.add_comment_rounded, color: Color(0xFF0284C7), size: 18),
                      SizedBox(width: 10),
                      Text(
                        'Start New Chat Session',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Text(
                'PREVIOUS SESSIONS',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF94A3B8),
                  letterSpacing: 0.5,
                ),
              ),
            ),

            // Sessions List
            Expanded(
              child: aiState.conversations.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.chat_bubble_outline_rounded, size: 36, color: Colors.grey.shade400),
                          const SizedBox(height: 8),
                          Text('No past sessions yet', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: aiState.conversations.length,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      itemBuilder: (context, idx) {
                        final s = aiState.conversations[idx];
                        final String id = s['id'].toString();
                        final String title = s['title']?.toString() ?? 'Session';
                        final isCurrent = aiState.conversationId == id;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          decoration: BoxDecoration(
                            color: isCurrent ? const Color(0xFFE0F2FE) : const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isCurrent ? const Color(0xFF38BDF8) : const Color(0xFFE2E8F0),
                              width: 1.2,
                            ),
                          ),
                          child: ListTile(
                            dense: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                            leading: Icon(
                              isCurrent ? Icons.chat_bubble : Icons.chat_bubble_outline,
                              color: isCurrent ? const Color(0xFF0284C7) : const Color(0xFF64748B),
                              size: 18,
                            ),
                            title: Text(
                              title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: isCurrent ? FontWeight.w800 : FontWeight.w600,
                                color: isCurrent ? const Color(0xFF0369A1) : const Color(0xFF1E293B),
                              ),
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete_outline, size: 16, color: Color(0xFF94A3B8)),
                              onPressed: () => ref.read(aiChatProvider.notifier).deleteSession(id),
                              tooltip: 'Delete session',
                            ),
                            onTap: () {
                              ref.read(aiChatProvider.notifier).switchSession(s);
                              Navigator.pop(context);
                            },
                          ),
                        );
                      },
                    ),
            ),
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
                      fontSize: 14,
                      height: 1.45,
                      color: Color(0xFF1E293B),
                      fontWeight: FontWeight.w400,
                    ),
                    boldColor: const Color(0xFF0F172A),
                  ),
                ),

                // Multi-Candidate Interactive Cards (Up to 10)
                if (msg.hasProviders && msg.providers != null && msg.providers!.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 8),
                    child: Row(
                      children: [
                        const Icon(Icons.tune_rounded, size: 15, color: Color(0xFF0284C7)),
                        const SizedBox(width: 6),
                        Text(
                          'Matching Service Providers (${msg.providers!.length.clamp(1, 10)})',
                          style: const TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0369A1),
                            letterSpacing: 0.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                  ...msg.providers!.take(10).map((p) => _buildProviderCard(p)),
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
                fontSize: 14,
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

  // ── PROVIDER MATCH CARD (UP TO 10) ─────────────────────────────────────────
  Widget _buildProviderCard(dynamic provider) {
    String name = 'Samuel Girma';
    String username = 'samuel_plumbing';
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
      username = provider['username']?.toString() ?? name.toLowerCase().replaceAll(' ', '_');
      headline = provider['headline']?.toString() ?? 'Verified Provider';
      rating = provider['avg_rating']?.toString() ?? '4.9';
      reviews = provider['total_reviews']?.toString() ?? '38';
      location = provider['location_city']?.toString() ?? 'Addis Ababa';
      price = '${provider['hourly_rate'] ?? 300} ${provider['currency'] ?? 'ETB'}/hr';
      id = provider['id']?.toString() ?? '1';
    }

    final initial = name.isNotEmpty ? name.substring(0, 1).toUpperCase() : 'P';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              name,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                          ),
                          Text(
                            '@$username',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF0284C7),
                            ),
                          ),
                        ],
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
              ],
            ),
          ),

          // Price & Ask AI Chip Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              border: Border(
                top: BorderSide(color: Color(0xFFF1F5F9)),
                bottom: BorderSide(color: Color(0xFFF1F5F9)),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0F9FF),
                    borderRadius: BorderRadius.circular(6),
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
                const Spacer(),
                // @Ask AI Chip
                InkWell(
                  onTap: () {
                    final prompt = 'Tell me more about @$username: what do his past reviews say and is he trustworthy?';
                    _textController.text = prompt;
                    ref.read(aiChatProvider.notifier).sendPrompt(prompt);
                    _textController.clear();
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFBFDBFE)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('✨', style: TextStyle(fontSize: 11)),
                        const SizedBox(width: 4),
                        Text(
                          'Ask AI about @$username',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF1D4ED8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () {
                    final authState = ref.read(authProvider);
                    if (!authState.isAuthed) {
                      context.go('/welcome');
                      return;
                    }
                    context.push('/booking/$id');
                  },
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
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0284C7)),
                  ),
                ),
                SizedBox(width: 10),
                Text(
                  'LINC AI Advisor is analyzing database & reviews...',
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
      '🔧 Plumbers in Bole',
      '💬 Review for @samuel_plumbing',
      '🧹 House cleaning in Kazanchis',
      '💬 Review for @helen_clean',
      '💻 Laptop repair @dawit_tech',
      '⚡ Electrician @abebe_electric',
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
                    hintText: 'Ask for services or type @username to consult...',
                    hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
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
