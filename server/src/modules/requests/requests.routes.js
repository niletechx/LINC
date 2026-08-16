const express = require('express');
const router = express.Router();
const requestsController = require('./requests.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/', requestsController.listRequests);
router.post('/', requestsController.createRequest);
router.get('/:id', requestsController.getById);
router.put('/:id', requestsController.updateRequest);

module.exports = router;
