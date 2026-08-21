import 'package:flutter/material.dart';

/// LINC Design System — Color Tokens
/// Source: LINC-REEACT/src/App.tsx
abstract class AppColors {
  // ── Brand ─────────────────────────────────────────────────────────────────
  static const Color primaryBlue = Color(0xFF7EC8E3);   // #7EC8E3 — header, cta, chips
  static const Color deepMidnight = Color(0xFF0F172A);  // #0F172A — primary text, dark buttons
  static const Color slateBlue = Color(0xFF1E5F7A);     // #1E5F7A — secondary on header

  // ── Accent / Intelligence ──────────────────────────────────────────────────
  static const Color cyan = Color(0xFF06B6D4);          // #06B6D4 — AI accents
  static const Color emerald = Color(0xFF10B981);       // #10B981 — confirmed / available
  static const Color emeraldLight = Color(0xFF34D399);  // #34D399 — light emerald
  static const Color indigo = Color(0xFF4338CA);        // #4338CA — AI button active
  static const Color indigoLight = Color(0xFF4F46E5);   // #4F46E5

  // ── Trust / Verification ──────────────────────────────────────────────────
  static const Color amber = Color(0xFFF59E0B);         // #F59E0B — verified badge, stars
  static const Color amberDark = Color(0xFFD97706);     // #D97706 — upcoming status

  // ── Semantic ──────────────────────────────────────────────────────────────
  static const Color red = Color(0xFFEF4444);           // #EF4444 — error, urgent
  static const Color redLight = Color(0xFFF87171);      // #F87171 — @AI text
  static const Color violet = Color(0xFF7C3AED);        // #7C3AED — provider avatar variant

  // ── Backgrounds ───────────────────────────────────────────────────────────
  static const Color appBackground = Color(0xFFF1F5F9); // #F1F5F9 — screen background
  static const Color cardSurface = Color(0xFFFFFFFF);   // #FFFFFF — card white
  static const Color offWhite = Color(0xFFF8FAFC);      // #F8FAFC — input bg, light card
  static const Color subtle = Color(0xFFF1F5F9);        // same as appBackground for list items
  static const Color headerBg = Color(0xFF7EC8E3);      // Same as primaryBlue

  // ── Text ──────────────────────────────────────────────────────────────────
  static const Color textPrimary = Color(0xFF0F172A);   // #0F172A
  static const Color textSecondary = Color(0xFF64748B); // #64748B
  static const Color textMuted = Color(0xFF94A3B8);     // #94A3B8
  static const Color textSlate = Color(0xFF334155);     // #334155
  static const Color textSlateLight = Color(0xFF475569);// #475569

  // ── Aliases ────────────────────────────────────────────────────────────────
  static const Color secondaryText = textSecondary;     // alias
  static const Color muted = textMuted;                 // alias

  // ── Borders / Dividers ────────────────────────────────────────────────────
  static const Color divider = Color(0xFFE2E8F0);       // #E2E8F0
  static const Color dividerSubtle = Color(0xFFF1F5F9); // #F1F5F9
  static const Color borderMuted = Color(0xFFCBD5E1);   // #CBD5E1

  // ── Semantic Backgrounds (tinted) ─────────────────────────────────────────
  static const Color emeraldBg = Color(0xFFECFDF5);     // #ECFDF5
  static const Color amberBg = Color(0xFFFFFBEB);       // #FFFBEB
  static const Color redBg = Color(0xFFFEF2F2);         // #FEF2F2
  static const Color indigoBg = Color(0xFFFAFBFF);      // #FAFBFF

  // ── Avatar Palette (provider colors in mock data) ─────────────────────────
  static const Color avatarTeal = Color(0xFF7EC8E3);
  static const Color avatarCyan = Color(0xFF0891B2);
  static const Color avatarGreen = Color(0xFF059669);
  static const Color avatarViolet = Color(0xFF7C3AED);
  static const Color avatarAmber = Color(0xFFD97706);
  static const Color avatarDarkTeal = Color(0xFF0F766E);
}
