import 'package:flutter/material.dart';
import '../config/colors.dart';
import '../config/text_styles.dart';

/// LINC Bottom Navigation Bar
/// Client mode (5 items): Home | Chat | AI (center elevated) | Bookings | Me
/// Provider mode (4 items): Home | Chat | Bookings | Me  — no AI tab
class LincBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final bool isProvider;

  const LincBottomNav({
    required this.currentIndex,
    required this.onTap,
    this.isProvider = false,
    super.key,
  });

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
            children: isProvider
                ? [
                    // Provider: 4 tabs — Home | Chat | Bookings | Me
                    _NavItem(icon: _homeIcon, label: 'Home', active: currentIndex == 0, onTap: () => onTap(0)),
                    _NavItem(icon: _chatIcon, label: 'Chat', active: currentIndex == 1, onTap: () => onTap(1)),
                    _NavItem(icon: _bookingsIcon, label: 'Bookings', active: currentIndex == 2, onTap: () => onTap(2)),
                    _NavItem(icon: _profileIcon, label: 'Me', active: currentIndex == 3, onTap: () => onTap(3)),
                  ]
                : [
                    // Client: 5 tabs — Home | Chat | AI | Bookings | Me
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
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
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
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: SizedBox(
          height: 62,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.center,
            children: [
              Positioned(
                top: -12,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: active
                              ? const [Color(0xFF4338CA), Color(0xFF0891B2)]
                              : const [AppColors.primaryBlue, AppColors.cyan],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: active
                                ? const Color(0xFF4F46E5).withValues(alpha: 0.45)
                                : const Color(0xFF4F46E5).withValues(alpha: 0.25),
                            blurRadius: active ? 16 : 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(Icons.auto_awesome, size: 20, color: Colors.white),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'AI',
                      style: active
                          ? AppTextStyles.navLabelActive()
                          : AppTextStyles.navLabel(),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
