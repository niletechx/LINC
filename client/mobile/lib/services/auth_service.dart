import '../models/user_model.dart';
import 'api_client.dart';
import 'storage_service.dart';

class AuthResult {
  final UserModel user;
  final String token;

  const AuthResult({required this.user, required this.token});
}

class AuthService {
  final ApiClient _client = ApiClient();

  Future<AuthResult> register({
    required String email,
    required String password,
    required String fullName,
    required String username,
  }) async {
    try {
      final response = await _client.dio.post(
        '/auth/register',
        data: {
          'email': email.trim(),
          'password': password,
          'full_name': fullName.trim(),
          'username': username.trim(),
        },
      );

      final data = response.data['data'] as Map<String, dynamic>;
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
      final token = data['token'] as String;

      await StorageService.saveToken(token);
      await StorageService.saveUser(user);

      return AuthResult(user: user, token: token);
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.dio.post(
        '/auth/login',
        data: {
          'email': email.trim(),
          'password': password,
        },
      );

      final data = response.data['data'] as Map<String, dynamic>;
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
      final token = data['token'] as String;

      await StorageService.saveToken(token);
      await StorageService.saveUser(user);

      return AuthResult(user: user, token: token);
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<UserModel> getMe() async {
    try {
      final response = await _client.dio.get('/auth/me');
      final data = response.data['data'] as Map<String, dynamic>;
      final user = UserModel.fromJson(data);
      await StorageService.saveUser(user);
      return user;
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<void> logout() async {
    try {
      await _client.dio.post('/auth/logout');
    } catch (_) {
      // Ignore network failure on logout
    } finally {
      await StorageService.clear();
    }
  }
}
