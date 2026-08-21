const express = require('express');
const router = express.Router();
const providersController = require('./providers.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', providersController.listProviders);

// Authenticated /me routes MUST come before /:id parameter
router.get('/me', authMiddleware, providersController.getMe);
router.post('/me', authMiddleware, providersController.createMe);
router.put('/me', authMiddleware, providersController.updateMe);

router.get('/:id', providersController.getById);

module.exports = router;
