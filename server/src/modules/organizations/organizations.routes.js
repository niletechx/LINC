const express = require('express');
const router = express.Router();
const organizationsController = require('./organizations.controller');
const membersRouter = require('./members/members.routes');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', organizationsController.listOrganizations);

// Authenticated /me routes MUST be registered before /:id
router.get('/me', authMiddleware, organizationsController.getMe);
router.post('/me', authMiddleware, organizationsController.createMe);
router.put('/me', authMiddleware, organizationsController.updateMe);

router.get('/:id', organizationsController.getById);
router.use('/:id/members', authMiddleware, membersRouter);

module.exports = router;
