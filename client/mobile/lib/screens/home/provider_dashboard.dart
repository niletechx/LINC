import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/booking_model.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../services/booking_service.dart';
import '../../services/message_service.dart';
import '../../services/notification_service.dart';
import '../../services/request_service.dart';

final availabilityProvider = StateProvider<bool>((ref) => true);

class ProviderDashboard extends ConsumerStatefulWidget {
  const ProviderDashboard({super.key});

  @override
  ConsumerState<ProviderDashboard> createState() => _ProviderDashboardState();
}

class _ProviderDashboardState extends ConsumerState<ProviderDashboard> {
  final BookingService _bookingService = BookingService();

  void _showNotificationsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Consumer(
          builder: (context, ref, _) {
            final notifsAsync = ref.watch(notificationListProvider);

            return Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Notifications',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                      ),
                      GestureDetector(
                        onTap: () async {
                          await NotificationService().markAllAsRead();
                          ref.invalidate(notificationListProvider);
                        },
                        child: const Text(
                          'Mark all as read',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0284C7)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  notifsAsync.when(
                    loading: () => const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20),
                        child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0284C7)),
                      ),
                    ),
                    error: (_, __) => const Padding(
                      padding: EdgeInsets.all(16),
                      child: Center(
                        child: Text(
                          'No new notifications',
                          style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                        ),
                      ),
                    ),
                    data: (notifs) {
                      if (notifs.isEmpty) {
                        return Container(
                          padding: const EdgeInsets.all(24),
                          alignment: Alignment.center,
                          child: const Column(
                            children: [
                              Text('🔔', style: TextStyle(fontSize: 28)),
                              SizedBox(height: 8),
                              Text(
                                "You're all caught up!",
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'New job requests and booking updates will appear here in real time.',
                                textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                              ),
                            ],
                          ),
                        );
                      }
                      return ConstrainedBox(
                        constraints: BoxConstraints(
                          maxHeight: MediaQuery.of(context).size.height * 0.45,
                        ),
                        child: ListView.separated(
                          shrinkWrap: true,
                          itemCount: notifs.length,
                          separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                          itemBuilder: (context, idx) {
                            final n = notifs[idx];
                            return ListTile(
                              contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 0),
                              leading: Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0284C7).withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                alignment: Alignment.center,
                                child: const Text('📋', style: TextStyle(fontSize: 18)),
                              ),
                              title: Text(
                                n.title,
                                style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                              ),
                              subtitle: Text(
                                n.body,
                                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _acceptBooking(BookingModel b) async {
    try {
      await _bookingService.updateBooking(b.id.toString(), {'status': 'confirmed'});
      ref.invalidate(bookingListProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ Booking accepted for ${b.clientName}! Client has been notified.'),
            backgroundColor: const Color(0xFF10B981),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to accept booking: $e'),
            backgroundColor: const Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  Future<void> _declineBooking(BookingModel b) async {
    try {
      await _bookingService.updateBooking(b.id.toString(), {'status': 'cancelled'});
      ref.invalidate(bookingListProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Booking request declined.'),
            backgroundColor: Color(0xFF64748B),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update booking: $e'),
            backgroundColor: const Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  Future<void> _completeBooking(BookingModel b) async {
    try {
      await _bookingService.markComplete(b.id.toString());
      ref.invalidate(bookingListProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🎉 Job completed for ${b.clientName}! 72h escrow release initiated.'),
            backgroundColor: const Color(0xFF10B981),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to complete job: $e'),
            backgroundColor: const Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  Future<void> _chatWithClient(BookingModel b) async {
    try {
      final user = ref.read(authProvider).user;
      final conv = await MessageService.instance.createOrGetConversation(
        currentUserId: user?.id ?? '1',
        participantType: 'user',
        participantId: b.requesterId ?? '1',
        bookingId: b.id.toString(),
      );
      if (mounted) {
        context.push('/dm/${conv.id}');
      }
    } catch (_) {
      if (mounted) {
        context.push('/messages');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAvailable = ref.watch(availabilityProvider);
    final topPadding = MediaQuery.of(context).padding.top;
    final bookingsAsync = ref.watch(bookingListProvider);
    final requestsAsync = ref.watch(requestListProvider);
    final notifsAsync = ref.watch(notificationListProvider);
    final hasUnreadNotifs = notifsAsync.value?.isNotEmpty ?? false;
    final user = ref.watch(authProvider).user;

    final bookings = bookingsAsync.value ?? [];
    final directBookings = bookings.where((b) => b.isProviderView || b.entityId != null).toList();
    final pendingBookings = directBookings.where((b) => b.status == BookingStatus.upcoming || b.status == BookingStatus.pending || b.statusText.toLowerCase().contains('pending')).toList();
    final activeBookings = directBookings.where((b) => b.status == BookingStatus.confirmed).toList();
    final completedBookings = directBookings.where((b) => b.status == BookingStatus.completed).toList();
    final totalEarnings = completedBookings.fold<double>(0.0, (sum, b) => sum + (b.agreedPrice ?? 0.0));
    final earningsStr = totalEarnings >= 1000
        ? '${(totalEarnings / 1000).toStringAsFixed(1)}K ETB'
        : '${totalEarnings.toInt()} ETB';

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        top: false,
        bottom: false,
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(bookingListProvider);
            ref.invalidate(requestListProvider);
            ref.invalidate(notificationListProvider);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 1. CYAN HEADER
                Container(
                  width: double.infinity,
                  color: const Color(0xFF7EC8E3),
                  padding: EdgeInsets.fromLTRB(16, topPadding + 14, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 14, color: Color(0xFF1E5F7A)),
                              const SizedBox(width: 4),
                              Text(
                                user?.locationCity ?? 'Addis Ababa, ET',
                                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF1E5F7A)),
                              ),
                              const SizedBox(width: 2),
                              const Icon(Icons.keyboard_arrow_down, size: 16, color: Color(0xFF1E5F7A)),
                            ],
                          ),
                          Row(
                            children: [
                              GestureDetector(
                                onTap: () => _showNotificationsModal(context),
                                child: Stack(
                                  children: [
                                    const Icon(Icons.notifications_none, color: Color(0xFF0F172A), size: 24),
                                    if (hasUnreadNotifs || pendingBookings.isNotEmpty)
                                      Positioned(
                                        top: 0,
                                        right: 0,
                                        child: Container(
                                          width: 8,
                                          height: 8,
                                          decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              GestureDetector(
                                onTap: () => ref.read(appModeProvider.notifier).state = AppMode.client,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 11),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.50),
                                    border: Border.all(color: Colors.white.withValues(alpha: 0.70)),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text(
                                    '💼 Provider Mode',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Text(
                        user?.fullName != null && user!.fullName.trim().isNotEmpty
                            ? 'Hello, ${user.fullName.split(' ').first}! 👋'
                            : 'Provider Dashboard',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.02),
                      ),
                    ],
                  ),
                ),

                // 2. AVAILABILITY BANNER
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                  decoration: BoxDecoration(
                    color: isAvailable ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                    border: Border(
                      bottom: BorderSide(
                        color: isAvailable ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                        width: 1.5,
                      ),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: isAvailable ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isAvailable ? 'Available for Instant Booking' : 'Currently Unavailable',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: isAvailable ? const Color(0xFF065F46) : const Color(0xFF991B1B),
                              ),
                            ),
                            const SizedBox(height: 2),
                            if (isAvailable)
                              const Text('Clients can book and message you right now', style: TextStyle(fontSize: 11.5, color: Color(0xFF059669))),
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () => ref.read(availabilityProvider.notifier).state = !isAvailable,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: 48,
                          height: 27,
                          decoration: BoxDecoration(
                            color: isAvailable ? const Color(0xFF10B981) : const Color(0xFFCBD5E1),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              AnimatedPositioned(
                                duration: const Duration(milliseconds: 200),
                                left: isAvailable ? 23 : 2.5,
                                child: Container(
                                  width: 22,
                                  height: 22,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4, offset: const Offset(0, 2))],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // 2.5 PROFILE & SERVICES SETUP BANNER
                Container(
                  margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFBAE6FD)),
                    boxShadow: [BoxShadow(color: const Color(0xFF0284C7).withValues(alpha: 0.05), blurRadius: 8, offset: const Offset(0, 2))],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(color: const Color(0xFFE0F2FE), borderRadius: BorderRadius.circular(10)),
                        alignment: Alignment.center,
                        child: const Text('🔧', style: TextStyle(fontSize: 20)),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Provider Profile & Trade', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                            SizedBox(height: 2),
                            Text('Edit hourly rate, bio, services & location', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0284C7),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          elevation: 0,
                        ),
                        onPressed: () => context.push('/provider-setup'),
                        child: const Text('Edit', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                      ),
                    ],
                  ),
                ),

                // 3. LIVE METRICS 2x2 GRID
                Container(
                  color: Colors.white,
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  child: bookingsAsync.when(
                    loading: () => const Padding(
                      padding: EdgeInsets.all(32),
                      child: Center(child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0284C7))),
                    ),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (_) => Column(
                      children: [
                        IntrinsicHeight(
                          child: Row(
                            children: [
                              _buildMetricCell('💰', earningsStr, const Color(0xFF0284C7), 'Total Earnings', showRightBorder: true, showBottomBorder: true),
                              _buildMetricCell('💼', '${activeBookings.length}', const Color(0xFF10B981), 'Active Jobs', showRightBorder: false, showBottomBorder: true),
                            ],
                          ),
                        ),
                        IntrinsicHeight(
                          child: Row(
                            children: [
                              _buildMetricCell('📋', '${pendingBookings.length}', const Color(0xFFF59E0B), 'Pending Offers', showRightBorder: true, showBottomBorder: false),
                              _buildMetricCell('✅', '${completedBookings.length}', const Color(0xFF0891B2), 'Completed', showRightBorder: false, showBottomBorder: false),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // 4. DIRECT INCOMING CLIENT BOOKINGS & OFFERS
                Container(
                  color: Colors.white,
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0)))),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Text('Direct Booking Requests', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                                if (pendingBookings.isNotEmpty) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(color: const Color(0xFFEF4444), borderRadius: BorderRadius.circular(10)),
                                    child: Text(
                                      '${pendingBookings.length} NEW',
                                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            GestureDetector(
                              onTap: () => ref.invalidate(bookingListProvider),
                              child: const Icon(Icons.refresh_rounded, size: 18, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      bookingsAsync.when(
                        loading: () => const Padding(
                          padding: EdgeInsets.all(24),
                          child: Center(child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0284C7))),
                        ),
                        error: (err, _) => Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text('Unable to load bookings: $err', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12), textAlign: TextAlign.center),
                        ),
                        data: (_) {
                          if (directBookings.isEmpty) {
                            return const Padding(
                              padding: EdgeInsets.all(24),
                              child: Center(
                                child: Column(
                                  children: [
                                    Text('📨', style: TextStyle(fontSize: 28)),
                                    SizedBox(height: 8),
                                    Text('No direct booking requests yet', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
                                    SizedBox(height: 4),
                                    Text('When a client books you directly, their request and details will appear here.', style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)), textAlign: TextAlign.center),
                                  ],
                                ),
                              ),
                            );
                          }

                          return Column(
                            children: directBookings.map((b) => _buildDirectBookingCard(context, b)).toList(),
                          );
                        },
                      ),
                    ],
                  ),
                ),

                // 5. OPEN MARKETPLACE REQUESTS
                Container(
                  color: Colors.white,
                  margin: const EdgeInsets.only(bottom: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0)))),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Marketplace Job Feed', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                            GestureDetector(
                              onTap: () => ref.invalidate(requestListProvider),
                              child: const Icon(Icons.refresh_rounded, size: 18, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      requestsAsync.when(
                        loading: () => const Padding(
                          padding: EdgeInsets.all(24),
                          child: Center(child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0284C7))),
                        ),
                        error: (err, _) => Padding(
                          padding: const EdgeInsets.all(20),
                          child: Text(
                            'Unable to load marketplace requests: $err',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        data: (reqs) {
                          if (reqs.isEmpty) {
                            return const Padding(
                              padding: EdgeInsets.all(24),
                              child: Center(
                                child: Text(
                                  'No open client requests right now.\\nCheck back soon!',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8), height: 1.5),
                                ),
                              ),
                            );
                          }
                          return Column(
                            children: reqs.take(5).map((r) => _buildLiveRequest(context, r)).toList(),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDirectBookingCard(BuildContext context, BookingModel b) {
    final clientName = b.clientName.trim().isNotEmpty ? b.clientName : 'Client';
    final initials = clientName.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();
    final isPending = b.status == BookingStatus.upcoming || b.status == BookingStatus.pending || b.statusText.toLowerCase().contains('pending');
    final isConfirmed = b.status == BookingStatus.confirmed;
    final isCompleted = b.status == BookingStatus.completed;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFF0284C7).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Text(
                  initials.isNotEmpty ? initials : 'C',
                  style: const TextStyle(color: Color(0xFF0284C7), fontWeight: FontWeight.w800, fontSize: 16),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          child: Text(
                            clientName,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          b.price,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF10B981)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      b.title,
                      style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 12, color: Color(0xFF94A3B8)),
                        const SizedBox(width: 4),
                        Text(
                          b.date,
                          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (b.notes != null && b.notes!.trim().isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Text(
                'Note: ${b.notes!}',
                style: const TextStyle(fontSize: 12, color: Color(0xFF475569), fontStyle: FontStyle.italic),
              ),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              if (isPending) ...[
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 0,
                    ),
                    onPressed: () => _acceptBooking(b),
                    child: const Text('Accept Offer', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800)),
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFEF4444),
                    side: const BorderSide(color: Color(0xFFFECACA)),
                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () => _declineBooking(b),
                  child: const Text('Decline', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                ),
              ] else if (isConfirmed) ...[
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 0,
                    ),
                    onPressed: () => _completeBooking(b),
                    child: const Text('Mark Job Complete ✅', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800)),
                  ),
                ),
              ] else if (isCompleted) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(8)),
                  child: const Text('✅ Completed', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF059669))),
                ),
              ],
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.chat_outlined, color: Color(0xFF0284C7), size: 20),
                tooltip: 'Chat with Client',
                onPressed: () => _chatWithClient(b),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCell(String emoji, String value, Color valueColor, String label, {required bool showRightBorder, required bool showBottomBorder}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border(
            right: showRightBorder ? const BorderSide(color: Color(0xFFE2E8F0)) : BorderSide.none,
            bottom: showBottomBorder ? const BorderSide(color: Color(0xFFE2E8F0)) : BorderSide.none,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 17)),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: valueColor, letterSpacing: -0.02)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8))),
          ],
        ),
      ),
    );
  }

  Widget _buildLiveRequest(BuildContext context, ServiceRequestModel r) {
    final name = r.userName ?? 'Client';
    final initials = name.trim().split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();
    final budgetStr = '${r.budgetMin.toInt()} - ${r.budgetMax.toInt()} ETB';
    final urgencyColors = <String, Color>{
      'urgent': const Color(0xFFEF4444),
      'high': const Color(0xFFF59E0B),
      'medium': const Color(0xFF0284C7),
      'low': const Color(0xFF64748B),
    };
    final urgencyColor = urgencyColors[r.urgency] ?? const Color(0xFF64748B);
    final avatarColors = [const Color(0xFF7C3AED), const Color(0xFF0891B2), const Color(0xFF10B981), const Color(0xFFF59E0B), const Color(0xFF0284C7)];
    final color = avatarColors[r.id.hashCode.abs() % avatarColors.length];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0)))),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(14)),
                alignment: Alignment.center,
                child: Text(initials, style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 16)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(r.title, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)), maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Flexible(child: Text(name, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)), overflow: TextOverflow.ellipsis)),
                        const Text(' · ', style: TextStyle(color: Color(0xFF94A3B8))),
                        Text(budgetStr, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF10B981))),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                decoration: BoxDecoration(
                  color: urgencyColor.withValues(alpha: 0.1),
                  border: Border.all(color: urgencyColor.withValues(alpha: 0.3)),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(r.urgency.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: urgencyColor)),
              ),
            ],
          ),
          if (r.description.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(r.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4)),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                flex: 1,
                child: GestureDetector(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Quote submitted for ${r.title}!'), backgroundColor: const Color(0xFF10B981)),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    alignment: Alignment.center,
                    child: const Text('Send Quote', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Colors.white)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
