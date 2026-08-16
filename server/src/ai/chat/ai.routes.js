const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { aiLimiter } = require('../../middleware/rateLimiter.middleware');

// POST /api/ai/chat — send a message, runs the full RAG pipeline
router.post('/chat', authMiddleware, aiLimiter, aiController.chat);

// GET /api/ai/conversations — list all of the user's AI conversations
router.get('/conversations', authMiddleware, aiController.getConversations);

// GET /api/ai/conversations/:id/messages — get full message history for a conversation
router.get('/conversations/:id/messages', authMiddleware, aiController.getConversationMessages);

module.exports = router;
