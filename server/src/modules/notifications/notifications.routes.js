const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { optionalAuth } = require('../../middleware/auth.middleware');

router.get('/', optionalAuth, notificationsController.listNotifications);
// IMPORTANT: /read-all must be registered BEFORE /:id/read to prevent Express
// from matching the literal string "read-all" as the :id path parameter.
router.put('/read-all', authMiddleware, notificationsController.markAllAsRead);
router.put('/:id/read', authMiddleware, notificationsController.markAsRead);

module.exports = router;
