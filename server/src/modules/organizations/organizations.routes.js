const express = require('express');
const router = express.Router();
const organizationsController = require('./organizations.controller');
const membersRouter = require('./members/members.routes');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', organizationsController.listOrganizations);
router.get('/:id', organizationsController.getById);

router.use(authMiddleware);
router.get('/me', organizationsController.getMe);
router.post('/me', organizationsController.createMe);
router.put('/me', organizationsController.updateMe);
router.use('/:id/members', membersRouter);

module.exports = router;
