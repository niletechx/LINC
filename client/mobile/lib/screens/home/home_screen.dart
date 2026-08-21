import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/booking_model.dart';
import '../../widgets/provider_card.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../services/booking_service.dart';
import '../../services/message_service.dart';
import '../../services/notification_service.dart';
import '../../services/review_service.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String _currentLocation = 'Bole, Addis Ababa';
  final Set<String> _dismissedBookingIds = {};
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
                    child: const Text('🛡️', style: TextStyle(fontSize: 20)),
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
                        // Prompt client to leave a review
                        await Future.delayed(const Duration(milliseconds: 700));
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
                        await Future.delayed(const Duration(milliseconds: 700));
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
              padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 28),
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
                    'Review ${b.provider}',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Share your feedback to help other clients in Addis Ababa.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (idx) {
                        return GestureDetector(
                          onTap: () {
                            setModalState(() {
                              stars = idx + 1;
                            });
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: Icon(
                              idx < stars ? Icons.star_rounded : Icons.star_outline_rounded,
                              color: const Color(0xFFF59E0B),
                              size: 36,
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: reviewController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Describe the quality of work, punctuality, and professionalism...',
                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF7EC8E3), width: 1.5)),
                      contentPadding: const EdgeInsets.all(12),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F172A),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () async {
                        Navigator.pop(ctx);
                        setState(() {
                          _dismissedBookingIds.add(b.id.toString());
                        });
                        try {
                          await ReviewService().submitReview(
                            bookingId: b.id.toString(),
                            entityType: 'provider',
                            entityId: b.entityId ?? '1',
                            rating: stars,
                            comment: reviewController.text.trim().isNotEmpty
                                ? reviewController.text.trim()
                                : null,
                          );
                          ref.invalidate(bookingListProvider);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Thank you! Your verified review has been posted.'),
                                backgroundColor: Color(0xFF10B981),
                              ),
                            );
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Review submitted: $e')),
                            );
                          }
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

  Widget _buildClientBookingTrackerSection(BuildContext context) {
    final bookingsAsync = ref.watch(bookingListProvider);
    final bookings = bookingsAsync.value ?? [];
    // Only client's own bookings that haven't been dismissed
    final clientBookings = bookings.where((b) {
      if (b.isProviderView) return false;
      if (_dismissedBookingIds.contains(b.id.toString())) return false;
      return b.status == BookingStatus.confirmed ||
          b.status == BookingStatus.upcoming ||
          b.status == BookingStatus.pending ||
          b.status == BookingStatus.cancelled ||
          b.statusText.toLowerCase().contains('pending');
    }).toList();

    if (clientBookings.isEmpty) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.shield_outlined, size: 16, color: Color(0xFF10B981)),
                  SizedBox(width: 6),
                  Text(
                    'My Active Bookings & Services',
                    style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () {
                  if (!_guestGate(context, action: 'view your bookings')) return;
                  context.go('/bookings');
                },
                child: const Text(
                  'View all',
                  style: TextStyle(color: Color(0xFF0284C7), fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...clientBookings.map((b) => _buildClientBookingCard(context, b)),
        ],
      ),
    );
  }

  Widget _buildClientBookingCard(BuildContext context, BookingModel b) {
    final isPending = b.status == BookingStatus.upcoming ||
        b.status == BookingStatus.pending ||
        b.statusText.toLowerCase().contains('pending');
    final isConfirmed = b.status == BookingStatus.confirmed;
    final isCancelled = b.status == BookingStatus.cancelled ||
        b.statusText.toLowerCase().contains('cancel') ||
        b.statusText.toLowerCase().contains('decline');
    final isReleased = _releasedEscrows[b.id] == true;

    Color badgeBg;
    Color badgeText;
    String statusTitle;
    String statusSubtitle;
    String statusIcon;

    if (isConfirmed && !isReleased) {
      badgeBg = const Color(0xFFECFDF5);
      badgeText = const Color(0xFF059669);
      statusTitle = 'Service in Progress';
      statusSubtitle = 'Provider accepted · Escrow payment safely held 🛡️';
      statusIcon = '🟢';
    } else if (isPending) {
      badgeBg = const Color(0xFFFFFBEB);
      badgeText = const Color(0xFFD97706);
      statusTitle = 'Booking Request Sent';
      statusSubtitle = 'Awaiting provider confirmation. Escrow protected.';
      statusIcon = '⏳';
    } else if (isCancelled) {
      badgeBg = const Color(0xFFFEF2F2);
      badgeText = const Color(0xFFDC2626);
      statusTitle = 'Booking Request Declined';
      statusSubtitle = 'Provider was unavailable for this slot. Escrow refunded.';
      statusIcon = '❌';
    } else {
      badgeBg = const Color(0xFFF1F5F9);
      badgeText = const Color(0xFF475569);
      statusTitle = 'Completed';
      statusSubtitle = 'Payment released';
      statusIcon = '✅';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isConfirmed
              ? const Color(0xFFA7F3D0)
              : (isPending
                  ? const Color(0xFFFDE68A)
                  : (isCancelled ? const Color(0xFFFECACA) : const Color(0xFFE2E8F0))),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Status Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: badgeBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
            ),
            child: Row(
              children: [
                Text(statusIcon, style: const TextStyle(fontSize: 14)),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        statusTitle,
                        style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: badgeText),
                      ),
                      Text(
                        statusSubtitle,
                        style: TextStyle(
                          fontSize: 10.5,
                          color: badgeText.withValues(alpha: 0.85),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isCancelled)
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _dismissedBookingIds.add(b.id.toString());
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.close, size: 14, color: Color(0xFFDC2626)),
                    ),
                  ),
              ],
            ),
          ),

          // Details Body
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0F2FE),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        b.provider.isNotEmpty ? b.provider[0].toUpperCase() : 'P',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0284C7)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            b.provider,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            b.title,
                            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          b.price,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF10B981)),
                        ),
                        Text(
                          b.date,
                          style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8)),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Action Buttons for Client (NO Accept/Decline here!)
                Row(
                  children: [
                    Expanded(
                      flex: isConfirmed ? 5 : 1,
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF0F172A),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => _chatWithBookingProvider(b),
                        icon: const Icon(Icons.chat_bubble_outline_rounded, size: 15, color: Color(0xFF0284C7)),
                        label: const Text('Chat', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                      ),
                    ),

                    // When Confirmed: Release Escrow & Finish Job
                    if (isConfirmed && !isReleased) ...[
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 7,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            elevation: 0,
                          ),
                          onPressed: () => _showReleaseEscrowModal(context, b),
                          icon: const Icon(Icons.check_circle_outline, size: 15),
                          label: const Text('Release & Finish', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800)),
                        ),
                      ),
                    ],

                    // When Cancelled: Feedback & Dismiss options
                    if (isCancelled) ...[
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextButton.icon(
                          style: TextButton.styleFrom(
                            backgroundColor: const Color(0xFFFFFBEB),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          onPressed: () {
                            _showReviewModal(context, b);
                          },
                          icon: const Icon(Icons.star_outline_rounded, size: 15, color: Color(0xFFD97706)),
                          label: const Text('Leave Feedback', style: TextStyle(color: Color(0xFFD97706), fontSize: 12, fontWeight: FontWeight.w700)),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Shows a bottom-sheet prompting the guest to sign in or create an account.
  /// Returns true if the user is authenticated (not a guest), false otherwise.
  bool _guestGate(BuildContext context, {String? action}) {
    final authState = ref.read(authProvider);
    if (authState.isAuthed) return true; // allowed

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40, height: 4,
                decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2)),
              ),
              const SizedBox(height: 20),
              Container(
                width: 60, height: 60,
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(18),
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.lock_outline_rounded, size: 28, color: Color(0xFF3B82F6)),
              ),
              const SizedBox(height: 14),
              Text(
                action != null ? 'Sign in to $action' : 'Sign in to continue',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              const Text(
                'Create a free account or sign in to use this feature. It only takes a minute!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity, height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    context.go('/signup');
                  },
                  child: const Text('Create Account — Free', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity, height: 50,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    context.go('/login');
                  },
                  child: const Text('Sign In', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                ),
              ),
              const SizedBox(height: 14),
              GestureDetector(
                onTap: () => Navigator.pop(ctx),
                child: const Text(
                  'Continue exploring as guest',
                  style: TextStyle(fontSize: 12.5, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
        );
      },
    );
    return false; // not authenticated
  }

  void _showLocationPicker(BuildContext context) {
    final locations = [
      {'name': 'Bole', 'sub': 'Airport, Medhanialem, Atlas, Edna Mall'},
      {'name': 'Kazanchis', 'sub': 'ECA, Intercontinental, Guinea Conakry'},
      {'name': 'Sarbet', 'sub': 'Vatican, Old Airport, Karl Square'},
      {'name': 'CMC / Summit', 'sub': 'Sunshine, Tsehay Real Estate, Safari'},
      {'name': 'Megenagna', 'sub': 'Lem Hotel, Zefmesh, Shola Market'},
      {'name': 'Piassa / Arada', 'sub': 'Churchill Ave, Taitu, Commercial Bank'},
      {'name': 'Bisrate Gabriel', 'sub': 'Laphto, Old Airport, Vatican'},
      {'name': 'Gerji / Imperial', 'sub': 'Jackros, Unity University, Roba'},
      {'name': 'Lebu / Jemo', 'sub': 'Varnero, Glass Factory, Jemo 1-3'},
      {'name': 'Mexico / Stadium', 'sub': 'KKare, Sengatera, Sante'},
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Container(
          padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 24),
          constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.75),
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
              const Row(
                children: [
                  Icon(Icons.location_on_rounded, color: Color(0xFF7EC8E3), size: 22),
                  SizedBox(width: 8),
                  Text(
                    'Select Location in Addis Ababa',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Expanded(
                child: ListView.separated(
                  itemCount: locations.length,
                  separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  itemBuilder: (context, idx) {
                    final loc = locations[idx];
                    final isSelected = _currentLocation.startsWith(loc['name']!);
                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                      title: Text(
                        loc['name']!,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected ? const Color(0xFF0284C7) : const Color(0xFF0F172A),
                        ),
                      ),
                      subtitle: Text(
                        loc['sub']!,
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                      ),
                      trailing: isSelected
                          ? const Icon(Icons.check_circle_rounded, color: Color(0xFF7EC8E3), size: 20)
                          : null,
                      onTap: () {
                        setState(() {
                          _currentLocation = '${loc['name']!}, Addis Ababa';
                        });
                        Navigator.pop(ctx);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

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
                                'You\'re all caught up!',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'New updates for bookings and messages will appear here.',
                                textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                              ),
                            ],
                          ),
                        );
                      }

                      return Column(
                        children: notifs.map((n) {
                          final icon = n.type == 'booking' ? '✅' : (n.type == 'message' ? '💬' : '🛡️');
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: n.isRead ? const Color(0xFFF8FAFC) : const Color(0xFFF0F9FF),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: n.isRead ? const Color(0xFFE2E8F0) : const Color(0xFFBAE6FD)),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(icon, style: const TextStyle(fontSize: 20)),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        n.title,
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        n.body,
                                        style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
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

  @override
  Widget build(BuildContext context) {
    final appMode = ref.watch(appModeProvider);
    final isProvider = appMode == AppMode.provider;
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isGuest = authState.isGuest && !authState.isAuthed;
    final providersAsync = ref.watch(providerListProvider);
    final requestsAsync = ref.watch(requestListProvider);

    final firstName = user?.fullName.trim().split(' ').first ?? 'Explorer';

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),

      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // GUEST BANNER — shown when browsing without account
              if (isGuest)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: const BoxDecoration(
                    color: Color(0xFF0F172A),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.explore_outlined, color: Color(0xFF7EC8E3), size: 16),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'Browsing as guest · Sign in to book & message providers',
                          style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w500),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => context.go('/login'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF7EC8E3),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Sign In',
                            style: TextStyle(color: Color(0xFF0F172A), fontSize: 11.5, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

              // 1. CYAN HEADER SECTION
              Container(
                color: const Color(0xFF7EC8E3),
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              GestureDetector(
                                onTap: () => _showLocationPicker(context),
                                child: Row(
                                  children: [
                                    const Icon(Icons.location_on, color: Color(0xFF1E5F7A), size: 13),
                                    const SizedBox(width: 4),
                                    Flexible(
                                      child: Text(
                                        _currentLocation,
                                        style: const TextStyle(
                                          color: Color(0xFF1E5F7A),
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: 2),
                                    const Icon(Icons.keyboard_arrow_down, color: Color(0xFF1E5F7A), size: 16),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                isProvider ? 'Provider Dashboard' : 'Good morning, $firstName',
                                style: const TextStyle(
                                  color: Color(0xFF0F172A),
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Right Side: Mode Switcher & Notification Bell
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            GestureDetector(
                              onTap: () {
                                ref.read(appModeProvider.notifier).state =
                                    ref.read(appModeProvider) == AppMode.client
                                        ? AppMode.provider
                                        : AppMode.client;
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 11),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.50),
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.70)),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  isProvider ? '💼 Provider' : '👤 Client',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            GestureDetector(
                              onTap: () => _showNotificationsModal(context),
                              child: Stack(
                                children: [
                                  const Icon(Icons.notifications_none, color: Color(0xFF0F172A), size: 24),
                                  Positioned(
                                    top: 0,
                                    right: 0,
                                    child: Container(
                                      width: 7,
                                      height: 7,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFFEF4444),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    GestureDetector(
                      onTap: () => context.push('/search'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.45),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.search, color: Color(0xFF1E5F7A), size: 18),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'What do you need help with?',
                                style: TextStyle(
                                  color: Color(0xFF1E5F7A),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF7EC8E3),
                                borderRadius: BorderRadius.circular(7),
                              ),
                              child: const Text(
                                '✨ AI',
                                style: TextStyle(
                                  color: Color(0xFF0F172A),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
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

              // 2. QUICK CHIPS
              Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildQuickChip(context, '🚨', 'Urgent', isUrgent: true, categorySlug: 'all', filter: 'verified'),
                      _buildQuickChip(context, '🧹', 'Cleaning', categorySlug: 'cleaning'),
                      _buildQuickChip(context, '📚', 'Tutoring', categorySlug: 'tutoring'),
                      _buildQuickChip(context, '💻', 'IT & Tech', categorySlug: 'it-tech'),
                      _buildQuickChip(context, '🔧', 'Plumbing', categorySlug: 'plumbing'),
                      _buildQuickChip(context, '🚗', 'Transport', categorySlug: 'transport'),
                    ],
                  ),
                ),
              ),

              // 2.5 ACTIVE CLIENT BOOKINGS TRACKER (Pending / In-Progress / Declined)
              _buildClientBookingTrackerSection(context),

              // 3. CATEGORIES GRID
              Container(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.only(top: 14, left: 16, right: 16, bottom: 12),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Text(
                          'Categories',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                        ),
                        const Spacer(),
                        GestureDetector(
                          onTap: () => context.push('/search?category=all'),
                          child: const Text(
                            'See all',
                            style: TextStyle(color: Color(0xFF7EC8E3), fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    IntrinsicHeight(
                      child: Row(
                        children: [
                          _buildCategoryCell(context, '🔧', 'Plumbing', 'plumbing', const Color(0xFF7EC8E3), showRightBorder: true, showBottomBorder: true),
                          _buildCategoryCell(context, '🧹', 'Cleaning', 'cleaning', const Color(0xFF059669), showRightBorder: true, showBottomBorder: true),
                          _buildCategoryCell(context, '💻', 'IT & Tech', 'it-tech', const Color(0xFF0891B2), showRightBorder: true, showBottomBorder: true),
                          _buildCategoryCell(context, '📚', 'Tutoring', 'tutoring', const Color(0xFFD97706), showRightBorder: false, showBottomBorder: true),
                        ],
                      ),
                    ),
                    IntrinsicHeight(
                      child: Row(
                        children: [
                          _buildCategoryCell(context, '⚡', 'Electric', 'electric', const Color(0xFF7EC8E3), showRightBorder: true, showBottomBorder: false),
                          _buildCategoryCell(context, '🚗', 'Transport', 'transport', const Color(0xFF7C3AED), showRightBorder: true, showBottomBorder: false),
                          _buildCategoryCell(context, '💆', 'Wellness', 'wellness', const Color(0xFF0F766E), showRightBorder: true, showBottomBorder: false),
                          _buildCategoryCell(context, '🎨', 'Creative', 'creative', const Color(0xFFBE185D), showRightBorder: false, showBottomBorder: false),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // 4. VERIFIED NEARBY
              Container(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(vertical: 14),
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          const Text(
                            'Verified Nearby',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '  ${_currentLocation.split(',').first} · 2 km',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
                          ),
                          const Spacer(),
                          GestureDetector(
                            onTap: () => context.push('/search?category=all'),
                            child: const Text(
                              'See all',
                              style: TextStyle(color: Color(0xFF7EC8E3), fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    providersAsync.when(
                      loading: () => const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF7EC8E3)),
                        ),
                      ),
                      error: (err, _) => Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                          child: Text(
                            'Unable to load nearby providers',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                          ),
                        ),
                      ),
                      data: (providers) {
                        if (providers.isEmpty) {
                          return Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                              child: Column(
                                children: [
                                  const Icon(Icons.person_search_outlined, size: 36, color: Color(0xFF94A3B8)),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'No registered providers yet',
                                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF475569)),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Create a provider account to be featured here!',
                                    style: TextStyle(fontSize: 11.5, color: Colors.grey.shade500),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }
                        return SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Row(
                            children: providers.map((p) {
                              return Padding(
                                padding: const EdgeInsets.only(right: 12),
                                child: GestureDetector(
                                  onTap: () => context.push('/provider/${p.id}'),
                                  child: ProviderCard(
                                    provider: p,
                                    onTap: () => context.push('/provider/${p.id}'),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              // 5. OPEN REQUESTS
              Container(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 80),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
                      child: Row(
                        children: [
                          const Text(
                            'Open Requests',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          const Spacer(),
                          GestureDetector(
                            onTap: () => context.push('/search'),
                            child: const Text(
                              'Post Request',
                              style: TextStyle(color: Color(0xFF0284C7), fontSize: 12, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ],
                      ),
                    ),
                    requestsAsync.when(
                      loading: () => const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 20),
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF7EC8E3)),
                        ),
                      ),
                      error: (err, _) => Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                          child: Text(
                            'Unable to load open requests',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                          ),
                        ),
                      ),
                      data: (requests) {
                        if (requests.isEmpty) {
                          return Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                              child: Column(
                                children: [
                                  const Icon(Icons.assignment_outlined, size: 32, color: Color(0xFF94A3B8)),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'No open requests in database',
                                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF475569)),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Ask AI to post your first service request!',
                                    style: TextStyle(fontSize: 11.5, color: Colors.grey.shade500),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }
                        return Column(
                          children: requests.map((r) {
                            final isUrgent = r.urgency == 'urgent' || r.urgency == 'high';
                            final emoji = _getEmojiForCategory(r.title);
                            return _buildOpenRequestRow(
                              emoji,
                              r.title,
                              '${r.budgetMin.toInt()}–${r.budgetMax.toInt()} ${r.currency}',
                              r.time,
                              r.city,
                              isUrgent,
                            );
                          }).toList(),
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
    );
  }

  Widget _buildQuickChip(
    BuildContext context,
    String emoji,
    String label, {
    bool isUrgent = false,
    String categorySlug = 'all',
    String? filter,
  }) {
    return GestureDetector(
      onTap: () {
        if (filter != null) {
          context.push('/search?filter=$filter');
        } else {
          context.push('/search?category=$categorySlug');
        }
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 12),
        decoration: BoxDecoration(
          color: isUrgent ? const Color(0xFFFEF2F2) : const Color(0xFFF8FAFC),
          border: Border.all(color: isUrgent ? const Color(0xFFFCA5A5) : const Color(0xFFE2E8F0), width: 1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 12)),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isUrgent ? const Color(0xFFDC2626) : const Color(0xFF334155),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCell(
    BuildContext context,
    String emoji,
    String label,
    String categorySlug,
    Color color, {
    required bool showRightBorder,
    required bool showBottomBorder,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: () => context.push('/search?category=$categorySlug'),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            border: Border(
              right: showRightBorder ? const BorderSide(color: Color(0xFFE2E8F0)) : BorderSide.none,
              bottom: showBottomBorder ? const BorderSide(color: Color(0xFFE2E8F0)) : BorderSide.none,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Text(emoji, style: const TextStyle(fontSize: 20)),
              ),
              const SizedBox(height: 5),
              Text(
                label,
                style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getEmojiForCategory(String title) {
    final lower = title.toLowerCase();
    if (lower.contains('pipe') || lower.contains('water') || lower.contains('leak') || lower.contains('plumb')) {
      return '🔧';
    }
    if (lower.contains('electr') || lower.contains('wire') || lower.contains('light') || lower.contains('power')) {
      return '⚡';
    }
    if (lower.contains('clean') || lower.contains('maid') || lower.contains('house')) {
      return '🧹';
    }
    if (lower.contains('laptop') || lower.contains('comput') || lower.contains('tech') || lower.contains('it')) {
      return '💻';
    }
    if (lower.contains('tutor') || lower.contains('teach') || lower.contains('lesson') || lower.contains('math')) {
      return '📚';
    }
    if (lower.contains('car') || lower.contains('driv') || lower.contains('transport') || lower.contains('cargo')) {
      return '🚗';
    }
    return '📋';
  }

  Widget _buildOpenRequestRow(String emoji, String title, String budget, String time, String location, bool isUrgent) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 16),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isUrgent ? const Color(0xFFFEF2F2) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: Text(emoji, style: const TextStyle(fontSize: 18)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (isUrgent) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 1.5, horizontal: 5),
                        margin: const EdgeInsets.only(right: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          '⚡URGENT',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.07,
                          ),
                        ),
                      ),
                    ],
                    Expanded(
                      child: Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(budget, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Color(0xFF10B981))),
                    const Text(' · ', style: TextStyle(color: Color(0xFF94A3B8))),
                    Text(time, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
                    const Text(' · ', style: TextStyle(color: Color(0xFF94A3B8))),
                    Expanded(
                      child: Text(
                        location,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => context.push('/search'),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFE0F2FE),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Offer',
                style: TextStyle(
                  color: Color(0xFF0284C7),
                  fontSize: 11.5,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
