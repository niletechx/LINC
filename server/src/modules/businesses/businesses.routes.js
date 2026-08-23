const express = require('express');
const router = express.Router();
const businessesController = require('./businesses.controller');
const membersRouter = require('./members/members.routes');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', businessesController.listBusinesses);

// Authenticated /me routes MUST be registered before /:id
router.get('/me', authMiddleware, businessesController.getMe);
router.post('/me', authMiddleware, businessesController.createMe);
router.put('/me', authMiddleware, businessesController.updateMe);

router.get('/:id', businessesController.getById);
router.use('/:id/members', authMiddleware, membersRouter);

module.exports = router;
