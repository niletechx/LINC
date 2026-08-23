import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';

class MessagesScreen extends ConsumerStatefulWidget {
  const MessagesScreen({super.key});

  @override
  ConsumerState<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends ConsumerState<MessagesScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final conversationsAsync = ref.watch(conversationListProvider);
    final isProvider = ref.watch(appModeProvider) == AppMode.provider;
    final user = ref.watch(authProvider).user;
    final topPadding = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: EdgeInsets.fromLTRB(16, isProvider ? topPadding + 14 : 14, 16, isProvider ? 18 : 14),
              decoration: BoxDecoration(
                color: isProvider ? const Color(0xFF0003BF) : const Color(0xFF7EC8E3),
                border: Border(bottom: BorderSide(color: isProvider ? Colors.transparent : const Color(0x1A000000))),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isProvider) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          child: Row(
                            children: [
                              const Icon(Icons.location_on, size: 14, color: Color(0xFF93C5FD)),
                              const SizedBox(width: 4),
                              Flexible(
                                child: Text(
                                  user?.locationCity ?? 'Addis Ababa, ET',
                                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Colors.white),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Row(
                          children: [
                            GestureDetector(
                              onTap: () => ref.refresh(conversationListProvider),
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.20),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 16),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 10),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.20),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.40)),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.work_outline_rounded, size: 12, color: Colors.white),
                                  SizedBox(width: 4),
                                  Text(
                                    'Provider Mode',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isProvider ? 'Client Messages' : 'Messages',
                            style: TextStyle(
                              fontSize: isProvider ? 20 : 22,
                              fontWeight: FontWeight.w800,
                              color: isProvider ? Colors.white : const Color(0xFF0F172A),
                              letterSpacing: -0.02,
                            ),
                          ),
                          if (isProvider) ...[
                            const SizedBox(height: 2),
                            const Text(
                              'Inquiries, quotes & active job chats',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFFBFDBFE),
                              ),
                            ),
                          ],
                        ],
                      ),
                      if (!isProvider)
                        GestureDetector(
                          onTap: () => ref.refresh(conversationListProvider),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0x26000000),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.refresh_rounded, color: Color(0xFF0F172A), size: 16),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),

            // Search Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  bottom: BorderSide(color: Color(0xFFF1F5F9)),
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Row(
                  children: [
                    const Icon(Icons.search, color: Color(0xFF94A3B8), size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onChanged: (v) => setState(() => _searchQuery = v.trim().toLowerCase()),
                        style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
                        decoration: const InputDecoration(
                          hintText: 'Search messages…',
                          hintStyle: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF94A3B8),
                            fontWeight: FontWeight.w500,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                    if (_searchQuery.isNotEmpty)
                      GestureDetector(
                        onTap: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                        child: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 16),
                      ),
                  ],
                ),
              ),
            ),

            // Conversations List
            Expanded(
              child: conversationsAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0284C7)),
                ),
                error: (err, _) => Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.chat_bubble_outline, size: 48, color: Color(0xFF94A3B8)),
                        const SizedBox(height: 12),
                        const Text(
                          'Unable to load messages',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          err.toString(),
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () => ref.refresh(conversationListProvider),
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
                data: (conversations) {
                  final filtered = _searchQuery.isEmpty
                      ? conversations
                      : conversations.where((c) => c.name.toLowerCase().contains(_searchQuery) || c.lastMsg.toLowerCase().contains(_searchQuery)).toList();

                  if (filtered.isEmpty) {
                    return RefreshIndicator(
                      onRefresh: () async => ref.refresh(conversationListProvider),
                      child: ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: [
                          SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                          const Center(
                            child: Icon(Icons.chat_bubble_outline_rounded, size: 54, color: Color(0xFFCBD5E1)),
                          ),
                          const SizedBox(height: 14),
                          const Center(
                            child: Text(
                              'No conversations yet',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 40),
                            child: Text(
                              'When you message a verified provider or client, your conversation will appear here.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12.5, color: Color(0xFF94A3B8), height: 1.4),
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () async => ref.refresh(conversationListProvider),
                    child: ListView.builder(
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final conv = filtered[index];
                        final hasUnread = conv.unread > 0;

                        return GestureDetector(
                          onTap: () => context.push('/dm/${conv.id}'),
                          child: Container(
                            decoration: BoxDecoration(
                              color: hasUnread ? const Color(0xFFFAFBFF) : Colors.white,
                              border: const Border(
                                bottom: BorderSide(color: Color(0xFFF1F5F9)),
                              ),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            child: Row(
                              children: [
                                Stack(
                                  clipBehavior: Clip.none,
                                  children: [
                                    Container(
                                      width: 50,
                                      height: 50,
                                      decoration: BoxDecoration(
                                        color: conv.color,
                                        borderRadius: BorderRadius.circular(17),
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(
                                        conv.initials,
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                    if (conv.online)
                                      Positioned(
                                        bottom: 1,
                                        right: 1,
                                        child: Container(
                                          width: 12,
                                          height: 12,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF10B981),
                                            shape: BoxShape.circle,
                                            border: Border.all(
                                              color: Colors.white,
                                              width: 2,
                                            ),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              conv.name,
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: hasUnread ? FontWeight.w800 : FontWeight.w600,
                                                color: const Color(0xFF0F172A),
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          Text(
                                            conv.time,
                                            style: TextStyle(
                                              fontSize: 11,
                                              color: hasUnread ? const Color(0xFF0284C7) : const Color(0xFF94A3B8),
                                              fontWeight: hasUnread ? FontWeight.w700 : FontWeight.w400,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        conv.lastMsg,
                                        style: TextStyle(
                                          fontSize: 12.5,
                                          color: hasUnread ? const Color(0xFF334155) : const Color(0xFF94A3B8),
                                          fontWeight: hasUnread ? FontWeight.w600 : FontWeight.w400,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                        maxLines: 1,
                                      ),
                                    ],
                                  ),
                                ),
                                if (hasUnread)
                                  Container(
                                    width: 20,
                                    height: 20,
                                    margin: const EdgeInsets.only(left: 8),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF0284C7),
                                      shape: BoxShape.circle,
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      '${conv.unread}',
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
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
}
