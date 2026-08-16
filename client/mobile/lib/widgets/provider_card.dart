import 'package:flutter/material.dart';
import '../config/colors.dart';
import '../config/text_styles.dart';
import '../models/provider_model.dart';

/// Provider card — used in Home "Verified Nearby" horizontal list & Search results
/// Source: HomeScreen + SearchScreen in App.tsx
class ProviderCard extends StatelessWidget {
  final ProviderModel provider;
  final VoidCallback onTap;
  final bool showMatch;

  const ProviderCard({
    required this.provider,
    required this.onTap,
    this.showMatch = true,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 148,
        decoration: const BoxDecoration(
          color: AppColors.cardSurface,
          border: Border(right: BorderSide(color: AppColors.dividerSubtle, width: 1)),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar + verified badge
            SizedBox(
              width: 44,
              height: 44,
              child: Stack(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: provider.color,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      provider.initials,
                      style: AppTextStyles.label(color: Colors.white).copyWith(fontSize: 15),
                    ),
                  ),
                  if (provider.verified)
                    Positioned(
                      bottom: -2, right: -2,
                      child: Container(
                        width: 16, height: 16,
                        decoration: BoxDecoration(
                          color: AppColors.amber,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: const Center(
                          child: Icon(Icons.check, color: Colors.white, size: 8),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            // Name
            Text(
              provider.name.split(' ').first,
              style: AppTextStyles.label(color: AppColors.textPrimary).copyWith(fontSize: 13),
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            // Headline
            Text(
              provider.headline.split(' ').take(3).join(' '),
              style: AppTextStyles.caption(),
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            // Rating + distance
            Row(
              children: [
                Text('★ ${provider.rating}', style: AppTextStyles.captionBold(color: AppColors.amber)),
                const SizedBox(width: 4),
                Text('·', style: AppTextStyles.caption(color: AppColors.borderMuted)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(provider.distance, style: AppTextStyles.caption(), overflow: TextOverflow.ellipsis),
                ),
              ],
            ),
            const SizedBox(height: 10),
            // Book button
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.primaryBlue,
                borderRadius: BorderRadius.circular(8),
              ),
              alignment: Alignment.center,
              child: Text('Book', style: AppTextStyles.buttonXs(color: AppColors.textPrimary)),
            ),
          ],
        ),
      ),
    );
  }
}

/// Search result row provider card
class ProviderListTile extends StatelessWidget {
  final ProviderModel provider;
  final VoidCallback onTap;

  const ProviderListTile({required this.provider, required this.onTap, super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: const BoxDecoration(
          color: AppColors.cardSurface,
          border: Border(bottom: BorderSide(color: AppColors.dividerSubtle, width: 1)),
        ),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 46, height: 46,
              decoration: BoxDecoration(color: provider.color, borderRadius: BorderRadius.circular(14)),
              alignment: Alignment.center,
              child: Text(provider.initials, style: AppTextStyles.label(color: Colors.white).copyWith(fontSize: 15)),
            ),
            const SizedBox(width: 12),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(provider.name,
                          style: AppTextStyles.label(color: AppColors.textPrimary).copyWith(fontSize: 13.5),
                          overflow: TextOverflow.ellipsis),
                      ),
                      if (provider.verified) ...[
                        const SizedBox(width: 4),
                        const Text('🛡️', style: TextStyle(fontSize: 11)),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(provider.headline, style: AppTextStyles.bodyXs(), overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text('★ ${provider.rating}', style: AppTextStyles.captionBold(color: AppColors.amber).copyWith(fontSize: 11.5)),
                      const SizedBox(width: 4),
                      Text('·', style: AppTextStyles.caption(color: AppColors.borderMuted).copyWith(fontSize: 11)),
                      const SizedBox(width: 4),
                      Text('📍 ${provider.distance}', style: AppTextStyles.caption().copyWith(fontSize: 11)),
                      const SizedBox(width: 4),
                      Text('·', style: AppTextStyles.caption(color: AppColors.borderMuted).copyWith(fontSize: 11)),
                      const SizedBox(width: 4),
                      Text(provider.price, style: AppTextStyles.captionBold(color: AppColors.primaryBlue).copyWith(fontSize: 11)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Match ring
            MatchRing(match: provider.match),
          ],
        ),
      ),
    );
  }
}

/// Circular match score ring
class MatchRing extends StatelessWidget {
  final int match;
  const MatchRing({required this.match, super.key});

  @override
  Widget build(BuildContext context) {
    final color = match >= 90 ? AppColors.emerald : AppColors.cyan;
    return Container(
      width: 38, height: 38,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: color, width: 2.5),
      ),
      alignment: Alignment.center,
      child: Text(
        '$match%',
        style: AppTextStyles.badgeSm(color: color).copyWith(fontSize: 9, height: 1.2),
        textAlign: TextAlign.center,
      ),
    );
  }
}
