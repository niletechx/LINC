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
  final String? locationCity;

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
    this.locationCity,
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
      locationCity: json['location_city'] as String? ?? json['locationCity'] as String?,
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

  UserModel copyWith({
    String? id,
    String? email,
    String? username,
    String? fullName,
    String? avatarUrl,
    String? phone,
    String? role,
    bool? isAdmin,
    bool? isActive,
    String? locationCity,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      username: username ?? this.username,
      fullName: fullName ?? this.fullName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      isAdmin: isAdmin ?? this.isAdmin,
      isActive: isActive ?? this.isActive,
      locationCity: locationCity ?? this.locationCity,
    );
  }

  String get initials {
    if (fullName.trim().isEmpty) return username.isNotEmpty ? username.substring(0, 1).toUpperCase() : 'U';
    final parts = fullName.trim().split(RegExp(r'\s+'));
    if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
