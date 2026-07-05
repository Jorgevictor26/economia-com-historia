import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,

      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.light,
        primary: AppColors.primary,
        secondary: AppColors.accentGold,
        surface: AppColors.cardBackground,
      ),

      scaffoldBackgroundColor: AppColors.soft,

      fontFamily: 'Geist',
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: 'Poppins'),
        displayMedium: TextStyle(fontFamily: 'Poppins'),
        displaySmall: TextStyle(fontFamily: 'Poppins'),
        headlineLarge: TextStyle(fontFamily: 'Poppins'),
        headlineMedium: TextStyle(fontFamily: 'Poppins'),
        headlineSmall: TextStyle(fontFamily: 'Poppins'),
        titleLarge: TextStyle(fontFamily: 'Poppins'),
        titleMedium: TextStyle(fontFamily: 'Poppins'),
        titleSmall: TextStyle(fontFamily: 'Poppins'),
        bodyLarge: TextStyle(fontFamily: 'Geist'),
        bodyMedium: TextStyle(fontFamily: 'Geist'),
        bodySmall: TextStyle(fontFamily: 'Geist'),
        labelLarge: TextStyle(fontFamily: 'Geist'),
        labelMedium: TextStyle(fontFamily: 'Geist'),
        labelSmall: TextStyle(fontFamily: 'Geist'),
      ),
    );
  }
}
