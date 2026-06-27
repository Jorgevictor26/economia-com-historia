import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:economica_com_historia/main.dart';
import 'package:economica_com_historia/screens/onboarding_screen.dart';

void main() {
  testWidgets('EconomiaApp builds the root MaterialApp', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues({'onboarding_done': false});

    await tester.pumpWidget(const EconomiaApp());

    expect(find.byType(MaterialApp), findsOneWidget);

    await tester.pump(const Duration(seconds: 3));
    await tester.pump();

    expect(find.byType(OnboardingScreen), findsOneWidget);
  });
}
