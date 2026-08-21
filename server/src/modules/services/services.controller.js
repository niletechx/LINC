const servicesService = require('./services.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listServices = asyncHandler(async (req, res) => {
  const filters = {
    q: req.query.q,
    city: req.query.city,
    category_id: req.query.category_id,
    provider_id: req.query.provider_id,
    limit: req.query.limit,
  };
  const data = await servicesService.listServices(filters);
  return success(res, data);
});

const getById = asyncHandler(async (req, res) => {
  const service = await servicesService.getServiceById(req.params.id);
  return success(res, service);
});

const createService = asyncHandler(async (req, res) => {
  const service = await servicesService.createService(req.user.id, req.body);
  return success(res, service, 'Service created successfully', 201);
});

const updateService = asyncHandler(async (req, res) => {
  const service = await servicesService.updateService(req.user.id, req.params.id, req.body);
  return success(res, service, 'Service updated successfully');
});

const deleteService = asyncHandler(async (req, res) => {
  const service = await servicesService.deleteService(req.user.id, req.params.id);
  return success(res, service, 'Service deleted successfully');
});

module.exports = {
  listServices,
  getById,
  createService,
  updateService,
  deleteService,
};
