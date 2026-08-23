const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.post('/', reportsController.createReport);
router.get('/', requireRole('admin'), reportsController.listReports);
router.get('/:id', requireRole('admin'), reportsController.getById);
router.put('/:id/review', requireRole('admin'), reportsController.reviewReport);

module.exports = router;
