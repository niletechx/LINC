import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/booking_model.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../services/booking_service.dart';
import '../../services/message_service.dart';
import '../../services/review_service.dart';

class BookingsScreen extends ConsumerStatefulWidget {
  const BookingsScreen({super.key});

  @override
  ConsumerState<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends ConsumerState<BookingsScreen> {
  final Map<dynamic, bool> _releasedEscrows = {};

  Future<void> _chatWithBookingProvider(BookingModel b) async {
    try {
      final user = ref.read(authProvider).user;
      final conv = await MessageService.instance.createOrGetConversation(
        currentUserId: user?.id ?? '1',
        participantType: 'provider',
        participantId: b.entityId ?? '1',
        bookingId: b.id.toString(),
      );
      if (mounted) {
        context.push('/dm/${conv.id}');
      }
    } catch (_) {
      if (mounted) {
        context.push('/dm/${b.id}');
      }
    }
  }

  void _showReleaseEscrowModal(BuildContext context, BookingModel b) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
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
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.shield_outlined, size: 22, color: Color(0xFF059669)),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Release Escrow Payment',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Only release once the service has been completed to your satisfaction.',
                          style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Provider', style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                        Text(b.provider, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Service', style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                        Text(b.title, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Release Amount', style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                        Text(b.price, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF10B981))),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () async {
                    Navigator.pop(ctx);
                    setState(() {
                      _releasedEscrows[b.id] = true;
                    });
                    try {
                      await BookingService().markComplete(b.id.toString());
                      ref.invalidate(bookingListProvider);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Payment of ${b.price} released to ${b.provider}!'),
                            backgroundColor: const Color(0xFF10B981),
                            duration: const Duration(seconds: 3),
                          ),
                        );
                        // After releasing funds, prompt the client to leave a review
                        await Future.delayed(const Duration(milliseconds: 800));
                        if (context.mounted) {
                          _showReviewModal(context, b);
                        }
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Escrow released: ${b.price} transferred to provider.'),
                            backgroundColor: const Color(0xFF10B981),
                            duration: const Duration(seconds: 3),
                          ),
                        );
                        // Still prompt for review even if backend call partially failed
                        await Future.delayed(const Duration(milliseconds: 800));
                        if (context.mounted) {
                          _showReviewModal(context, b);
                        }
                      }
                    }
                  },
                  child: const Text(
                    'Confirm & Release Funds',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showReviewModal(BuildContext context, BookingModel b) {
    int stars = 5;
    final reviewController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 24),
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
                  Text(
                    'Rate & Review ${b.provider}',
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'For ${b.title}',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (idx) {
                        return IconButton(
                          iconSize: 36,
                          icon: Icon(
                            idx < stars ? Icons.star_rounded : Icons.star_outline_rounded,
                            color: const Color(0xFFF59E0B),
                          ),
                          onPressed: () {
                            setModalState(() => stars = idx + 1);
                          },
                        );
                      }),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: reviewController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Share details of your experience…',
                      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F172A),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () async {
                        final comment = reviewController.text.trim();
                        Navigator.pop(ctx);
                        try {
                          await ReviewService().submitReview(
                            bookingId: b.id.toString(),
                            entityType: b.entityType ?? 'provider',
                            entityId: b.entityId ?? '1',
                            rating: stars,
                            comment: comment.isNotEmpty ? comment : null,
                          );
                        } catch (_) {}

                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Thank you! Your verified review has been published.'),
                              backgroundColor: Color(0xFF10B981),
                            ),
                          );
                        }
                      },
                      child: const Text(
                        'Submit Review',
                        style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentTab = ref.watch(bookingTabProvider);
    final bookingsAsync = ref.watch(bookingListProvider);
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
            // Bookings header
            Container(
              width: double.infinity,
              padding: EdgeInsets.fromLTRB(16, isProvider ? topPadding + 14 : 14, 16, isProvider ? 18 : 14),
              decoration: BoxDecoration(
                color: isProvider ? const Color(0xFF0003BF) : const Color(0xFF7EC8E3),
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
                              onTap: () => ref.refresh(bookingListProvider),
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
                            isProvider ? 'Jobs & Bookings' : 'Bookings',
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
                              'Manage client contracts, escrow & schedules',
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
                          onTap: () => ref.refresh(bookingListProvider),
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
            bookingsAsync.when(
              loading: () => const Expanded(
                child: Center(
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0284C7)),
                ),
              ),
              error: (err, _) => Expanded(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline_rounded, size: 48, color: Color(0xFF94A3B8)),
                        const SizedBox(height: 12),
                        const Text(
                          'Unable to load bookings',
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
                          onPressed: () => ref.refresh(bookingListProvider),
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
              ),
              data: (allBookings) {
                final activeCount = allBookings.where((b) => b.status == BookingStatus.confirmed).length;
                final upcomingCount = allBookings.where((b) => b.status == BookingStatus.upcoming).length;
                final doneCount = allBookings.where((b) => b.status == BookingStatus.completed).length;

                List<BookingModel> filteredBookings;
                switch (currentTab) {
                  case BookingTab.active:
                    filteredBookings = allBookings.where((b) => b.status == BookingStatus.confirmed).toList();
                    break;
                  case BookingTab.upcoming:
                    filteredBookings = allBookings.where((b) => b.status == BookingStatus.upcoming).toList();
                    break;
                  case BookingTab.completed:
                    filteredBookings = allBookings.where((b) => b.status == BookingStatus.completed).toList();
                    break;
                }

                return Expanded(
                  child: Column(
                    children: [
                      Container(
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                        ),
                        child: Row(
                          children: [
                            _buildTab('Active ($activeCount)', BookingTab.active, currentTab),
                            _buildTab('Upcoming ($upcomingCount)', BookingTab.upcoming, currentTab),
                            _buildTab('Done ($doneCount)', BookingTab.completed, currentTab),
                          ],
                        ),
                      ),
                      Expanded(
                        child: filteredBookings.isEmpty
                            ? RefreshIndicator(
                                onRefresh: () async => ref.refresh(bookingListProvider),
                                child: ListView(
                                  physics: const AlwaysScrollableScrollPhysics(),
                                  children: [
                                    SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                                    const Center(
                                      child: Icon(Icons.calendar_today_outlined, size: 48, color: Color(0xFFCBD5E1)),
                                    ),
                                    const SizedBox(height: 12),
                                    Center(
                                      child: Text(
                                        'No ${currentTab.name} bookings',
                                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF475569)),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 32),
                                      child: Text(
                                        'Book a service with any verified provider and manage your schedule here.',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : RefreshIndicator(
                                onRefresh: () async => ref.refresh(bookingListProvider),
                                child: ListView.separated(
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                                  itemCount: filteredBookings.length,
                                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                                  itemBuilder: (context, index) {
                                    final b = filteredBookings[index];
                                    return _buildBookingCard(context, b);
                                  },
                                ),
                              ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String title, BookingTab tab, BookingTab currentTab) {
    final isActive = tab == currentTab;
    return Expanded(
      child: GestureDetector(
        onTap: () => ref.read(bookingTabProvider.notifier).state = tab,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: isActive ? const Color(0xFF7EC8E3) : Colors.transparent,
                width: 2.5,
              ),
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              color: isActive ? const Color(0xFF7EC8E3) : const Color(0xFF94A3B8),
              fontSize: 12.5,
              fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBookingCard(BuildContext context, BookingModel b) {
    final Color statusColor;
    final String statusLabel;
    final isReleased = _releasedEscrows[b.id] == true;
    // Only clients can release escrow — providers should never see this button
    final isProviderMode = ref.watch(appModeProvider) == AppMode.provider;
    final isClientView = !isProviderMode && !b.isProviderView;

    switch (b.status) {
      case BookingStatus.confirmed:
        statusColor = const Color(0xFF059669);
        statusLabel = isReleased ? 'Completed' : (b.statusText.isNotEmpty ? b.statusText : 'In Progress');
        break;
      case BookingStatus.upcoming:
      case BookingStatus.pending:
        statusColor = const Color(0xFFD97706);
        statusLabel = b.statusText.isNotEmpty ? b.statusText : 'Upcoming';
        break;
      case BookingStatus.completed:
        statusColor = const Color(0xFF64748B);
        statusLabel = 'Done';
        break;
      case BookingStatus.cancelled:
        statusColor = const Color(0xFFEF4444);
        statusLabel = 'Cancelled';
        break;
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 12, 14),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: b.color,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    b.initials,
                    style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(b.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                      const SizedBox(height: 2),
                      Text(b.provider, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6, height: 6,
                        decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        statusLabel,
                        style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_today, size: 13, color: Color(0xFF94A3B8)),
                const SizedBox(width: 6),
                Text(b.date, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                const SizedBox(width: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.shield_outlined, size: 11, color: Color(0xFF059669)),
                      SizedBox(width: 3),
                      Text('Escrow', style: TextStyle(color: Color(0xFF059669), fontSize: 9.5, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
                const Spacer(),
                Text(b.price, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
              ],
            ),
          ),
          Container(
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
            ),
            child: b.status == BookingStatus.confirmed && !isReleased && isClientView
                ? Row(
                    children: [
                      Expanded(
                        child: TextButton(
                          style: TextButton.styleFrom(
                            backgroundColor: Colors.white,
                            shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          onPressed: () => _chatWithBookingProvider(b),
                          child: const Text('Chat', style: TextStyle(color: Color(0xFF0F172A), fontSize: 12.5, fontWeight: FontWeight.w700)),
                        ),
                      ),
                      Container(width: 1, height: 40, color: const Color(0xFFF1F5F9)),
                      Expanded(
                        child: TextButton(
                          style: TextButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          onPressed: () => _showReleaseEscrowModal(context, b),
                          child: const Text('Release Escrow', style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w800)),
                        ),
                      ),
                    ],
                  )
                : (b.status == BookingStatus.upcoming || b.status == BookingStatus.pending)
                    ? Row(
                        children: [
                          Expanded(
                            child: TextButton(
                              style: TextButton.styleFrom(
                                backgroundColor: Colors.white,
                                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Select new date/time on provider profile')),
                                );
                              },
                              child: const Text('Reschedule', style: TextStyle(color: Color(0xFF64748B), fontSize: 12.5, fontWeight: FontWeight.w700)),
                            ),
                          ),
                          Container(width: 1, height: 40, color: const Color(0xFFF1F5F9)),
                          Expanded(
                            child: TextButton(
                              style: TextButton.styleFrom(
                                backgroundColor: const Color(0xFF0F172A),
                                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              onPressed: () => _chatWithBookingProvider(b),
                              child: const Text('Chat', style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                            ),
                          ),
                        ],
                      )
                    : isClientView
                        ? TextButton(
                            style: TextButton.styleFrom(
                              backgroundColor: const Color(0xFFFFFBEB),
                              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                              minimumSize: const Size(double.infinity, 44),
                            ),
                            onPressed: () => _showReviewModal(context, b),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.star_rounded, size: 16, color: Color(0xFFD97706)),
                                SizedBox(width: 4),
                                Text('Leave Review', style: TextStyle(color: Color(0xFFD97706), fontSize: 12.5, fontWeight: FontWeight.w700)),
                              ],
                            ),
                          )
                        : Container(
                            height: 44,
                            alignment: Alignment.center,
                            decoration: const BoxDecoration(
                              color: Color(0xFFF8FAFC),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.check_circle_outline, color: Color(0xFF059669), size: 16),
                                SizedBox(width: 6),
                                Text(
                                  'Job Completed & Escrow Paid',
                                  style: TextStyle(color: Color(0xFF059669), fontSize: 12, fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
