const express = require('express');
const router = express.Router();
const organizationsController = require('./organizations.controller');
const membersRouter = require('./members/members.routes');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', organizationsController.listOrganizations);
router.get('/me', authMiddleware, organizationsController.getMe);
router.post('/me', authMiddleware, organizationsController.createMe);
router.put('/me', authMiddleware, organizationsController.updateMe);
router.use('/:id/members', authMiddleware, membersRouter);
router.get('/:id', organizationsController.getById);

module.exports = router;
