const express = require('express');
const router = express.Router();
const categoriesController = require('./categories.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');

// GET /api/categories — public
router.get('/', categoriesController.getAll);

// GET /api/categories/:id — public
router.get('/:id', categoriesController.getById);

// POST /api/categories/seed — admin only
router.post('/seed', authMiddleware, requireRole('admin'), categoriesController.seed);

module.exports = router;
