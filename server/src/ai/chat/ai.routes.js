const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { aiLimiter } = require('../../middleware/rateLimiter.middleware');

// POST /api/ai/chat — send a message to LINC AI
router.post('/chat', authMiddleware, aiLimiter, aiController.chat);

// GET /api/ai/conversations — get user's AI conversation history
router.get('/conversations', authMiddleware, aiController.getConversations);

module.exports = router;
