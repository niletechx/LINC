import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';

class AuthState {
  final bool isAuthed;
  final UserModel? user;
  final String? token;
  final bool isLoading;
  final String? error;
  final bool isInitialized;

  const AuthState({
    this.isAuthed = false,
    this.user,
    this.token,
    this.isLoading = false,
    this.error,
    this.isInitialized = false,
  });

  AuthState copyWith({
    bool? isAuthed,
    UserModel? user,
    String? token,
    bool? isLoading,
    String? error,
    bool? isInitialized,
  }) {
    return AuthState(
      isAuthed: isAuthed ?? this.isAuthed,
      user: user ?? this.user,
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isInitialized: isInitialized ?? this.isInitialized,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService = AuthService();

  AuthNotifier() : super(const AuthState(isInitialized: true, isAuthed: false)) {
    initialize();
  }

  Future<void> initialize() async {
    try {
      await StorageService.clear();
    } catch (_) {}
    state = const AuthState(isInitialized: true, isAuthed: false, user: null, token: null);
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _authService.login(email: email, password: password);
      state = state.copyWith(
        isAuthed: true,
        user: result.user,
        token: result.token,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String fullName,
    required String username,
    String? phone,
    String? locationCity,
    String? role,
    String? headline,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _authService.register(
        email: email,
        password: password,
        fullName: fullName,
        username: username,
        phone: phone,
        locationCity: locationCity,
        role: role,
        headline: headline,
      );
      state = state.copyWith(
        isAuthed: true,
        user: result.user,
        token: result.token,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> signOut() async {
    state = state.copyWith(isLoading: true);
    await _authService.logout();
    await StorageService.clear();
    state = const AuthState(isInitialized: true, isAuthed: false, user: null, token: null);
  }

  void signIn() {
    state = state.copyWith(isAuthed: true);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);
