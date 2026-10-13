import 'package:flutter/material.dart';
import '../../config/colors.dart';

/// Screen presenting Terms of Service, Privacy Policy, and Escrow Protection rules.
class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text(
          'Terms & Privacy',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppColors.divider),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection(
              title: '1. Acceptance of Terms',
              content:
                  'By registering, browsing, or utilizing the LINC platform, you agree to comply with all applicable terms, verification procedures, and community standards.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: '2. User Roles & Identity',
              content:
                  'Users may operate as Requesters, Service Providers, or Business Organizations. Users are responsible for providing authentic credentials. Misrepresentation or fraudulent account creation results in immediate suspension.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: '3. Escrow Vault & Payments',
              content:
                  'All transactions initiated on LINC are safeguarded by our automated escrow system. Funds remain securely locked until the client confirms job completion. If unconfirmed after 72 hours without an active dispute, funds release automatically to the provider.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: '4. Privacy & Data Protection',
              content:
                  'We enforce row-level security (RLS) on all database interactions. Personal contact information, location coordinates, and payment references are encrypted and never sold to third-party advertisers.',
            ),
            const SizedBox(height: 14),
            _buildSection(
              title: '5. Community Moderation',
              content:
                  'Harassment, off-platform payment evasion, and submitting fraudulent ratings are strictly prohibited. The administration team investigates all flagged reports.',
            ),
            const SizedBox(height: 24),
            Center(
              child: Text(
                'Last updated: October 2026',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _buildSection({required String title, required String content}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: const TextStyle(
              fontSize: 13,
              height: 1.5,
              color: AppColors.textSlate,
            ),
          ),
        ],
      ),
    );
  }
}
