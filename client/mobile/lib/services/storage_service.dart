import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class StorageService {
  static const String _keyToken = 'linc_jwt_token';
  static const String _keyUser = 'linc_user_data';
  static const String _keyBaseUrl = 'linc_custom_base_url';

  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static Future<void> saveToken(String token) async {
    try {
      await _secureStorage.write(key: _keyToken, value: token);
    } catch (_) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyToken, token);
    }
  }

  static Future<String?> getToken() async {
    try {
      final token = await _secureStorage.read(key: _keyToken);
      if (token != null && token.isNotEmpty) return token;
    } catch (_) {}
    // Graceful fallback and migration from legacy SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    final legacyToken = prefs.getString(_keyToken);
    if (legacyToken != null && legacyToken.isNotEmpty) {
      try {
        await _secureStorage.write(key: _keyToken, value: legacyToken);
        await prefs.remove(_keyToken);
      } catch (_) {}
    }
    return legacyToken;
  }

  static Future<void> saveUser(UserModel user) async {
    final userJson = jsonEncode(user.toJson());
    try {
      await _secureStorage.write(key: _keyUser, value: userJson);
    } catch (_) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyUser, userJson);
    }
  }

  static Future<UserModel?> getUser() async {
    String? userStr;
    try {
      userStr = await _secureStorage.read(key: _keyUser);
    } catch (_) {}
    if (userStr == null || userStr.isEmpty) {
      final prefs = await SharedPreferences.getInstance();
      userStr = prefs.getString(_keyUser);
    }
    if (userStr == null || userStr.isEmpty) return null;
    try {
      return UserModel.fromJson(jsonDecode(userStr) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  static Future<void> saveBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyBaseUrl, url);
  }

  static Future<String?> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyBaseUrl);
  }

  static Future<void> removeBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyBaseUrl);
  }

  static Future<void> clear() async {
    try {
      await _secureStorage.delete(key: _keyToken);
      await _secureStorage.delete(key: _keyUser);
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyToken);
    await prefs.remove(_keyUser);
  }
}
