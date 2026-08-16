import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/conversation_model.dart';
import '../data/mock_data.dart';

class DMState {
  final Map<int, List<DMMessage>> messages;
  final Map<int, bool> showAITrust;
  final String input;
  const DMState({required this.messages, required this.showAITrust, this.input = ''});
  DMState copyWith({Map<int, List<DMMessage>>? messages, Map<int, bool>? showAITrust, String? input}) =>
      DMState(messages: messages ?? this.messages, showAITrust: showAITrust ?? this.showAITrust, input: input ?? this.input);
}

class DMNotifier extends StateNotifier<DMState> {
  DMNotifier() : super(DMState(messages: Map.from(MockData.dmSeed), showAITrust: {}));

  void setInput(String v) => state = state.copyWith(input: v);

  Future<void> send(int convId) async {
    final text = state.input.trim();
    if (text.isEmpty) return;
    final msgs = {...state.messages};
    msgs[convId] = [...(msgs[convId] ?? []), DMMessage(fromMe: true, text: text, time: 'now')];
    final triggerAI = text.toLowerCase().contains('@ai');
    state = state.copyWith(messages: msgs, input: '');
    if (triggerAI) {
      await Future.delayed(const Duration(milliseconds: 600));
      final trust = {...state.showAITrust, convId: true};
      state = state.copyWith(showAITrust: trust);
    }
  }

  void dismissTrust(int convId) {
    final trust = {...state.showAITrust, convId: false};
    state = state.copyWith(showAITrust: trust);
  }
}

final dmProvider = StateNotifierProvider<DMNotifier, DMState>(
  (ref) => DMNotifier(),
);
