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
import '../screens/provider/provider_setup_screen.dart';
import '../providers/app_provider.dart';
import '../widgets/bottom_nav.dart';

// ── Shell scaffold for tabbed navigation ──────────────────────────────────────
class AppShell extends ConsumerWidget {
  final Widget child;
  const AppShell({required this.child, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(appModeProvider);
    final isProvider = mode == AppMode.provider;
    final authState = ref.watch(authProvider);
    final isGuest = authState.isGuest && !authState.isAuthed;

    void gotoOrGate(String route, {bool requiresAuth = false}) {
      if (requiresAuth && isGuest) {
        // Show sign-in sheet
        showModalBottomSheet(
          context: context,
          backgroundColor: Colors.white,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          builder: (ctx) => Padding(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 40, height: 4, decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2))),
                const SizedBox(height: 20),
                Container(
                  width: 60, height: 60,
                  decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(18)),
                  alignment: Alignment.center,
                  child: const Icon(Icons.lock_outline_rounded, size: 28, color: Color(0xFF3B82F6)),
                ),
                const SizedBox(height: 14),
                const Text('Sign in to continue', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)), textAlign: TextAlign.center),
                const SizedBox(height: 6),
                const Text('Create a free account to access messaging, bookings, and more.', textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4)),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity, height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                    onPressed: () { Navigator.pop(ctx); context.go('/signup'); },
                    child: const Text('Create Account — Free', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity, height: 50,
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                    onPressed: () { Navigator.pop(ctx); context.go('/login'); },
                    child: const Text('Sign In', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF0F172A))),
                  ),
                ),
                const SizedBox(height: 14),
                GestureDetector(onTap: () => Navigator.pop(ctx), child: const Text('Continue exploring as guest', style: TextStyle(fontSize: 12.5, color: Color(0xFF94A3B8)))),
              ],
            ),
          ),
        );
      } else {
        context.go(route);
      }
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: LincBottomNav(
        isProvider: isProvider,
        onTap: (index) {
          if (isProvider) {
            switch (index) {
              case 0: gotoOrGate('/home'); break;
              case 1: gotoOrGate('/messages', requiresAuth: true); break;
              case 2: gotoOrGate('/bookings', requiresAuth: true); break;
              case 3: gotoOrGate('/profile', requiresAuth: true); break;
            }
          } else {
            switch (index) {
              case 0: gotoOrGate('/home'); break;
              case 1: gotoOrGate('/messages', requiresAuth: true); break;
              case 2: gotoOrGate('/ai', requiresAuth: true); break;
              case 3: gotoOrGate('/bookings', requiresAuth: true); break;
              case 4: gotoOrGate('/profile', requiresAuth: true); break;
            }
          }
        },
        currentIndex: _indexFromLocation(GoRouterState.of(context).uri.path, isProvider),
      ),
    );
  }

  int _indexFromLocation(String path, bool isProvider) {
    if (path.startsWith('/home') || path == '/') return 0;
    if (path.startsWith('/messages')) return 1;
    if (isProvider) {
      // Provider: Home | Chat | Bookings | Me  (no AI)
      if (path.startsWith('/bookings')) return 2;
      if (path.startsWith('/profile')) return 3;
    } else {
      // Client: Home | Chat | AI | Bookings | Me
      if (path.startsWith('/ai')) return 2;
      if (path.startsWith('/bookings')) return 3;
      if (path.startsWith('/profile')) return 4;
    }
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
  final authState = ref.watch(authProvider);
  final isAuthed = authState.isAuthed;
  final isGuest = authState.isGuest;
  final needsProviderSetup = ref.watch(needsProviderSetupProvider);

  return GoRouter(
    initialLocation: '/home',
    redirect: (context, state) {
      final path = state.uri.path;

      // Auth routes — always accessible
      final isAuthRoute = path.startsWith('/welcome') ||
          path.startsWith('/login') ||
          path.startsWith('/signup') ||
          path.startsWith('/forgot');

      // Routes accessible without signing in (explore/browse mode)
      final isPublicRoute = path.startsWith('/explore') ||
          path.startsWith('/search') ||
          path.startsWith('/provider/');

      // Guest can access public + home view; redirect anything else to welcome
      if (!isAuthed && isGuest) {
        // Guest trying to access auth screens → stay or go to explore
        if (isAuthRoute) return null;
        // Guest accessing public routes → allowed
        if (isPublicRoute || path.startsWith('/home')) return null;
        // Guest accessing protected routes (booking, messages, ai, profile) → welcome
        return '/welcome';
      }

      // Fully unauthenticated (no guest) → gate everything except auth + public
      if (!isAuthed && !isGuest) {
        if (isAuthRoute || isPublicRoute) return null;
        return '/welcome';
      }

      // Authenticated user landing on auth screen → go home (or provider setup)
      if (isAuthed && isAuthRoute) {
        if (needsProviderSetup) return '/provider-setup';
        return '/home';
      }

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
          final filter = state.uri.queryParameters['filter'];
          return SearchScreen(initialQuery: query, initialCategory: category, initialFilter: filter);
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
      GoRoute(path: '/provider-setup', builder: (_, __) => const ProviderSetupScreen()),
    ],
  );
});
