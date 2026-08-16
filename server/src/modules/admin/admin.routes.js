const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');

router.use(authMiddleware, requireRole('admin'));
router.get('/overview', adminController.getOverview);
router.get('/users', adminController.listUsers);
router.get('/reports', adminController.listReports);
router.get('/verification-requests', adminController.listVerificationRequests);

module.exports = router;
