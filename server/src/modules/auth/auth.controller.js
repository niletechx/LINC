const authService = require('./auth.service');
const { success, error } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { email, password, full_name, username, phone, location_city, role, headline } = req.body;
  const result = await authService.register({ email, password, full_name, username, phone, location_city, role, headline });
  return success(res, result, 'Account created successfully', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return success(res, result, 'Login successful');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return success(res, user);
});

const logout = asyncHandler(async (req, res) => {
  // JWT is stateless — client discards the token.
  // Future: add token to a blocklist in Redis/DB.
  return success(res, null, 'Logged out successfully');
});

module.exports = { register, login, getMe, logout };
