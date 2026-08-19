import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AppMode { client, provider }

/// Current mode: client or provider
final appModeProvider = StateProvider<AppMode>((ref) => AppMode.client);

/// Provider availability toggle (for provider dashboard)
final availabilityProvider = StateProvider<bool>((ref) => true);

/// Active booking tab
enum BookingTab { active, upcoming, completed }
final bookingTabProvider = StateProvider<BookingTab>((ref) => BookingTab.active);

/// Tracks if new provider user needs onboarding profile setup
final needsProviderSetupProvider = StateProvider<bool>((ref) => false);
