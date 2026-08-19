import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/colors.dart';
import '../../models/conversation_model.dart';
import '../../providers/data_providers.dart';
import '../../providers/dm_provider.dart';

class DmScreen extends ConsumerStatefulWidget {
  final dynamic conversationId;
  const DmScreen({super.key, required this.conversationId});

  @override
  ConsumerState<DmScreen> createState() => _DmScreenState();
}

class _DmScreenState extends ConsumerState<DmScreen> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _textController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(dmProvider.notifier).loadConversation(widget.conversationId);
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _textController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant DmScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    _scrollToBottom();
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

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    ref.read(dmProvider.notifier).setInput(text);
    ref.read(dmProvider.notifier).send(widget.conversationId);
    _textController.clear();
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final convIdStr = widget.conversationId.toString();
    final conversationsAsync = ref.watch(conversationListProvider);
    final convList = conversationsAsync.value ?? [];
    final conv = convList.cast<ConversationModel?>().firstWhere(
          (c) => c?.id.toString() == convIdStr,
          orElse: () => null,
        ) ??
        ConversationModel(
          id: convIdStr,
          providerId: '1',
          name: 'Provider',
          initials: 'P',
          color: const Color(0xFF0284C7),
          lastMsg: '',
          time: 'now',
          unread: 0,
          online: true,
        );

    final dmState = ref.watch(dmProvider);
    final messages = dmState.messages[convIdStr] ?? [];
    final showTrust = dmState.showAITrust[convIdStr] == true;
    final isLoading = dmState.isLoading[convIdStr] == true && messages.isEmpty;

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        backgroundColor: const Color(0xFF7EC8E3),
        elevation: 0,
        leading: const BackButton(color: Color(0xFF1E5F7A)),
        title: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: conv.color,
                borderRadius: BorderRadius.circular(11),
              ),
              alignment: Alignment.center,
              child: Text(
                conv.initials,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      conv.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.verified, color: Colors.blue, size: 13),
                  ],
                ),
                Row(
                  children: [
                    if (conv.online) ...[
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Color(0xFF059669),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                    ],
                    Text(
                      conv.online ? 'Online' : 'Offline',
                      style: TextStyle(
                        fontSize: 11,
                        color: conv.online ? const Color(0xFF059669) : const Color(0xFF1E5F7A),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        actions: [
          Container(
            width: 34,
            height: 34,
            margin: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0x59FFFFFF),
              borderRadius: BorderRadius.circular(9),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.call_outlined, color: Color(0xFF1E5F7A), size: 16),
          ),
          const SizedBox(width: 4),
          Container(
            width: 34,
            height: 34,
            margin: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0x59FFFFFF),
              borderRadius: BorderRadius.circular(9),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.videocam_outlined, color: Color(0xFF1E5F7A), size: 16),
          ),
        ],
      ),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
          Expanded(
            child: isLoading
                ? const Center(
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0284C7)),
                  )
                : ListView(
                    controller: _scrollController,
                    padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
                    children: [
                      const Row(
                        children: [
                          Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                          Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8),
                            child: Text(
                              'Today',
                              style: TextStyle(
                                fontSize: 10.5,
                                color: Color(0xFF94A3B8),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                        ],
                      ),
                      const SizedBox(height: 14),
                      if (messages.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 40),
                          child: Center(
                            child: Column(
                              children: [
                                const Icon(Icons.waving_hand_rounded, size: 36, color: Color(0xFF7EC8E3)),
                                const SizedBox(height: 8),
                                Text(
                                  'Say hello to ${conv.name}!',
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Start discussing your project requirements, schedule, or pricing.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ...messages.map((msg) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      mainAxisAlignment: msg.fromMe ? MainAxisAlignment.end : MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        if (!msg.fromMe) ...[
                          Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: conv.color,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              conv.initials,
                              style: const TextStyle(
                                fontSize: 8,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 7),
                        ],
                        Column(
                          crossAxisAlignment: msg.fromMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            Container(
                              constraints: const BoxConstraints(maxWidth: 248),
                              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 9),
                              decoration: BoxDecoration(
                                color: msg.fromMe ? const Color(0xFF7EC8E3) : Colors.white,
                                borderRadius: msg.fromMe
                                    ? const BorderRadius.only(
                                        topLeft: Radius.circular(14),
                                        topRight: Radius.circular(4),
                                        bottomLeft: Radius.circular(14),
                                        bottomRight: Radius.circular(14),
                                      )
                                    : const BorderRadius.only(
                                        topLeft: Radius.circular(4),
                                        topRight: Radius.circular(14),
                                        bottomLeft: Radius.circular(14),
                                        bottomRight: Radius.circular(14),
                                      ),
                              ),
                              child: Text(
                                msg.text,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: msg.fromMe ? Colors.white : const Color(0xFF1E293B),
                                  height: 1.5,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              msg.time,
                              style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                              textAlign: msg.fromMe ? TextAlign.right : TextAlign.left,
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
                if (showTrust)
                  Padding(
                    padding: const EdgeInsets.only(top: 12, bottom: 16),
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xEB0F172A),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0x337EC8E3)),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 28,
                                height: 28,
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Color(0xFF7EC8E3), Color(0xFF06B6D4)],
                                  ),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'AI Trust Advisor',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFFE2E8F0),
                                      ),
                                    ),
                                    Text(
                                      '🔒 Only visible to you',
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: Color(0xFF94A3B8),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 16),
                                onPressed: () => ref.read(dmProvider.notifier).dismissTrust(widget.conversationId),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Container(
                            decoration: BoxDecoration(
                              color: const Color(0x1F10B981),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0x3310B981)), // 20% opacity
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            child: const Row(
                              children: [
                                Text('🛡️', style: TextStyle(fontSize: 20)),
                                SizedBox(width: 8),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Strong Trust Score',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF34D399),
                                      ),
                                    ),
                                    Text(
                                      'This provider has a clean record',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Color(0xFF6EE7B7),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          Column(
                            children: [
                              _buildStatRow('⏱️', 'On-time completion', '98%'),
                              _buildStatRow('📉', 'Complaints / Reports', '0'),
                              _buildStatRow('💬', 'Avg. response time', '~5 min'),
                              _buildStatRow('💰', 'Market rate check', 'Fair (280–350 ETB/hr)'),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Center(
                            child: Text(
                              'Based on verified bookings and platform data',
                              style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          if (!showTrust)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(14, 6, 14, 0),
              child: Row(
                children: [
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(4),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF7EC8E3), Color(0xFF06B6D4)],
                      ),
                    ),
                    alignment: Alignment.center,
                    child: const Text('✨', style: TextStyle(fontSize: 7)),
                  ),
                  const SizedBox(width: 6),
                  RichText(
                    text: const TextSpan(
                      text: 'Type ',
                      style: TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8)),
                      children: [
                        TextSpan(
                          text: '@AI',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0284C7)),
                        ),
                        TextSpan(text: ' for a private trust insight'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          // Quick reply suggestion pills
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildQuickReplyChip('@AI trust check'),
                  _buildQuickReplyChip('Are you available today?'),
                  _buildQuickReplyChip('Is price negotiable?'),
                  _buildQuickReplyChip('What is your location?'),
                  _buildQuickReplyChip('I paid via Escrow 🛡️'),
                ],
              ),
            ),
          ),
          Container(
            color: Colors.white,
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  padding: const EdgeInsets.fromLTRB(12, 4, 4, 4),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _textController,
                          style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
                          decoration: const InputDecoration(
                            hintText: 'Message or type @AI…',
                            border: InputBorder.none,
                            isDense: true,
                          ),
                          onSubmitted: (_) => _sendMessage(),
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Attach photos / job site location'), duration: Duration(seconds: 2)),
                          );
                        },
                        child: Container(
                          width: 34,
                          height: 34,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          alignment: Alignment.center,
                          child: const Icon(Icons.attach_file_rounded, color: Color(0xFF94A3B8), size: 16),
                        ),
                      ),
                      const SizedBox(width: 4),
                      GestureDetector(
                        onTap: _sendMessage,
                        child: Container(
                          width: 34,
                          height: 34,
                          decoration: BoxDecoration(
                            color: const Color(0xFF7EC8E3),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          alignment: Alignment.center,
                          child: const Icon(Icons.send_rounded, color: Colors.white, size: 14),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      ),
    );
  }

  Widget _buildStatRow(String emoji, String label, String value) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0x0DFFFFFF))),
      ),
      padding: const EdgeInsets.only(bottom: 8, top: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 13)),
              const SizedBox(width: 7),
              Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
            ],
          ),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFE2E8F0))),
        ],
      ),
    );
  }

  Widget _buildQuickReplyChip(String text) {
    return GestureDetector(
      onTap: () {
        _textController.text = text;
      },
      child: Container(
        margin: const EdgeInsets.only(right: 6),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Text(
          text,
          style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569), fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
}
