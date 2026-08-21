import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linc_mobile/main.dart';

void main() {
  testWidgets('LINC app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: LincApp()),
    );
    // App should render without crashing
    await tester.pump();
  });
}
