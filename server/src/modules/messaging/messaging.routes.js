const express = require('express');
const router = express.Router();
const messagingController = require('./messaging.controller');
const { optionalAuth } = require('../../middleware/auth.middleware');

router.use(optionalAuth);
router.get('/conversations', messagingController.listConversations);
router.post('/conversations', messagingController.createConversation);
router.get('/conversations/:id', messagingController.listMessages);
router.post('/conversations/:id/messages', messagingController.sendMessage);
router.put('/conversations/:id/read', messagingController.markConversationRead);

module.exports = router;
