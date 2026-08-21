const usersRepo = require('./users.repository');

async function getMyProfile(userId) {
  return usersRepo.findById(userId, true); // include private fields for own profile
}

async function getUserProfile(userId) {
  const user = await usersRepo.findById(userId, false);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

async function getUserByUsername(username) {
  const user = await usersRepo.findByUsername(username);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

async function updateMyProfile(userId, updates) {
  return usersRepo.updateUser(userId, updates);
}

async function searchUsers(query) {
  if (!query || query.trim().length < 2) {
    const err = new Error('Search query must be at least 2 characters');
    err.statusCode = 400;
    throw err;
  }
  return usersRepo.searchUsers(query.trim());
}

module.exports = { getMyProfile, getUserProfile, getUserByUsername, updateMyProfile, searchUsers };
