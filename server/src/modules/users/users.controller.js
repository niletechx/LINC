const usersService = require('./users.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getMyProfile(req.user.id);
  return success(res, user);
});

// PUT /api/users/me
const updateMe = asyncHandler(async (req, res) => {
  const user = await usersService.updateMyProfile(req.user.id, req.body);
  return success(res, user, 'Profile updated successfully');
});

// GET /api/users/search?q=query
const search = asyncHandler(async (req, res) => {
  const users = await usersService.searchUsers(req.query.q);
  return success(res, users);
});

// GET /api/users/:id
const getById = asyncHandler(async (req, res) => {
  const user = await usersService.getUserProfile(req.params.id);
  return success(res, user);
});

// GET /api/users/username/:username
const getByUsername = asyncHandler(async (req, res) => {
  const user = await usersService.getUserByUsername(req.params.username);
  return success(res, user);
});

module.exports = { getMe, updateMe, search, getById, getByUsername };
