const express = require('express');
const router = express.Router();
const ctrl = require('./payments.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');

// ── User-facing escrow routes (all require auth) ─────────────────────────────
router.post('/escrow/initiate', authMiddleware, ctrl.initiateEscrow);
router.post('/escrow/:id/confirm', authMiddleware, ctrl.confirmDelivery);
router.post('/escrow/:id/dispute', authMiddleware, ctrl.raiseDispute);
router.get('/escrow', authMiddleware, ctrl.listEscrows);
router.get('/escrow/:id', authMiddleware, ctrl.getEscrow);

// ── Chapa gateway routes (NO auth for webhook — Chapa calls it directly) ──────
router.post('/chapa/webhook', ctrl.chapaWebhook);
router.get('/chapa/verify/:txRef', authMiddleware, ctrl.verifyPayment);

// ── Admin dispute resolution ──────────────────────────────────────────────────
router.get('/admin/disputes', authMiddleware, requireRole('admin'), ctrl.listDisputes);
router.post('/admin/disputes/:id/resolve', authMiddleware, requireRole('admin'), ctrl.resolveDispute);

module.exports = router;
