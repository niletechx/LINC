const express = require('express');
const router = express.Router();
const businessesController = require('./businesses.controller');
const membersRouter = require('./members/members.routes');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', businessesController.listBusinesses);
router.get('/:id', businessesController.getById);

router.use(authMiddleware);
router.get('/me', businessesController.getMe);
router.post('/me', businessesController.createMe);
router.put('/me', businessesController.updateMe);
router.use('/:id/members', membersRouter);

module.exports = router;
