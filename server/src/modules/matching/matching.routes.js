const express = require('express');
const router = express.Router();
const matchingController = require('./matching.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/requests/:requestId', matchingController.listMatches);
router.post('/requests/:requestId', matchingController.createMatch);
router.put('/:id', matchingController.updateMatchStatus);

module.exports = router;
