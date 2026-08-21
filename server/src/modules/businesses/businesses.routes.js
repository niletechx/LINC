const express = require('express');
const router = express.Router();
const businessesController = require('./businesses.controller');
const membersRouter = require('./members/members.routes');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', businessesController.listBusinesses);
router.get('/me', authMiddleware, businessesController.getMe);
router.post('/me', authMiddleware, businessesController.createMe);
router.put('/me', authMiddleware, businessesController.updateMe);
router.use('/:id/members', authMiddleware, membersRouter);
router.get('/:id', businessesController.getById);

module.exports = router;
