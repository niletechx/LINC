const express = require('express');
const router = express.Router();
const servicesController = require('./services.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/', servicesController.listServices);
router.get('/:id', servicesController.getById);

router.use(authMiddleware);
router.post('/', servicesController.createService);
router.put('/:id', servicesController.updateService);
router.delete('/:id', servicesController.deleteService);

module.exports = router;
