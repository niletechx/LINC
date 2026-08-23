const express = require('express');
const router = express.Router();
const verificationController = require('./verification.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.get('/me', verificationController.listMyRequests);
router.get('/:id', verificationController.getById);
router.post('/', verificationController.createRequest);
router.put('/:id/review', requireRole('admin'), verificationController.reviewRequest);

module.exports = router;
