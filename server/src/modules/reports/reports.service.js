const reportsRepo = require('./reports.repository');

async function listReports() {
  return reportsRepo.listAll();
}

async function getReport(reportId) {
  const report = await reportsRepo.findById(reportId);
  if (!report) {
    const err = new Error('Report not found');
    err.statusCode = 404;
    throw err;
  }
  return report;
}

async function createReport(reporterId, payload = {}) {
  const { entity_type, entity_id, reason, description } = payload;
  if (!entity_type || !entity_id || !reason) {
    const err = new Error('entity_type, entity_id, and reason are required');
    err.statusCode = 400;
    throw err;
  }

  if (!['user', 'provider', 'business', 'organization', 'review', 'message'].includes(entity_type)) {
    const err = new Error('Invalid entity_type');
    err.statusCode = 400;
    throw err;
  }

  return reportsRepo.createReport({
    reporter_id: reporterId,
    entity_type,
    entity_id,
    reason,
    description: description || null,
    status: 'pending',
  });
}

async function reviewReport(adminId, reportId, payload = {}) {
  const report = await reportsRepo.findById(reportId);
  if (!report) {
    const err = new Error('Report not found');
    err.statusCode = 404;
    throw err;
  }

  const { status, reviewed_by } = payload;
  if (!status || !['reviewed', 'resolved', 'dismissed'].includes(status)) {
    const err = new Error('status must be reviewed, resolved, or dismissed');
    err.statusCode = 400;
    throw err;
  }

  return reportsRepo.updateStatus(reportId, {
    status,
    reviewed_by: reviewed_by || adminId,
    reviewed_at: new Date().toISOString(),
  });
}

module.exports = { listReports, getReport, createReport, reviewReport };
