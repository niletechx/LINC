import 'package:flutter/material.dart';
import '../config/app_config.dart';

class ServerConfigDialog extends StatefulWidget {
  const ServerConfigDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (ctx) => const ServerConfigDialog(),
    );
  }

  @override
  State<ServerConfigDialog> createState() => _ServerConfigDialogState();
}

class _ServerConfigDialogState extends State<ServerConfigDialog> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: AppConfig.baseUrl);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Row(
        children: [
          Icon(Icons.dns_rounded, color: Color(0xFF0284C7)),
          SizedBox(width: 8),
          Text(
            'Server Connection',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Backend API & Socket.IO Host:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _controller,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              decoration: InputDecoration(
                hintText: 'http://10.186.1.187:5000',
                labelText: 'Base URL',
                prefixIcon: const Icon(Icons.link_rounded, size: 20),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'Quick Presets:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _buildPresetChip(
                  label: 'Vercel Cloud',
                  url: 'https://linc-backend.vercel.app',
                  icon: Icons.bolt_rounded,
                ),
                _buildPresetChip(
                  label: 'Render Cloud',
                  url: 'https://linc-backend-2zcf.onrender.com',
                  icon: Icons.cloud_done_rounded,
                ),
                _buildPresetChip(
                  label: 'Wi-Fi PC (192.168.147.214)',
                  url: 'http://192.168.147.214:5000',
                  icon: Icons.wifi,
                ),
                _buildPresetChip(
                  label: 'USB adb reverse (127.0.0.1)',
                  url: 'http://127.0.0.1:5000',
                  icon: Icons.usb,
                ),
                _buildPresetChip(
                  label: 'Android Emulator (10.0.2.2)',
                  url: 'http://10.0.2.2:5000',
                  icon: Icons.phone_android,
                ),
              ],
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F9FF),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFBAE6FD)),
              ),
              child: Text(
                'Current REST API: ${AppConfig.apiUrl}\nSocket.IO: ${AppConfig.socketUrl}',
                style: const TextStyle(fontSize: 11, color: Color(0xFF0369A1), height: 1.4),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () async {
            final nav = Navigator.of(context);
            final messenger = ScaffoldMessenger.of(context);
            await AppConfig.resetToDefault();
            nav.pop();
            messenger.showSnackBar(
              SnackBar(content: Text('Reset to default: ${AppConfig.baseUrl}')),
            );
          },
          child: const Text('Reset', style: TextStyle(color: Color(0xFF64748B))),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0F172A),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: () async {
            final target = _controller.text.trim();
            if (target.isNotEmpty) {
              final nav = Navigator.of(context);
              final messenger = ScaffoldMessenger.of(context);
              await AppConfig.setBaseUrl(target);
              nav.pop();
              messenger.showSnackBar(
                SnackBar(
                  content: Text('Server updated to: ${AppConfig.baseUrl}'),
                  backgroundColor: const Color(0xFF10B981),
                ),
              );
            }
          },
          child: const Text('Save & Apply'),
        ),
      ],
    );
  }

  Widget _buildPresetChip({required String label, required String url, required IconData icon}) {
    final isSelected = _controller.text.trim() == url;
    return ActionChip(
      avatar: Icon(icon, size: 14, color: isSelected ? Colors.white : const Color(0xFF0284C7)),
      backgroundColor: isSelected ? const Color(0xFF0284C7) : const Color(0xFFF1F5F9),
      label: Text(
        label,
        style: TextStyle(
          fontSize: 11.5,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
          color: isSelected ? Colors.white : const Color(0xFF1E293B),
        ),
      ),
      onPressed: () {
        setState(() {
          _controller.text = url;
        });
      },
    );
  }
}
