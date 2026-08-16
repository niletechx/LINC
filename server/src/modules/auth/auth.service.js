const bcrypt = require('bcryptjs');
const authRepo = require('./auth.repository');
const { signToken } = require('../../utils/tokenUtils');

const SALT_ROUNDS = 12;

async function register({ email, password, full_name, username }) {
  // Check duplicates
  const [existingEmail, existingUsername] = await Promise.all([
    authRepo.findByEmail(email),
    authRepo.findByUsername(username),
  ]);

  if (existingEmail) {
    const err = new Error('Email is already registered');
    err.statusCode = 409;
    throw err;
  }
  if (existingUsername) {
    const err = new Error('Username is already taken');
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await authRepo.createUser({ email, password_hash, full_name, username });

  const token = signToken({ id: user.id, email: user.email, is_admin: user.is_admin });
  return { user, token };
}

async function login({ email, password }) {
  const user = await authRepo.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Account has been deactivated');
    err.statusCode = 403;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // Strip sensitive fields before returning
  const { password_hash, ...safeUser } = user;
  const token = signToken({ id: safeUser.id, email: safeUser.email, is_admin: safeUser.is_admin });
  return { user: safeUser, token };
}

async function getMe(userId) {
  const user = await authRepo.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

module.exports = { register, login, getMe };
