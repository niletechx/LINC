const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// All users routes require authentication
router.use(authMiddleware);

// GET /api/users/search?q=...
router.get('/search', usersController.search);

// GET /api/users/me
router.get('/me', usersController.getMe);

// PUT /api/users/me
router.put('/me', usersController.updateMe);

// GET /api/users/username/:username
router.get('/username/:username', usersController.getByUsername);

// GET /api/users/:id
router.get('/:id', usersController.getById);

module.exports = router;
