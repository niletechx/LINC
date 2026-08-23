import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/splash/splash_screen.dart';
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
        context.go('/welcome');
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
              case 1: gotoOrGate('/messages'); break;                      // guests allowed
              case 2: gotoOrGate('/bookings', requiresAuth: true); break;
              case 3: gotoOrGate('/profile', requiresAuth: true); break;
            }
          } else {
            switch (index) {
              case 0: gotoOrGate('/home'); break;
              case 1: gotoOrGate('/messages'); break;                      // guests allowed
              case 2: gotoOrGate('/ai'); break;                            // guests allowed
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
//
// IMPORTANT: The GoRouter must be a stable singleton. Using ref.watch on
// authProvider inside this Provider would cause a brand-new GoRouter (with
// initialLocation='/splash') to be created every time auth state changes,
// resetting navigation to the splash screen in an infinite loop.
//
// Fix: create the router once, then use ref.listen + router.refresh() so the
// existing redirect callback re-runs with up-to-date state — without
// recreating the router.
final routerProvider = Provider<GoRouter>((ref) {

  final router = GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      // Read current values each time the redirect runs — not stale closures.
      final authState = ref.read(authProvider);
      final isAuthed = authState.isAuthed;
      final needsProviderSetup = ref.read(needsProviderSetupProvider);

      final path = state.uri.path;

      // Splash route — always allowed
      if (path == '/splash') return null;

      // Auth routes — always accessible
      final isAuthRoute = path.startsWith('/welcome') ||
          path.startsWith('/login') ||
          path.startsWith('/signup') ||
          path.startsWith('/forgot');

      // Public / exploration routes — accessible without signing in
      final isPublicRoute = path.startsWith('/home') ||
          path.startsWith('/explore') ||
          path.startsWith('/search') ||
          path.startsWith('/provider/') ||
          path.startsWith('/ai') ||
          path.startsWith('/messages') ||
          path.startsWith('/dm/');

      // Unauthenticated users: allow home and public explore routes
      if (!isAuthed) {
        if (isAuthRoute || isPublicRoute) return null;
        // Only protected pages (bookings, profile, booking flow, provider setup) require sign-in
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
      // ── Splash route ───────────────────────────────────────────────────────
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),

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

  // When auth state changes, tell the existing router to re-run its redirect
  // callback — without creating a new GoRouter (which would reset navigation
  // to initialLocation: '/splash').
  ref.listen(authProvider, (_, __) => router.refresh());
  ref.listen(needsProviderSetupProvider, (_, __) => router.refresh());

  return router;
});
