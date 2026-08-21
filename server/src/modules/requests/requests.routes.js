const express = require('express');
const router = express.Router();
const requestsController = require('./requests.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', requestsController.listRequests);
router.get('/:id', requestsController.getById);
router.post('/', authMiddleware, requestsController.createRequest);
router.put('/:id', authMiddleware, requestsController.updateRequest);

module.exports = router;
