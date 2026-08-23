const escrowService = require('./escrow.service');
const chapaClient = require('./chapa.client');
const escrowRepo = require('./escrow.repository');
const { success, error } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * POST /api/payments/escrow/initiate
 * Body: { bookingId }
 * Initiates escrow for a booking. Returns Chapa checkout URL.
 */
const initiateEscrow = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const user = req.user;

  if (!bookingId) return error(res, 'bookingId is required', 400);

  const result = await escrowService.initiate({
    bookingId,
    userId: user.id,
    userEmail: user.email,
    userFirstName: user.full_name?.split(' ')[0] || 'User',
    userLastName: user.full_name?.split(' ').slice(1).join(' ') || 'LINC',
    userPhone: user.phone || '',
  });

  return success(res, result, 'Escrow initiated. Redirect user to checkout URL.');
});

const crypto = require('crypto');

/**
 * POST /api/payments/chapa/webhook
 * Receives Chapa payment webhook — securely verifies with Chapa API and marks funds as held.
 * This endpoint must NOT require user auth (Chapa calls it directly).
 */
const chapaWebhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body || {};
    logger.info(`Chapa webhook received: tx_ref=${tx_ref} status=${status}`);

    if (!tx_ref) {
      return res.status(400).json({ success: false, message: 'Missing tx_ref' });
    }

    // 1. Check webhook signature if provided
    const signature = req.headers['x-chapa-signature'] || req.headers['chapa-signature'];
    const secret = process.env.CHAPA_WEBHOOK_SECRET || process.env.CHAPA_SECRET_KEY;
    if (signature && secret) {
      const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
      if (hash !== signature && signature !== secret) {
        logger.warn(`Invalid Chapa webhook signature for tx_ref=${tx_ref}`);
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    }

    // 2. Active server-to-server verification with Chapa API before updating state
    const verification = await chapaClient.verifyPayment(tx_ref);
    if (verification && verification.status === 'success') {
      await escrowService.handleWebhook({ txRef: tx_ref });
      logger.info(`Chapa payment verified successfully for tx_ref=${tx_ref}`);
    } else {
      logger.warn(`Chapa verification failed or not completed for tx_ref=${tx_ref}: status=${verification?.status}`);
    }

    // Always return 200 to Chapa
    res.status(200).json({ received: true });
  } catch (err) {
    logger.error('Chapa webhook error: ' + err.message);
    res.status(200).json({ received: true }); // still 200 so Chapa doesn't retry
  }
};

/**
 * GET /api/payments/chapa/verify/:txRef
 * Manual verification — called after user returns from Chapa checkout.
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { txRef } = req.params;
  const chapaData = await chapaClient.verifyPayment(txRef);

  if (chapaData.status === 'success') {
    await escrowService.handleWebhook({ txRef });
  }

  return success(res, { status: chapaData.status, txRef });
});

/**
 * POST /api/payments/escrow/:id/confirm
 * Requester confirms they received the service → funds released to provider.
 */
const confirmDelivery = asyncHandler(async (req, res) => {
  const result = await escrowService.confirmDelivery({
    escrowId: req.params.id,
    userId: req.user.id,
  });
  return success(res, result, 'Service confirmed. Payment released to provider.');
});

/**
 * POST /api/payments/escrow/:id/dispute
 * Body: { reason, evidenceUrls? }
 */
const raiseDispute = asyncHandler(async (req, res) => {
  const { reason, evidenceUrls } = req.body;
  if (!reason) return error(res, 'reason is required', 400);

  const dispute = await escrowService.raiseDispute({
    escrowId: req.params.id,
    userId: req.user.id,
    reason,
    evidenceUrls: evidenceUrls || [],
  });
  return success(res, dispute, 'Dispute raised. Our team will review within 24 hours.', 201);
});

/**
 * GET /api/payments/escrow/:id
 * Get escrow details.
 */
const getEscrow = asyncHandler(async (req, res) => {
  const escrow = await escrowRepo.findById(req.params.id);
  if (!escrow) return error(res, 'Escrow not found', 404);
  if (escrow.requester_id !== req.user.id && !req.user.is_admin) {
    return error(res, 'Forbidden', 403);
  }
  return success(res, escrow);
});

/**
 * GET /api/payments/escrow
 * List user's escrow transactions.
 */
const listEscrows = asyncHandler(async (req, res) => {
  const rows = await escrowRepo.findByUser(req.user.id);
  return success(res, rows);
});

// ── Admin ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/escrow/disputes
 */
const listDisputes = asyncHandler(async (req, res) => {
  const disputes = await escrowRepo.findOpenDisputes();
  return success(res, disputes);
});

/**
 * POST /api/admin/escrow/disputes/:id/resolve
 * Body: { resolution: 'refund' | 'release', adminNote }
 */
const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution, adminNote } = req.body;
  if (!['refund', 'release'].includes(resolution)) {
    return error(res, "resolution must be 'refund' or 'release'", 400);
  }

  const result = await escrowService.resolveDispute({
    disputeId: req.params.id,
    adminId: req.user.id,
    resolution,
    adminNote,
  });
  return success(res, result, `Dispute resolved: ${resolution}`);
});

module.exports = {
  initiateEscrow,
  chapaWebhook,
  verifyPayment,
  confirmDelivery,
  raiseDispute,
  getEscrow,
  listEscrows,
  listDisputes,
  resolveDispute,
};
