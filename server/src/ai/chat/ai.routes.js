const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { optionalAuth } = require('../../middleware/auth.middleware');
const { aiLimiter } = require('../../middleware/rateLimiter.middleware');

// POST /api/ai/chat — standard (non-streaming) RAG pipeline
router.post('/chat', optionalAuth, aiLimiter, aiController.chat);

// POST /api/ai/chat/stream — SSE streaming RAG pipeline
router.post('/chat/stream', optionalAuth, aiLimiter, aiController.chatStream);

// POST /api/ai/conversations — create a new conversation thread
router.post('/conversations', optionalAuth, aiController.createConversation);

// GET /api/ai/conversations — list the user's AI conversation history
router.get('/conversations', optionalAuth, aiController.getConversations);

// GET /api/ai/conversations/:id/messages — full message history for one conversation
router.get('/conversations/:id/messages', optionalAuth, aiController.getConversationMessages);

// DELETE /api/ai/conversations/:id — delete a conversation thread
router.delete('/conversations/:id', optionalAuth, aiController.deleteConversation);

module.exports = router;
