import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/colors.dart';
import '../../config/text_styles.dart';

class VerificationScreen extends StatefulWidget {
  const VerificationScreen({Key? key}) : super(key: key);

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen> {
  String? activeDoc;

  @override
  Widget build(BuildContext context) {
    final docs = [
      {'id': 'phone', 'icon': '📱', 'label': 'Phone Number', 'status': 'done', 'note': 'Verified via OTP'},
      {'id': 'id', 'icon': '🪪', 'label': 'National ID / Passport', 'status': 'required', 'note': 'Clear photo, all 4 corners visible'},
      {'id': 'photo', 'icon': '🤳', 'label': 'Profile Photo', 'status': 'required', 'note': 'Face clearly visible, no sunglasses'},
      {'id': 'address', 'icon': '🏠', 'label': 'Address Proof', 'status': 'optional', 'note': 'Utility bill or bank statement (optional)'},
    ];

    final steps = [
      {'label': 'Documents\nSubmitted', 'active': false, 'done': true},
      {'label': 'Under\nReview', 'active': false, 'done': false},
      {'label': 'Verified\n& Trusted', 'active': false, 'done': false},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7EC8E3),
        elevation: 0,
        leading: const BackButton(color: Color(0xFF1E5F7A)),
        title: const Text(
          'Trust & Verification',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 32),
        child: Column(
          children: [
            Container(
              color: const Color(0xFF7EC8E3),
              padding: const EdgeInsets.fromLTRB(20, 0, 24, 20),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: const Color(0x26F59E0B),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0x40F59E0B)),
                        ),
                        alignment: Alignment.center,
                        child: const Text('🛡️', style: TextStyle(fontSize: 24)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'LINC Verified Badge',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0F172A),
                                letterSpacing: -0.02,
                              ),
                            ),
                            SizedBox(height: 3),
                            Text(
                              'Complete the steps below to earn your badge',
                              style: TextStyle(fontSize: 12, color: Color(0xFF1E5F7A)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0x4CFFFFFF),
                      border: Border.all(color: const Color(0x80FFFFFF)),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    child: RichText(
                      text: const TextSpan(
                        text: 'Verified providers get ',
                        style: TextStyle(fontSize: 12, color: Color(0xFF1E3A4A)),
                        children: [
                          TextSpan(
                            text: '3× more bookings',
                            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFF59E0B)),
                          ),
                          TextSpan(text: ' and appear at the top of every search result.'),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              margin: const EdgeInsets.only(bottom: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'VERIFICATION PROGRESS',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0F172A),
                      letterSpacing: 0.04, // 0.04em
                    ),
                  ),
                  const SizedBox(height: 14),
                  Stack(
                    children: [
                      Positioned(
                        top: 15,
                        left: MediaQuery.of(context).size.width * 0.1667, // rough 16.67%
                        right: MediaQuery.of(context).size.width * 0.1667,
                        child: Container(
                          height: 2,
                          color: const Color(0xFFF1F5F9),
                        ),
                      ),
                      Row(
                        children: steps.map((step) {
                          bool done = step['done'] as bool;
                          bool active = step['active'] as bool;
                          String label = step['label'] as String;

                          return Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Container(
                                  width: 30,
                                  height: 30,
                                  decoration: BoxDecoration(
                                    color: done ? const Color(0xFF10B981) : (active ? const Color(0xFF7EC8E3) : const Color(0xFFF1F5F9)),
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: done ? const Color(0xFF10B981) : (active ? const Color(0xFF7EC8E3) : const Color(0xFFE2E8F0)),
                                    ),
                                  ),
                                  alignment: Alignment.center,
                                  child: done
                                      ? const Icon(Icons.check, color: Colors.white, size: 12)
                                      : Container(
                                          width: 7,
                                          height: 7,
                                          decoration: BoxDecoration(
                                            color: active ? Colors.white : const Color(0xFFCBD5E1),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                ),
                                const SizedBox(height: 8),
                                Column(
                                  children: label.split('\n').map((line) {
                                    return Text(
                                      line,
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: active ? FontWeight.w700 : FontWeight.w400,
                                        color: active ? const Color(0xFF0F172A) : const Color(0xFF94A3B8),
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              color: Colors.white,
              margin: const EdgeInsets.only(bottom: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: const BoxDecoration(
                      border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
                    ),
                    child: const Text('Required Documents', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
                  ),
                  ...docs.map((doc) {
                    bool isDone = doc['status'] == 'done';
                    bool isRequired = doc['status'] == 'required';
                    bool isOptional = doc['status'] == 'optional';
                    bool isActive = activeDoc == doc['id'];

                    return Column(
                      children: [
                        GestureDetector(
                          onTap: !isDone
                              ? () {
                                  setState(() {
                                    activeDoc = activeDoc == doc['id'] ? null : doc['id'] as String;
                                  });
                                }
                              : null,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: isActive ? const Color(0xFFFAFBFF) : Colors.white,
                              border: const Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: isDone ? const Color(0xFFD1FAE5) : const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(11),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(doc['icon'] as String, style: const TextStyle(fontSize: 16)),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(doc['label'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                                      const SizedBox(height: 2),
                                      Text(doc['note'] as String, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                                    ],
                                  ),
                                ),
                                Container(
                                  decoration: BoxDecoration(
                                    color: isDone
                                        ? const Color(0xFFD1FAE5)
                                        : (isRequired ? const Color(0xFFFFFBEB) : const Color(0xFFF1F5F9)),
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  child: Text(
                                    isDone ? '✓ Done' : (isRequired ? 'Needed' : 'Optional'),
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: isDone
                                          ? const Color(0xFF059669)
                                          : (isRequired ? const Color(0xFFD97706) : const Color(0xFF94A3B8)),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        if (isActive && !isDone)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: const BoxDecoration(
                              color: Color(0xFFF8FBFF),
                              border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: _buildUploadButton(Icons.upload_file_outlined, 'Upload File'),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: _buildUploadButton(Icons.camera_alt_outlined, 'Take Photo'),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Row(
                                  children: const [
                                    Icon(Icons.info_outline, color: Color(0xFF94A3B8), size: 12),
                                    SizedBox(width: 5),
                                    Text(
                                      'Documents are encrypted and never shared publicly.',
                                      style: TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                      ],
                    );
                  }).toList(),
                ],
              ),
            ),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              margin: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  const Text('🔒', style: TextStyle(fontSize: 20)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: RichText(
                      text: const TextSpan(
                        text: 'All documents are ',
                        style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                        children: [
                          TextSpan(
                            text: 'end-to-end encrypted',
                            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                          ),
                          TextSpan(text: ' and reviewed only by LINC\'s trust & safety team.'),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: GestureDetector(
                onTap: () {
                  // Submit
                },
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  alignment: Alignment.center,
                  child: const Text(
                    'Submit for Review',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUploadButton(IconData icon, String label) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        // Dashed border effect could be implemented via a custom painter or package, 
        // using solid here for simplicity in raw flutter
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
      child: Column(
        children: [
          Icon(icon, color: const Color(0xFF7EC8E3), size: 20),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Color(0xFF7EC8E3),
            ),
          ),
        ],
      ),
    );
  }
}
