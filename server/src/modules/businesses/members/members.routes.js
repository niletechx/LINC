const express = require('express');
const router = express.Router({ mergeParams: true });
const membersController = require('./members.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/', membersController.listMembers);
router.post('/', membersController.addMember);
router.delete('/:userId', membersController.removeMember);

module.exports = router;
