import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AuthStage { welcome, login, signup, forgot }

class AuthState {
  final bool isAuthed;
  final AuthStage stage;
  const AuthState({this.isAuthed = false, this.stage = AuthStage.welcome});
  AuthState copyWith({bool? isAuthed, AuthStage? stage}) =>
      AuthState(isAuthed: isAuthed ?? this.isAuthed, stage: stage ?? this.stage);
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState());
  void setStage(AuthStage stage) => state = state.copyWith(stage: stage);
  void signIn() => state = state.copyWith(isAuthed: true);
  void signOut() => state = const AuthState();
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);
