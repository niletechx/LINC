import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class UserAvatar extends StatelessWidget {
  final String? avatarUrl;
  final String initials;
  final double size;
  final Color? backgroundColor;
  final Color? textColor;
  final double borderRadius;
  final bool isCircle;
  final bool showEditBadge;
  final VoidCallback? onTap;

  const UserAvatar({
    super.key,
    this.avatarUrl,
    required this.initials,
    this.size = 50,
    this.backgroundColor,
    this.textColor,
    this.borderRadius = 16,
    this.isCircle = false,
    this.showEditBadge = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Widget avatarWidget = _buildAvatarContent();

    if (showEditBadge) {
      avatarWidget = Stack(
        clipBehavior: Clip.none,
        children: [
          avatarWidget,
          Positioned(
            bottom: -2,
            right: -2,
            child: Container(
              width: (size * 0.38).clamp(20.0, 32.0),
              height: (size * 0.38).clamp(20.0, 32.0),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.18),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Icon(
                Icons.camera_alt_rounded,
                size: (size * 0.20).clamp(11.0, 16.0),
                color: const Color(0xFF7EC8E3),
              ),
            ),
          ),
        ],
      );
    }

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: avatarWidget,
      );
    }

    return avatarWidget;
  }

  Widget _buildAvatarContent() {
    final effectiveBgColor = backgroundColor ?? const Color(0xFF1E5F7A);
    final effectiveTextColor = textColor ?? Colors.white;

    // Check if avatarUrl is provided and non-empty
    if (avatarUrl != null && avatarUrl!.trim().isNotEmpty) {
      final raw = avatarUrl!.trim();

      // 1. Base64 Data URL (e.g. data:image/jpeg;base64,...)
      if (raw.startsWith('data:image')) {
        try {
          final base64Str = raw.contains(',') ? raw.split(',')[1] : raw;
          final bytes = base64Decode(base64Str);
          return _wrapShape(
            Image.memory(
              bytes,
              width: size,
              height: size,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _buildFallback(effectiveBgColor, effectiveTextColor),
            ),
          );
        } catch (_) {
          return _buildFallback(effectiveBgColor, effectiveTextColor);
        }
      }

      // 2. HTTP / HTTPS Network URL
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        return _wrapShape(
          CachedNetworkImage(
            imageUrl: raw,
            width: size,
            height: size,
            fit: BoxFit.cover,
            placeholder: (context, url) => Container(
              width: size,
              height: size,
              color: effectiveBgColor.withValues(alpha: 0.2),
              alignment: Alignment.center,
              child: SizedBox(
                width: size * 0.4,
                height: size * 0.4,
                child: const CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF7EC8E3)),
              ),
            ),
            errorWidget: (context, url, error) => _buildFallback(effectiveBgColor, effectiveTextColor),
          ),
        );
      }
    }

    // Default Fallback: Initials with background color
    return _buildFallback(effectiveBgColor, effectiveTextColor);
  }

  Widget _wrapShape(Widget child) {
    if (isCircle) {
      return ClipOval(child: child);
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: child,
    );
  }

  Widget _buildFallback(Color bgColor, Color txtColor) {
    final cleanInitials = initials.trim().isEmpty ? 'U' : initials.trim();
    final fontSize = (size * 0.40).clamp(10.0, 32.0);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: bgColor,
        shape: isCircle ? BoxShape.circle : BoxShape.rectangle,
        borderRadius: isCircle ? null : BorderRadius.circular(borderRadius),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        cleanInitials,
        style: TextStyle(
          color: txtColor,
          fontSize: fontSize,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.5,
        ),
      ),
    );
  }
}
