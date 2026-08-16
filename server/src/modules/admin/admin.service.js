const adminRepo = require('./admin.repository');

async function getOverview() {
  return adminRepo.getOverview();
}

async function listUsers(filters = {}) {
  return adminRepo.listUsers(filters);
}

async function listReports() {
  return adminRepo.listReports();
}

async function listVerificationRequests() {
  return adminRepo.listVerificationRequests();
}

module.exports = { getOverview, listUsers, listReports, listVerificationRequests };
