const express = require('express');
const router = express.Router();
const providersController = require('./providers.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', providersController.listProviders);
router.get('/:id', providersController.getById);

router.use(authMiddleware);
router.get('/me', providersController.getMe);
router.post('/me', providersController.createMe);
router.put('/me', providersController.updateMe);

module.exports = router;
