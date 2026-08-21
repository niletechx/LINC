const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { optionalAuth } = require('../../middleware/auth.middleware');

router.get('/', optionalAuth, notificationsController.listNotifications);
router.put('/:id/read', authMiddleware, notificationsController.markAsRead);
router.put('/read-all', authMiddleware, notificationsController.markAllAsRead);

module.exports = router;
