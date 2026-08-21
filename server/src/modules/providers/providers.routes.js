const express = require('express');
const router = express.Router();
const providersController = require('./providers.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', providersController.listProviders);
router.get('/me', authMiddleware, providersController.getMe);
router.post('/me', authMiddleware, providersController.createMe);
router.put('/me', authMiddleware, providersController.updateMe);
router.get('/:id', providersController.getById);

module.exports = router;
