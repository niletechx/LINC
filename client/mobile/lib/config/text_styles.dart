import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

/// LINC Typography System
/// Font: Inter (Google Fonts)
/// Source: LINC-REEACT/src/imports/pasted_text/linc-app-design.md
abstract class AppTextStyles {
  // ── Display / Hero ─────────────────────────────────────────────────────────
  static TextStyle display({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 30, fontWeight: FontWeight.w800, color: color, letterSpacing: -0.6, height: 1.15);

  static TextStyle displayMd({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 26, fontWeight: FontWeight.w800, color: color, letterSpacing: -0.5, height: 1.2);

  // ── Screen Titles ──────────────────────────────────────────────────────────
  static TextStyle title({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w800, color: color, letterSpacing: -0.4, height: 1.25);

  static TextStyle titleSm({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800, color: color, letterSpacing: -0.3);

  // ── Section Headers ────────────────────────────────────────────────────────
  static TextStyle sectionHeader({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: color, letterSpacing: -0.2);

  static TextStyle sectionHeaderSm({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: color, letterSpacing: -0.1);

  // ── Body ──────────────────────────────────────────────────────────────────
  static TextStyle bodyLg({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500, color: color, height: 1.6);

  static TextStyle body({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: color, height: 1.55);

  static TextStyle bodySm({Color color = AppColors.textSecondary}) =>
      GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: color, height: 1.5);

  static TextStyle bodyXs({Color color = AppColors.textMuted}) =>
      GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: color, height: 1.5);

  // ── Labels / Bold ─────────────────────────────────────────────────────────
  static TextStyle labelLg({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: color);

  static TextStyle label({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: color);

  static TextStyle labelSm({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: color);

  // ── Captions / Badges ─────────────────────────────────────────────────────
  static TextStyle caption({Color color = AppColors.textMuted}) =>
      GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: color);

  static TextStyle captionBold({Color color = AppColors.textMuted}) =>
      GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: color, letterSpacing: 0.3);

  static TextStyle badge({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: color, letterSpacing: 0.6);

  static TextStyle badgeSm({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w800, color: color, letterSpacing: 0.4);

  // ── Button ────────────────────────────────────────────────────────────────
  static TextStyle button({Color color = Colors.white}) =>
      GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700, color: color);

  static TextStyle buttonSm({Color color = Colors.white}) =>
      GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: color);

  static TextStyle buttonXs({Color color = Colors.white}) =>
      GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800, color: color);

  // ── Price / Metric ────────────────────────────────────────────────────────
  static TextStyle metric({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w800, color: color, letterSpacing: -0.4);

  static TextStyle metricSm({Color color = AppColors.textPrimary}) =>
      GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w800, color: color, letterSpacing: -0.2);

  // ── Navigation ────────────────────────────────────────────────────────────
  static TextStyle navLabel({Color color = AppColors.textMuted}) =>
      GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600, color: color);

  static TextStyle navLabelActive({Color color = AppColors.primaryBlue}) =>
      GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: color);
}
