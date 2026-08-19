import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/mock_data.dart';
import '../../models/provider_model.dart';
import '../../services/booking_service.dart';
import '../../providers/data_providers.dart';

class BookingFlowScreen extends ConsumerStatefulWidget {
  final dynamic providerId;
  const BookingFlowScreen({super.key, required this.providerId});

  @override
  ConsumerState<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends ConsumerState<BookingFlowScreen> {
  int selectedService = 0;
  int selectedDay = 0;
  String? selectedTime;
  String paymentMethod = 'cash';
  String note = '';
  bool confirmed = false;

  @override
  Widget build(BuildContext context) {
    final providersAsync = ref.watch(providerListProvider);
    final sourceList = (providersAsync.value != null && providersAsync.value!.isNotEmpty)
        ? providersAsync.value!
        : MockData.providers;
    final p = sourceList.firstWhere(
      (prov) => prov.id.toString() == widget.providerId.toString(),
      orElse: () => sourceList.first,
    );

    if (confirmed) {
      return Scaffold(
        backgroundColor: const Color(0xFFF1F5F9),
        appBar: AppBar(
          backgroundColor: const Color(0xFF7EC8E3),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Text('Book Service', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
        ),
        body: Column(
          children: [
            Container(
              color: const Color(0xFF7EC8E3),
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(28, 20, 28, 20),
              child: Column(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.check, color: Colors.white, size: 30),
                  ),
                  const SizedBox(height: 12),
                  const Text('Booking Confirmed!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white)),
                  const SizedBox(height: 8),
                  const Text('Your provider has been notified.', style: TextStyle(fontSize: 13, color: Color(0xFF1E5F7A))),
                ],
              ),
            ),
            Container(
              color: Colors.white,
              margin: const EdgeInsets.only(bottom: 8),
              child: Column(
                children: [
                  _buildSummaryRow('Service', p.services[selectedService].name),
                  _buildSummaryRow('Date', 'Aug ${16 + selectedDay}'),
                  _buildSummaryRow('Time', selectedTime ?? ''),
                  _buildSummaryRow('Payment', paymentMethod == 'cash' ? 'Cash on Delivery' : 'Escrow (Safe Pay)'),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  minimumSize: const Size(double.infinity, 50),
                ),
                onPressed: () => context.go('/bookings'),
                child: const Text('View My Bookings', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7EC8E3),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Book Service', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
        ),
        child: SafeArea(
          child: InkWell(
            onTap: selectedTime != null
                ? () async {
                    try {
                      final priceNum = double.tryParse(p.services[selectedService].price.replaceAll(RegExp(r'[^0-9.]'), '')) ?? 350.0;
                      await BookingService().createBooking(
                        serviceId: p.services[selectedService].id,
                        entityId: p.id.toString(),
                        entityType: 'provider',
                        scheduledAt: '2026-08-${16 + selectedDay}T${selectedTime?.replaceAll(' ', '') ?? '10:00AM'}',
                        agreedPrice: priceNum,
                        notes: note,
                        paymentMethod: paymentMethod,
                      );
                      ref.invalidate(bookingListProvider);
                    } catch (_) {}
                    if (mounted) setState(() => confirmed = true);
                  }
                : null,
            child: Container(
              height: 50,
              color: selectedTime != null ? const Color(0xFF7EC8E3) : const Color(0xFFE2E8F0),
              alignment: Alignment.center,
              child: Text(
                selectedTime != null ? 'Confirm Booking · ${p.services[selectedService].price}' : 'Select a time to continue',
                style: TextStyle(
                  color: selectedTime != null ? Colors.white : const Color(0xFF94A3B8),
                  fontSize: 14,
                  fontWeight: selectedTime != null ? FontWeight.w800 : FontWeight.w600,
                ),
              ),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 88),
        child: Column(
          children: [
            _buildProviderMiniCard(p),
            _buildServiceSelection(p),
            _buildDatePicker(),
            _buildTimeSlots(),
            _buildNote(),
            _buildPaymentMethod(),
            _buildPriceSummary(p),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 13),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
        ],
      ),
    );
  }

  Widget _buildProviderMiniCard(ProviderModel p) {
    return Container(
      color: const Color(0xFF7EC8E3),
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: p.color,
              borderRadius: BorderRadius.circular(14),
            ),
            alignment: Alignment.center,
            child: Text(p.name.substring(0, 1), style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${p.name} 🛡️', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                Text(p.headline, style: const TextStyle(fontSize: 11.5, color: Color(0xFF1E5F7A))),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('★ ${p.rating}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFFF59E0B))),
              Text(p.distance, style: const TextStyle(fontSize: 11, color: Color(0xFF1E5F7A))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildServiceSelection(ProviderModel p) {
    return Container(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0)))),
            width: double.infinity,
            child: const Text('Select Service', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
          ),
          ...List.generate(p.services.length, (i) {
            final svc = p.services[i];
            final isSelected = selectedService == i;
            final isLast = i == p.services.length - 1;

            return GestureDetector(
              onTap: () => setState(() => selectedService = i),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFFFAFBFF) : Colors.white,
                  border: Border(bottom: isLast ? BorderSide.none : const BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: isSelected ? const Color(0xFF7EC8E3) : const Color(0xFFCBD5E1), width: 1.5),
                      ),
                      alignment: Alignment.center,
                      child: isSelected ? Container(
                        width: 8, height: 8,
                        decoration: const BoxDecoration(color: Color(0xFF7EC8E3), shape: BoxShape.circle),
                      ) : null,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(svc.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                          Text(svc.duration, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                        ],
                      ),
                    ),
                    Text(svc.price, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: isSelected ? const Color(0xFF7EC8E3) : const Color(0xFF334155))),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildDatePicker() {
    final days = ['Today\nAug 16','Sun\nAug 17','Mon\nAug 18','Tue\nAug 19','Wed\nAug 20','Thu\nAug 21'];
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      margin: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Select Date', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(days.length, (i) {
                final isSelected = selectedDay == i;
                final lines = days[i].split('\n');
                return GestureDetector(
                  onTap: () => setState(() => selectedDay = i),
                  child: Container(
                    width: 56,
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF7EC8E3) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Text(lines[0], style: TextStyle(fontSize: 10, color: isSelected ? Colors.white70 : const Color(0xFF94A3B8))),
                        const SizedBox(height: 4),
                        Text(lines[1], style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: isSelected ? Colors.white : const Color(0xFF334155))),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeSlots() {
    final times = ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
    final bookedTimes = ['11:00 AM','4:00 PM'];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      margin: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Select Time', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 4,
            childAspectRatio: 2.2,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: times.map((t) {
              final isBooked = bookedTimes.contains(t);
              final isSelected = selectedTime == t;

              return GestureDetector(
                onTap: isBooked ? null : () => setState(() => selectedTime = t),
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF7EC8E3) : (isBooked ? const Color(0xFFF8FAFC) : const Color(0xFFF1F5F9)),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    t,
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                      color: isSelected ? Colors.white : (isBooked ? const Color(0xFFCBD5E1) : const Color(0xFF334155)),
                      decoration: isBooked ? TextDecoration.lineThrough : null,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildNote() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      margin: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Text('Note', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
              Text(' (optional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF94A3B8))),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            maxLines: 3,
            onChanged: (val) => note = val,
            decoration: InputDecoration(
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              hintText: 'E.g. The leak is under the sink...',
              hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFF7EC8E3)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethod() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      margin: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Payment Method', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildPaymentCard('cash', '💵', 'Cash on Delivery'),
              const SizedBox(width: 8),
              _buildPaymentCard('escrow', '🔒', 'Escrow (Safe Pay)'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentCard(String id, String emoji, String label) {
    final isSelected = paymentMethod == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => paymentMethod = id),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFE0F2FE) : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? const Color(0xFF38BDF8) : Colors.transparent, width: 1.5),
          ),
          alignment: Alignment.center,
          child: Column(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 20)),
              const SizedBox(height: 5),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: isSelected ? const Color(0xFF0284C7) : const Color(0xFF475569),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPriceSummary(ProviderModel p) {
    final svc = p.services[selectedService];
    return Container(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0)))),
            width: double.infinity,
            child: const Text('Price Summary', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(svc.name, style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                Text(svc.price, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
              ],
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('LINC service fee (5%)', style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
                Text('~15 ETB', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
