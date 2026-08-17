const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { optionalAuth } = require('../../middleware/auth.middleware');
const authMiddleware = require('../../middleware/auth.middleware');
const { aiLimiter } = require('../../middleware/rateLimiter.middleware');

// POST /api/ai/chat — standard (non-streaming) RAG pipeline
router.post('/chat', optionalAuth, aiLimiter, aiController.chat);

// POST /api/ai/chat/stream — SSE streaming RAG pipeline
// Returns tokens as they arrive via Server-Sent Events
router.post('/chat/stream', optionalAuth, aiLimiter, aiController.chatStream);

// POST /api/ai/conversations — create a new conversation thread
router.post('/conversations', authMiddleware, aiController.createConversation);

// GET /api/ai/conversations — list the user's AI conversation history
router.get('/conversations', authMiddleware, aiController.getConversations);

// GET /api/ai/conversations/:id/messages — full message history for one conversation
router.get('/conversations/:id/messages', authMiddleware, aiController.getConversationMessages);

// DELETE /api/ai/conversations/:id — delete a conversation thread
router.delete('/conversations/:id', authMiddleware, aiController.deleteConversation);

module.exports = router;
