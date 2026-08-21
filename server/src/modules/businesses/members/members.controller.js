const membersService = require('./members.service');
const { success } = require('../../../utils/apiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

const listMembers = asyncHandler(async (req, res) => {
  const members = await membersService.listMembers(req.params.id);
  return success(res, members);
});

const addMember = asyncHandler(async (req, res) => {
  const member = await membersService.addMember(req.params.id, req.body.user_id, req.body.role);
  return success(res, member, 'Member added successfully', 201);
});

const removeMember = asyncHandler(async (req, res) => {
  const result = await membersService.removeMember(req.params.id, req.params.userId);
  return success(res, result, 'Member removed successfully');
});

module.exports = { listMembers, addMember, removeMember };
