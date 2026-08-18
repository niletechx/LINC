import 'package:flutter/material.dart';
import '../config/colors.dart';
import '../config/text_styles.dart';

/// LINC Bottom Navigation Bar
/// 5 items: Home | Chat | AI (center elevated) | Bookings | Me
/// Source: BottomNav component from LINC-REEACT/src/App.tsx lines 1785–1830
class LincBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const LincBottomNav({required this.currentIndex, required this.onTap, super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.cardSurface,
        border: Border(top: BorderSide(color: AppColors.divider, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 68,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _NavItem(icon: _homeIcon, label: 'Home', active: currentIndex == 0, onTap: () => onTap(0)),
              _NavItem(icon: _chatIcon, label: 'Chat', active: currentIndex == 1, onTap: () => onTap(1)),
              _AiNavItem(active: currentIndex == 2, onTap: () => onTap(2)),
              _NavItem(icon: _bookingsIcon, label: 'Bookings', active: currentIndex == 3, onTap: () => onTap(3)),
              _NavItem(icon: _profileIcon, label: 'Me', active: currentIndex == 4, onTap: () => onTap(4)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _homeIcon(bool active) => Icon(
    active ? Icons.home_rounded : Icons.home_outlined,
    color: active ? AppColors.primaryBlue : AppColors.textMuted,
    size: 24,
  );

  Widget _chatIcon(bool active) => Icon(
    active ? Icons.chat_bubble_rounded : Icons.chat_bubble_outline_rounded,
    color: active ? AppColors.primaryBlue : AppColors.textMuted,
    size: 22,
  );

  Widget _bookingsIcon(bool active) => Icon(
    active ? Icons.calendar_month_rounded : Icons.calendar_month_outlined,
    color: active ? AppColors.primaryBlue : AppColors.textMuted,
    size: 22,
  );

  Widget _profileIcon(bool active) => Icon(
    active ? Icons.person_rounded : Icons.person_outline_rounded,
    color: active ? AppColors.primaryBlue : AppColors.textMuted,
    size: 23,
  );
}

class _NavItem extends StatelessWidget {
  final Widget Function(bool) icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _NavItem({required this.icon, required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            icon(active),
            const SizedBox(height: 3),
            Text(
              label,
              style: active
                  ? AppTextStyles.navLabelActive()
                  : AppTextStyles.navLabel(),
            ),
          ],
        ),
      ),
    );
  }
}

class _AiNavItem extends StatelessWidget {
  final bool active;
  final VoidCallback onTap;
  const _AiNavItem({required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            // Elevated AI button — floats above the bar
            Transform.translate(
              offset: const Offset(0, -10),
              child: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: active
                        ? [const Color(0xFF4338CA), const Color(0xFF0891B2)]
                        : [AppColors.primaryBlue, AppColors.cyan],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: active
                          ? const Color(0xFF4F46E5).withOpacity(0.5)
                          : const Color(0xFF4F46E5).withOpacity(0.3),
                      blurRadius: active ? 18 : 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Center(
                  child: Text('✨', style: TextStyle(fontSize: 20)),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text(
                'AI',
                style: active
                    ? AppTextStyles.navLabelActive()
                    : AppTextStyles.navLabel(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
