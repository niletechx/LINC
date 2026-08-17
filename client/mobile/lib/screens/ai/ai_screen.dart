import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../config/text_styles.dart';
import '../../data/mock_data.dart';
import '../../providers/ai_provider.dart';
import '../../models/chat_message_model.dart';
import '../../models/provider_model.dart';
import '../../widgets/provider_card.dart';

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
      duration: const Duration(milliseconds: 600),
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
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final aiState = ref.watch(aiChatProvider);

    // Auto-scroll when messages change
    ref.listen(aiChatProvider, (previous, next) {
      if (previous?.messages.length != next.messages.length || (previous?.loading != next.loading)) {
        _scrollToBottom();
      }
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // AppColors.appBackground
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
          // ── AI Header ──────────────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
            decoration: const BoxDecoration(
              color: Color(0xFF7EC8E3),
              border: Border(bottom: BorderSide(color: Color(0x1A000000))),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Center(child: Text('✨', style: TextStyle(fontSize: 16))),
                ),
                const SizedBox(width: 10),
                const Text(
                  'LINC AI',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0x200F172A),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0x330F172A)),
                  ),
                  child: const Text('BETA', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: 0.5)),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
              itemCount: aiState.messages.length + (aiState.loading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == aiState.messages.length && aiState.loading) {
                  return _buildLoadingIndicator();
                }
                final msg = aiState.messages[index];
                if (msg.role == 'ai') {
                  return _buildAiMessage(msg);
                } else {
                  return _buildUserMessage(msg);
                }
              },
            ),
          ),
          _buildSuggestionsRow(),
          _buildInputBar(),
        ],
      ),
      ),
    );
  }

  Widget _buildAiMessage(ChatMessage msg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(9),
              gradient: const LinearGradient(
                colors: [Color(0xFF7EC8E3), Color(0xFF06B6D4)],
              ),
            ),
            alignment: Alignment.center,
            child: const Text('✨', style: TextStyle(fontSize: 12)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.82,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(3),
                      topRight: Radius.circular(14),
                      bottomLeft: Radius.circular(14),
                      bottomRight: Radius.circular(14),
                    ),
                    border: Border.fromBorderSide(BorderSide(color: Color(0xFFE2E8F0))),
                  ),
                  child: Text(
                    msg.text,
                    style: const TextStyle(fontSize: 14, color: Color(0xFF0F172A)),
                  ),
                ),
                if (msg.hasProviders) ...[
                  const SizedBox(height: 8),
                  if (msg.providers != null && msg.providers!.isNotEmpty)
                    ...msg.providers!.take(3).map((p) => _buildProviderCard(p))
                  else
                    ...MockData.providers.take(2).map((p) => _buildProviderCard(p)),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProviderCard(dynamic provider) {
    String name = 'Samuel Girma';
    String headline = 'Plumber';
    String rating = '4.9';
    String distance = '2.4 km';
    String price = '350 ETB/hr';
    String id = '1';
    Color color = const Color(0xFF0284C7);

    if (provider is ProviderModel) {
      name = provider.name;
      headline = provider.headline;
      rating = provider.rating.toString();
      distance = provider.distance;
      price = provider.price;
      id = provider.id.toString();
      color = provider.color;
    } else if (provider is Map) {
      name = provider['name']?.toString() ?? 'Verified Provider';
      headline = provider['headline']?.toString() ?? 'Professional Service';
      rating = provider['avg_rating']?.toString() ?? '4.9';
      distance = provider['location_city']?.toString() ?? 'Addis Ababa';
      price = '${provider['hourly_rate'] ?? 300} ${provider['currency'] ?? 'ETB'}/hr';
      id = provider['id']?.toString() ?? '1';
    }

    return Container(
      margin: const EdgeInsets.only(left: 36, bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(13),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    name.isNotEmpty ? name.substring(0, 1) : 'P',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        headline,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF64748B),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
            ),
            child: Row(
              children: [
                Text(
                  '★ $rating',
                  style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4),
                  child: Text('·', style: TextStyle(color: Color(0xFF94A3B8))),
                ),
                Text(
                  '📍 $distance',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4),
                  child: Text('·', style: TextStyle(color: Color(0xFF94A3B8))),
                ),
                Text(
                  price,
                  style: const TextStyle(
                    color: Color(0xFF0284C7),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => context.push('/booking/$id'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    color: const Color(0xFF0F172A),
                    alignment: Alignment.center,
                    child: const Text(
                      'Book',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => context.push('/provider/$id'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: const BoxDecoration(
                      color: Color(0xFFF8FAFC),
                      border: Border(left: BorderSide(color: Color(0xFFE2E8F0))),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'Profile',
                      style: TextStyle(
                        color: Color(0xFF475569),
                        fontSize: 12,
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

  Widget _buildUserMessage(ChatMessage msg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.76,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFF7EC8E3),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(14),
                topRight: Radius.circular(3),
                bottomLeft: Radius.circular(14),
                bottomRight: Radius.circular(14),
              ),
            ),
            child: Text(
              msg.text,
              style: const TextStyle(fontSize: 14, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(9),
              gradient: const LinearGradient(
                colors: [Color(0xFF7EC8E3), Color(0xFF06B6D4)],
              ),
            ),
            alignment: Alignment.center,
            child: const Text('✨', style: TextStyle(fontSize: 12)),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 15),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(3),
                topRight: Radius.circular(14),
                bottomLeft: Radius.circular(14),
                bottomRight: Radius.circular(14),
              ),
              border: Border.fromBorderSide(BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: AnimatedBuilder(
              animation: _animController,
              builder: (context, child) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(3, (index) {
                    final delay = index * 0.33;
                    final value = (_animController.value - delay) % 1.0;
                    final opacity = value < 0 ? 0.3 : (0.3 + (0.7 * (1 - value)));
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Opacity(
                        opacity: opacity,
                        child: Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFFCBD5E1),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestionsRow() {
    final suggestions = ['Find a plumber', 'House cleaning today', 'IT support', 'Math tutor'];
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
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
                padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  s,
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF475569),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 14, 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: SafeArea(
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
            borderRadius: BorderRadius.circular(14),
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
                  style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
                  decoration: const InputDecoration(
                    hintText: 'Describe what you need…',
                    hintStyle: TextStyle(color: Color(0xFF94A3B8)),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.fromLTRB(14, 6, 6, 14),
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
                  width: 36,
                  height: 36,
                  margin: const EdgeInsets.only(right: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF7EC8E3),
                    borderRadius: BorderRadius.circular(11),
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.send_rounded, color: Colors.white, size: 14),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
