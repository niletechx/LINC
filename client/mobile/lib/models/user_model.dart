class UserModel {
  final String id;
  final String email;
  final String username;
  final String fullName;
  final String? avatarUrl;
  final String? phone;
  final String role;
  final bool isAdmin;
  final bool isActive;

  const UserModel({
    required this.id,
    required this.email,
    required this.username,
    required this.fullName,
    this.avatarUrl,
    this.phone,
    this.role = 'client',
    this.isAdmin = false,
    this.isActive = true,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      username: json['username'] as String? ?? '',
      fullName: json['full_name'] as String? ?? json['fullName'] as String? ?? '',
      avatarUrl: json['avatar_url'] as String? ?? json['avatarUrl'] as String?,
      phone: json['phone'] as String?,
      role: json['role'] as String? ?? 'client',
      isAdmin: json['is_admin'] as bool? ?? json['isAdmin'] as bool? ?? false,
      isActive: json['is_active'] as bool? ?? json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'username': username,
      'full_name': fullName,
      'avatar_url': avatarUrl,
      'phone': phone,
      'role': role,
      'is_admin': isAdmin,
      'is_active': isActive,
    };
  }

  String get initials {
    if (fullName.trim().isEmpty) return username.isNotEmpty ? username.substring(0, 1).toUpperCase() : 'U';
    final parts = fullName.trim().split(RegExp(r'\s+'));
    if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
