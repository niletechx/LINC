import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/welcome_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/auth/forgot_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/home/provider_dashboard.dart';
import '../screens/search/search_screen.dart';
import '../screens/ai/ai_screen.dart';
import '../screens/provider/provider_profile_screen.dart';
import '../screens/booking/booking_flow_screen.dart';
import '../screens/booking/bookings_screen.dart';
import '../screens/messages/messages_screen.dart';
import '../screens/messages/dm_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/verification_screen.dart';
import '../providers/app_provider.dart';
import '../widgets/bottom_nav.dart';

// ── Shell scaffold for tabbed navigation ──────────────────────────────────────
class AppShell extends ConsumerWidget {
  final Widget child;
  const AppShell({required this.child, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: child,
      bottomNavigationBar: LincBottomNav(
        onTap: (index) {
          switch (index) {
            case 0: context.go('/home'); break;
            case 1: context.go('/messages'); break;
            case 2: context.go('/ai'); break;
            case 3: context.go('/bookings'); break;
            case 4: context.go('/profile'); break;
          }
        },
        currentIndex: _indexFromLocation(GoRouterState.of(context).uri.path),
      ),
    );
  }

  int _indexFromLocation(String path) {
    if (path.startsWith('/home') || path == '/') return 0;
    if (path.startsWith('/messages')) return 1;
    if (path.startsWith('/ai')) return 2;
    if (path.startsWith('/bookings')) return 3;
    if (path.startsWith('/profile')) return 4;
    return 0;
  }
}

class HomeModeWrapper extends ConsumerWidget {
  const HomeModeWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(appModeProvider);
    return mode == AppMode.client ? const HomeScreen() : const ProviderDashboard();
  }
}

// ── Router ────────────────────────────────────────────────────────────────────
final routerProvider = Provider<GoRouter>((ref) {
  final isAuthed = ref.watch(authProvider.select((state) => state.isAuthed));

  return GoRouter(
    initialLocation: '/welcome',
    redirect: (context, state) {
      final isAuthRoute = state.uri.path.startsWith('/welcome') ||
          state.uri.path.startsWith('/login') ||
          state.uri.path.startsWith('/signup') ||
          state.uri.path.startsWith('/forgot');
      if (!isAuthed && !isAuthRoute) return '/welcome';
      if (isAuthed && isAuthRoute) return '/home';
      return null;
    },
    routes: [
      // ── Auth routes ────────────────────────────────────────────────────────
      GoRoute(path: '/welcome', builder: (_, __) => const WelcomeScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/signup', builder: (_, __) => const SignupScreen()),
      GoRoute(path: '/forgot', builder: (_, __) => const ForgotScreen()),

      // ── Shell (tabbed) routes ──────────────────────────────────────────────
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeModeWrapper(),
          ),
          GoRoute(path: '/ai', builder: (_, __) => const AiScreen()),
          GoRoute(path: '/messages', builder: (_, __) => const MessagesScreen()),
          GoRoute(path: '/bookings', builder: (_, __) => const BookingsScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ],
      ),

      // ── Full-screen routes (no bottom nav) ────────────────────────────────
      GoRoute(
        path: '/provider/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '1';
          return ProviderProfileScreen(providerId: id);
        },
      ),
      GoRoute(
        path: '/dm/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '1';
          return DmScreen(conversationId: id);
        },
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) {
          final query = state.uri.queryParameters['query'];
          final category = state.uri.queryParameters['category'];
          return SearchScreen(initialQuery: query, initialCategory: category);
        },
      ),
      GoRoute(
        path: '/booking/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '1';
          return BookingFlowScreen(providerId: id);
        },
      ),
      GoRoute(path: '/verification', builder: (_, __) => const VerificationScreen()),
    ],
  );
});
