import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'user_avatar.dart';

class AvatarPickerDialog {
  AvatarPickerDialog._();

  static const List<String> presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  ];

  static Future<void> show({
    required BuildContext context,
    required String? currentAvatarUrl,
    required String initials,
    required Future<void> Function(String? newAvatarUrl) onAvatarSelected,
  }) async {
    final picker = ImagePicker();

    Future<void> pickAndProcess(ImageSource source) async {
      try {
        final picked = await picker.pickImage(
          source: source,
          maxWidth: 600,
          maxHeight: 600,
          imageQuality: 80,
        );

        if (picked != null) {
          final bytes = await picked.readAsBytes();
          final base64String = base64Encode(bytes);
          final dataUri = 'data:image/jpeg;base64,$base64String';
          await onAvatarSelected(dataUri);
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Could not access image: $e')),
          );
        }
      }
    }

    void showUrlInput() {
      final urlController = TextEditingController(
        text: (currentAvatarUrl?.startsWith('http') == true) ? currentAvatarUrl : '',
      );

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Enter Image URL', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
          content: TextField(
            controller: urlController,
            autofocus: true,
            decoration: const InputDecoration(
              hintText: 'https://example.com/photo.jpg',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A),
                foregroundColor: Colors.white,
              ),
              onPressed: () async {
                final url = urlController.text.trim();
                Navigator.pop(ctx);
                if (url.isNotEmpty) {
                  await onAvatarSelected(url);
                }
              },
              child: const Text('Save Photo'),
            ),
          ],
        ),
      );
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    UserAvatar(
                      avatarUrl: currentAvatarUrl,
                      initials: initials,
                      size: 48,
                      borderRadius: 14,
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Profile Picture',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Upload a photo or choose from presets',
                            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                const SizedBox(height: 8),

                // Camera Option
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(10)),
                    alignment: Alignment.center,
                    child: const Icon(Icons.camera_alt_rounded, color: Color(0xFF0284C7), size: 20),
                  ),
                  title: const Text('Take Photo (Camera)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  onTap: () {
                    Navigator.pop(ctx);
                    pickAndProcess(ImageSource.camera);
                  },
                ),

                // Gallery Option
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(10)),
                    alignment: Alignment.center,
                    child: const Icon(Icons.photo_library_rounded, color: Color(0xFF059669), size: 20),
                  ),
                  title: const Text('Choose from Gallery', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  onTap: () {
                    Navigator.pop(ctx);
                    pickAndProcess(ImageSource.gallery);
                  },
                ),

                // Presets Section
                const SizedBox(height: 6),
                const Text(
                  'Or pick a preset avatar:',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 48,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: presetAvatars.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, i) {
                      final url = presetAvatars[i];
                      return GestureDetector(
                        onTap: () {
                          Navigator.pop(ctx);
                          onAvatarSelected(url);
                        },
                        child: UserAvatar(
                          avatarUrl: url,
                          initials: '',
                          size: 48,
                          borderRadius: 14,
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 14),

                // URL Input Option
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
                    alignment: Alignment.center,
                    child: const Icon(Icons.link_rounded, color: Color(0xFF475569), size: 20),
                  ),
                  title: const Text('Enter Web Image Link', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  onTap: () {
                    Navigator.pop(ctx);
                    showUrlInput();
                  },
                ),

                // Remove Photo Option (if already set)
                if (currentAvatarUrl != null && currentAvatarUrl.trim().isNotEmpty)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(10)),
                      alignment: Alignment.center,
                      child: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 20),
                    ),
                    title: const Text('Remove Photo', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFFEF4444))),
                    onTap: () {
                      Navigator.pop(ctx);
                      onAvatarSelected(null);
                    },
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
