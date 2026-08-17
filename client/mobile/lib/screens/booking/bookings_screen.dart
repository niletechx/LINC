import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../config/text_styles.dart';
import '../../data/mock_data.dart';
import '../../models/booking_model.dart';
import '../../providers/app_provider.dart';

class BookingsScreen extends ConsumerWidget {
  const BookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentTab = ref.watch(bookingTabProvider);

    List<BookingModel> filteredBookings;
    switch (currentTab) {
      case BookingTab.active:
        filteredBookings = MockData.bookings.where((b) => b.status == BookingStatus.confirmed).toList();
        break;
      case BookingTab.upcoming:
        filteredBookings = MockData.bookings.where((b) => b.status == BookingStatus.upcoming).toList();
        break;
      case BookingTab.completed:
        filteredBookings = MockData.bookings.where((b) => b.status == BookingStatus.completed).toList();
        break;
    }

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
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            decoration: const BoxDecoration(
              color: Color(0xFF7EC8E3),
            ),
            child: const Text('Bookings', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
          ),
          Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              children: [
                _buildTab(context, ref, 'active', BookingTab.active, currentTab),
                _buildTab(context, ref, 'upcoming', BookingTab.upcoming, currentTab),
                _buildTab(context, ref, 'completed', BookingTab.completed, currentTab),
              ],
            ),
          ),
          Expanded(
            child: filteredBookings.isEmpty
                ? Center(
                    child: Text(
                      'No ${currentTab.name} bookings',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF94A3B8)),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                    itemCount: filteredBookings.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final b = filteredBookings[index];
                      return _buildBookingCard(context, b);
                    },
                  ),
          ),
        ],
      ),
      ),
    );
  }

  Widget _buildTab(BuildContext context, WidgetRef ref, String title, BookingTab tab, BookingTab currentTab) {
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
            title[0].toUpperCase() + title.substring(1),
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
    switch (b.status) {
      case BookingStatus.confirmed:
        statusColor = const Color(0xFF059669);
        statusLabel = 'Confirmed';
        break;
      case BookingStatus.upcoming:
        statusColor = const Color(0xFFD97706);
        statusLabel = 'Upcoming';
        break;
      case BookingStatus.completed:
        statusColor = const Color(0xFF64748B);
        statusLabel = 'Done';
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
                      Text(b.provider, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    ],
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 7, height: 7,
                      decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      statusLabel,
                      style: TextStyle(color: statusColor, fontSize: 11.5, fontWeight: FontWeight.w700),
                    ),
                  ],
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
                const Icon(Icons.calendar_today, size: 14, color: Color(0xFF94A3B8)),
                const SizedBox(width: 6),
                Text(b.date, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                const Spacer(),
                Text(b.price, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
              ],
            ),
          ),
          Container(
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
            ),
            child: b.status != BookingStatus.completed
                ? Row(
                    children: [
                      Expanded(
                        child: TextButton(
                          style: TextButton.styleFrom(
                            backgroundColor: Colors.white,
                            shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          onPressed: () {},
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
                          onPressed: () => context.push('/dm/1'),
                          child: const Text('Chat', style: TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
                        ),
                      ),
                    ],
                  )
                : TextButton(
                    style: TextButton.styleFrom(
                      backgroundColor: const Color(0xFFFFFBEB),
                      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                      minimumSize: const Size(double.infinity, 44),
                    ),
                    onPressed: () {},
                    child: const Text('★ Leave Review', style: TextStyle(color: Color(0xFFD97706), fontSize: 12.5, fontWeight: FontWeight.w700)),
                  ),
          ),
        ],
      ),
    );
  }
}
