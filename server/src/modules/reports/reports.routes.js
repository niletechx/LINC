const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/', reportsController.listReports);
router.get('/:id', reportsController.getById);
router.post('/', reportsController.createReport);
router.put('/:id/review', reportsController.reviewReport);

module.exports = router;
