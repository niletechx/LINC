import 'package:flutter_test/flutter_test.dart';
import 'package:linc_mobile/utils/validators.dart';

void main() {
  group('FormValidators', () {
    group('validateEmail', () {
      test('returns error when email is null or empty', () {
        expect(FormValidators.validateEmail(null), 'Email address is required');
        expect(FormValidators.validateEmail(''), 'Email address is required');
        expect(FormValidators.validateEmail('   '), 'Email address is required');
      });

      test('returns error for invalid email formats', () {
        expect(FormValidators.validateEmail('plainaddress'), 'Please enter a valid email address');
        expect(FormValidators.validateEmail('user@com'), 'Please enter a valid email address');
        expect(FormValidators.validateEmail('@domain.com'), 'Please enter a valid email address');
        expect(FormValidators.validateEmail('user@domain.'), 'Please enter a valid email address');
      });

      test('returns null for valid email addresses', () {
        expect(FormValidators.validateEmail('test@example.com'), isNull);
        expect(FormValidators.validateEmail('user.name+tag@sub.domain.org'), isNull);
      });
    });

    group('validatePassword', () {
      test('returns error when password is null or empty', () {
        expect(FormValidators.validatePassword(null), 'Password is required');
        expect(FormValidators.validatePassword(''), 'Password is required');
      });

      test('returns error when password is below minLength', () {
        expect(
          FormValidators.validatePassword('12345', minLength: 6),
          'Password must be at least 6 characters',
        );
      });

      test('returns null when password meets requirements', () {
        expect(FormValidators.validatePassword('123456', minLength: 6), isNull);
        expect(FormValidators.validatePassword('StrongPassword123!'), isNull);
      });
    });

    group('validateConfirmPassword', () {
      test('returns error when confirmation is empty', () {
        expect(
          FormValidators.validateConfirmPassword('', 'password123'),
          'Please confirm your password',
        );
      });

      test('returns error when passwords do not match', () {
        expect(
          FormValidators.validateConfirmPassword('pass2', 'pass1'),
          'Passwords do not match',
        );
      });

      test('returns null when passwords match', () {
        expect(
          FormValidators.validateConfirmPassword('password123', 'password123'),
          isNull,
        );
      });
    });

    group('validatePhone', () {
      test('returns error when phone is null or empty', () {
        expect(FormValidators.validatePhone(null), 'Phone number is required');
        expect(FormValidators.validatePhone(''), 'Phone number is required');
      });

      test('returns error for invalid phone numbers', () {
        expect(
          FormValidators.validatePhone('12345'),
          contains('Please enter a valid phone number'),
        );
        expect(
          FormValidators.validatePhone('0811223344'),
          contains('Please enter a valid phone number'),
        );
      });

      test('returns null for valid Ethiopian numbers (09, 07, +251)', () {
        expect(FormValidators.validatePhone('0911223344'), isNull);
        expect(FormValidators.validatePhone('+251911223344'), isNull);
        expect(FormValidators.validatePhone('0712345678'), isNull);
        expect(FormValidators.validatePhone('+251712345678'), isNull);
      });
    });

    group('validateRequired & validateName', () {
      test('returns error when required field is empty', () {
        expect(FormValidators.validateRequired(null, 'Full Name'), 'Full Name is required');
        expect(FormValidators.validateRequired('   ', 'Address'), 'Address is required');
      });

      test('returns null when required field has content', () {
        expect(FormValidators.validateRequired('John Doe', 'Full Name'), isNull);
      });

      test('validates name minimum length', () {
        expect(FormValidators.validateName('A', 'Name'), 'Name must be at least 2 characters');
        expect(FormValidators.validateName('Al', 'Name'), isNull);
      });
    });
  });
}
