import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../config/colors.dart';

/// Reusable shimmer placeholder container with rounded corners.
class ShimmerBox extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ShimmerBox({
    required this.width,
    required this.height,
    this.borderRadius = 6,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.divider,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}

/// Shimmer loader skeleton for the home horizontal ProviderCard (width: 148).
class ShimmerProviderCard extends StatelessWidget {
  const ShimmerProviderCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 148,
      decoration: const BoxDecoration(
        color: AppColors.cardSurface,
        border: Border(right: BorderSide(color: AppColors.dividerSubtle, width: 1)),
      ),
      padding: const EdgeInsets.all(12),
      child: Shimmer.fromColors(
        baseColor: const Color(0xFFE2E8F0),
        highlightColor: const Color(0xFFF8FAFC),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const ShimmerBox(width: 44, height: 44, borderRadius: 14),
            const SizedBox(height: 10),
            const ShimmerBox(width: 80, height: 14),
            const SizedBox(height: 6),
            const ShimmerBox(width: 110, height: 11),
            const SizedBox(height: 10),
            Row(
              children: const [
                ShimmerBox(width: 14, height: 14, borderRadius: 4),
                SizedBox(width: 4),
                ShimmerBox(width: 24, height: 12),
                SizedBox(width: 6),
                ShimmerBox(width: 40, height: 12),
              ],
            ),
            const SizedBox(height: 12),
            const ShimmerBox(width: double.infinity, height: 28, borderRadius: 8),
          ],
        ),
      ),
    );
  }
}

/// Shimmer loader skeleton for search results and provider list tiles.
class ShimmerListTile extends StatelessWidget {
  const ShimmerListTile({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        color: AppColors.cardSurface,
        border: Border(bottom: BorderSide(color: AppColors.dividerSubtle, width: 1)),
      ),
      child: Shimmer.fromColors(
        baseColor: const Color(0xFFE2E8F0),
        highlightColor: const Color(0xFFF8FAFC),
        child: Row(
          children: [
            const ShimmerBox(width: 46, height: 46, borderRadius: 14),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  ShimmerBox(width: 120, height: 14),
                  SizedBox(height: 6),
                  ShimmerBox(width: 180, height: 12),
                  SizedBox(height: 8),
                  ShimmerBox(width: 90, height: 11),
                ],
              ),
            ),
            const SizedBox(width: 12),
            const ShimmerBox(width: 36, height: 36, borderRadius: 18),
          ],
        ),
      ),
    );
  }
}

/// Shimmer loader skeleton for booking cards.
class ShimmerBookingCard extends StatelessWidget {
  const ShimmerBookingCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: Shimmer.fromColors(
        baseColor: const Color(0xFFE2E8F0),
        highlightColor: const Color(0xFFF8FAFC),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                ShimmerBox(width: 140, height: 16),
                ShimmerBox(width: 60, height: 20, borderRadius: 10),
              ],
            ),
            const SizedBox(height: 12),
            const ShimmerBox(width: double.infinity, height: 13),
            const SizedBox(height: 6),
            const ShimmerBox(width: 200, height: 13),
            const SizedBox(height: 16),
            Row(
              children: const [
                ShimmerBox(width: 16, height: 16, borderRadius: 4),
                SizedBox(width: 6),
                ShimmerBox(width: 100, height: 12),
                Spacer(),
                ShimmerBox(width: 80, height: 14),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
