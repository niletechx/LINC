# 🚀 LINC Project Handoff Context & Next Action

## 1. Project Overview
- **Project Name**: LINC (Service discovery, matching, and booking platform tailored for Ethiopia).
- **Backend Architecture**: Node.js + Express (Clean 4-layer architecture: `routes` → `controller` → `service` → `repository`), PostgreSQL via Supabase, Socket.IO for real-time messaging/notifications.
- **AI Engine**: Google Gemini 1.5 Flash RAG pipeline (`server/src/ai/`) featuring multi-turn intent extraction, multi-entity retrieval (providers, businesses, organizations), Bayesian cold-start rating smoothing, SSE streaming (`/api/ai/chat/stream`), and an embedded DM Trust Advisor.
- **Payment Gateway**: Chapa (Ethiopian payment gateway with free sandbox API at `https://api.chapa.co/v1`).
- **Frontend**: Flutter mobile app (planned in `/client`).
- **Repository**: Git branch `main`.

---

## 2. Current Status & What Has Been Done
1. **16 Core Backend Modules Implemented**:
   - `auth`, `users`, `providers`, `businesses` (with members), `organizations` (with members), `services`, `categories`, `requests`, `matching`, `booking`, `messaging` (with inboxes), `reviews`, `verification`, `reports`, `notifications`, `admin`.
2. **AI Engine v2 (Fully Implemented & Pushed to `main`)**:
   - **Streaming SSE**: `POST /api/ai/chat/stream` for real-time token streaming.
   - **Multi-Entity Retrieval**: Retrieves and normalizes providers, businesses, and orgs.
   - **Cold-Start Fix**: Bayesian rating smoothing (prior mean 3.5★), +0.10 new provider boost (<60 days, <5 reviews), guaranteed slot injection at position 4.
   - **Trust Advisor**: Active reports inspection (flags fraud/no-shows in DMs when `@AI` is tagged).
   - **Auto Title Generation**: Automatically generates conversation titles in background.

---

## 3. EXACT Point Where Execution Stopped (In-Flight Feature)
We were in the middle of implementing the **Escrow Payment System via Chapa** to protect users against fraud:
- **Concept**: User pays via Chapa checkout → money is marked `funds_held` in LINC DB → provider marks service complete via `POST /api/bookings/:id/complete` → 72-hour confirmation window opens → user confirms (`released` to provider) or raises dispute (`disputed` → admin review) or auto-release job triggers after 72h. Platform takes a 3% fee on escrow transactions.
- **Current Git Status**:
  The following files were modified to wire up the booking routes, env validation, and auto-release background job:
  - `server/server.js` (starts `startAutoReleaseJob()`)
  - `server/src/config/env.js` (requires `CHAPA_SECRET_KEY`, `SERVER_URL`, `CLIENT_URL`)
  - `server/src/modules/booking/booking.service.js` (adds `markComplete`)
  - `server/src/modules/booking/booking.controller.js` (adds `markComplete`)
  - `server/src/modules/booking/booking.routes.js` (adds `POST /:id/complete`)
  - `server/src/routes/index.js` (mounts `/api/payments`)
- **Missing / Pending**:
  The directory `server/src/modules/payments/` and its 6 files need to be created, `axios` installed in `server`, and the 2 Supabase SQL tables created.

---

## 4. Immediate Next Steps for the Next AI Agent

### Step 1: Database Migration (Supabase SQL)
Run this SQL in Supabase to create the escrow and dispute tables:

```sql
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_entity_type TEXT NOT NULL CHECK (provider_entity_type IN ('provider', 'business', 'organization')),
  provider_entity_id UUID NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  platform_fee NUMERIC(12, 2) NOT NULL,
  provider_amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'ETB',
  status TEXT DEFAULT 'awaiting_payment' CHECK (status IN ('awaiting_payment', 'funds_held', 'pending_confirmation', 'released', 'refunded', 'disputed', 'cancelled')),
  chapa_tx_ref TEXT UNIQUE NOT NULL,
  chapa_checkout_url TEXT,
  chapa_reference TEXT,
  auto_release_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escrow_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID REFERENCES escrow_transactions(id) ON DELETE CASCADE,
  raised_by UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'admin_reviewing', 'resolved_refund', 'resolved_release')),
  admin_note TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 2: Install Axios in `server`
```bash
cd server
npm install axios
```

### Step 3: Create the 6 Payment Module Files

#### 1. `server/src/modules/payments/chapa.client.js`
```js
const axios = require('axios');
const logger = require('../../utils/logger');

const CHAPA_BASE = 'https://api.chapa.co/v1';
const PLATFORM_FEE_RATE = 0.03; // 3%

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

function generateTxRef(bookingId) {
  return `LINC-${bookingId}-${Date.now()}`;
}

function calculateAmounts(totalAmount) {
  const platformFee = parseFloat((totalAmount * PLATFORM_FEE_RATE).toFixed(2));
  const providerAmount = parseFloat((totalAmount - platformFee).toFixed(2));
  return { platformFee, providerAmount };
}

async function initializePayment({ amount, currency = 'ETB', email, firstName, lastName, phone, txRef, bookingId, serviceDescription }) {
  const payload = {
    amount: String(amount),
    currency,
    email,
    first_name: firstName,
    last_name: lastName,
    phone_number: phone || '',
    tx_ref: txRef,
    callback_url: `${process.env.SERVER_URL}/api/payments/chapa/webhook`,
    return_url: `${process.env.CLIENT_URL}/bookings/${bookingId}/payment-result`,
    customization: {
      title: 'LINC Secure Payment',
      description: serviceDescription || 'Payment for service via LINC',
    },
  };

  const { data } = await axios.post(`${CHAPA_BASE}/transaction/initialize`, payload, { headers: getHeaders() });
  logger.info(`Chapa payment initialized: ${txRef}`);
  return data.data;
}

async function verifyPayment(txRef) {
  const { data } = await axios.get(`${CHAPA_BASE}/transaction/verify/${txRef}`, { headers: getHeaders() });
  logger.info(`Chapa verify ${txRef}: ${data.data?.status}`);
  return data.data;
}

module.exports = { generateTxRef, calculateAmounts, initializePayment, verifyPayment };
```

#### 2. `server/src/modules/payments/escrow.repository.js`
```js
const supabase = require('../../config/supabase');

async function create(data) {
  const { data: row, error } = await supabase.from('escrow_transactions').insert(data).select().single();
  if (error) throw error;
  return row;
}

async function findById(id) {
  const { data, error } = await supabase.from('escrow_transactions').select('*, bookings(*)').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByBookingId(bookingId) {
  const { data, error } = await supabase.from('escrow_transactions').select('*').eq('booking_id', bookingId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByTxRef(txRef) {
  const { data, error } = await supabase.from('escrow_transactions').select('*').eq('chapa_tx_ref', txRef).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByUser(userId) {
  const { data, error } = await supabase.from('escrow_transactions').select('*, bookings(service_id, scheduled_at, entity_type, entity_id)').eq('requester_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function update(id, updates) {
  const { data, error } = await supabase.from('escrow_transactions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function findOverdueForRelease() {
  const { data, error } = await supabase.from('escrow_transactions').select('*').eq('status', 'pending_confirmation').lte('auto_release_at', new Date().toISOString());
  if (error) throw error;
  return data || [];
}

async function createDispute(data) {
  const { data: row, error } = await supabase.from('escrow_disputes').insert(data).select().single();
  if (error) throw error;
  return row;
}

async function findOpenDisputes() {
  const { data, error } = await supabase.from('escrow_disputes').select('*, escrow_transactions(*)').eq('status', 'open').order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function findDisputeById(id) {
  const { data, error } = await supabase.from('escrow_disputes').select('*, escrow_transactions(*)').eq('id', id).single();
  if (error) throw error;
  return data;
}

async function updateDispute(id, updates) {
  const { data, error } = await supabase.from('escrow_disputes').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

module.exports = {
  create, findById, findByBookingId, findByTxRef, findByUser, update, findOverdueForRelease,
  createDispute, findOpenDisputes, findDisputeById, updateDispute,
};
```

#### 3. `server/src/modules/payments/escrow.service.js`
```js
const chapaClient = require('./chapa.client');
const escrowRepo = require('./escrow.repository');
const bookingRepo = require('../booking/booking.repository');
const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');

const AUTO_RELEASE_HOURS = 72;
const MAX_USER_DISPUTES_PER_MONTH = 3;

async function initiate({ bookingId, userId, userEmail, userFirstName, userLastName, userPhone }) {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) { const e = new Error('Booking not found'); e.statusCode = 404; throw e; }
  if (booking.requester_id !== userId) { const e = new Error('Forbidden'); e.statusCode = 403; throw e; }
  if (!['pending', 'confirmed'].includes(booking.status)) {
    const e = new Error('Booking must be pending or confirmed to initiate escrow');
    e.statusCode = 400; throw e;
  }

  const existing = await escrowRepo.findByBookingId(bookingId);
  if (existing && !['cancelled', 'refunded'].includes(existing.status)) {
    const e = new Error('An active escrow already exists for this booking');
    e.statusCode = 409; throw e;
  }

  const amount = booking.agreed_price;
  const currency = booking.currency || 'ETB';
  const { platformFee, providerAmount } = chapaClient.calculateAmounts(amount);
  const txRef = chapaClient.generateTxRef(bookingId);

  const chapaData = await chapaClient.initializePayment({
    amount,
    currency,
    email: userEmail,
    firstName: userFirstName,
    lastName: userLastName,
    phone: userPhone,
    txRef,
    bookingId,
    serviceDescription: `LINC booking #${bookingId}`,
  });

  const escrow = await escrowRepo.create({
    booking_id: bookingId,
    requester_id: userId,
    provider_entity_type: booking.entity_type,
    provider_entity_id: booking.entity_id,
    amount,
    platform_fee: platformFee,
    provider_amount: providerAmount,
    currency,
    status: 'awaiting_payment',
    chapa_tx_ref: txRef,
    chapa_checkout_url: chapaData.checkout_url,
  });

  await bookingRepo.updateBooking(bookingId, { status: 'awaiting_payment' });
  return { escrowId: escrow.id, checkoutUrl: chapaData.checkout_url, txRef };
}

async function handleWebhook({ txRef }) {
  const escrow = await escrowRepo.findByTxRef(txRef);
  if (!escrow) { logger.warn(`Webhook: escrow not found for tx_ref ${txRef}`); return; }
  if (escrow.status === 'funds_held') return;

  const chapaVerification = await chapaClient.verifyPayment(txRef);
  if (chapaVerification.status !== 'success') {
    logger.warn(`Webhook: Chapa payment not successful for ${txRef}: ${chapaVerification.status}`);
    return;
  }

  await escrowRepo.update(escrow.id, {
    status: 'funds_held',
    chapa_reference: chapaVerification.reference,
  });

  await bookingRepo.updateBooking(escrow.booking_id, { status: 'paid_escrow' });
  logger.info(`Escrow funds held: ${escrow.id} | booking: ${escrow.booking_id}`);
}

async function markServiceComplete({ bookingId, providerUserId }) {
  const escrow = await escrowRepo.findByBookingId(bookingId);
  if (!escrow) { const e = new Error('No escrow found for this booking'); e.statusCode = 404; throw e; }
  if (escrow.status !== 'funds_held') {
    const e = new Error('Funds must be held before marking complete'); e.statusCode = 400; throw e;
  }

  const booking = await bookingRepo.findById(bookingId);
  const isProvider = await _isProviderForBooking(providerUserId, booking);
  if (!isProvider) { const e = new Error('Forbidden — only the provider can mark this complete'); e.statusCode = 403; throw e; }

  const autoReleaseAt = new Date(Date.now() + AUTO_RELEASE_HOURS * 3600 * 1000);
  await escrowRepo.update(escrow.id, {
    status: 'pending_confirmation',
    auto_release_at: autoReleaseAt.toISOString(),
  });

  await bookingRepo.updateBooking(bookingId, { status: 'pending_confirmation' });
  return { autoReleaseAt };
}

async function confirmDelivery({ escrowId, userId }) {
  const escrow = await escrowRepo.findById(escrowId);
  if (!escrow) { const e = new Error('Escrow not found'); e.statusCode = 404; throw e; }
  if (escrow.requester_id !== userId) { const e = new Error('Forbidden'); e.statusCode = 403; throw e; }
  if (escrow.status !== 'pending_confirmation') {
    const e = new Error(`Cannot confirm — escrow status is: ${escrow.status}`); e.statusCode = 400; throw e;
  }

  await _releaseFunds(escrow);
  return { message: 'Service confirmed. Funds released to provider.' };
}

async function raiseDispute({ escrowId, userId, reason, evidenceUrls = [] }) {
  const escrow = await escrowRepo.findById(escrowId);
  if (!escrow) { const e = new Error('Escrow not found'); e.statusCode = 404; throw e; }
  if (escrow.requester_id !== userId) { const e = new Error('Forbidden'); e.statusCode = 403; throw e; }
  if (!['pending_confirmation', 'funds_held'].includes(escrow.status)) {
    const e = new Error(`Cannot dispute — escrow status is: ${escrow.status}`); e.statusCode = 400; throw e;
  }

  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { count } = await supabase.from('escrow_disputes').select('id', { count: 'exact', head: true }).eq('raised_by', userId).gte('created_at', monthAgo);
  if ((count || 0) >= MAX_USER_DISPUTES_PER_MONTH) {
    const e = new Error('Dispute limit reached for this month. Contact support.'); e.statusCode = 429; throw e;
  }

  await escrowRepo.update(escrow.id, { status: 'disputed' });
  await bookingRepo.updateBooking(escrow.booking_id, { status: 'disputed' });

  return escrowRepo.createDispute({
    escrow_id: escrow.id,
    raised_by: userId,
    reason,
    evidence_urls: evidenceUrls,
    status: 'open',
  });
}

async function resolveDispute({ disputeId, adminId, resolution, adminNote }) {
  const dispute = await escrowRepo.findDisputeById(disputeId);
  if (!dispute) { const e = new Error('Dispute not found'); e.statusCode = 404; throw e; }
  if (['resolved_refund', 'resolved_release'].includes(dispute.status)) {
    const e = new Error('Dispute already resolved'); e.statusCode = 409; throw e;
  }

  const escrow = dispute.escrow_transactions;
  if (resolution === 'refund') {
    await escrowRepo.update(escrow.id, { status: 'refunded', refunded_at: new Date().toISOString() });
    await bookingRepo.updateBooking(escrow.booking_id, { status: 'refunded' });
  } else if (resolution === 'release') {
    await _releaseFunds(escrow);
  }

  await escrowRepo.updateDispute(disputeId, {
    status: resolution === 'refund' ? 'resolved_refund' : 'resolved_release',
    admin_note: adminNote,
    resolved_by: adminId,
    resolved_at: new Date().toISOString(),
  });

  return { resolution };
}

async function _releaseFunds(escrow) {
  await escrowRepo.update(escrow.id, {
    status: 'released',
    released_at: new Date().toISOString(),
  });
  await bookingRepo.updateBooking(escrow.booking_id, { status: 'completed' });
  logger.info(`Escrow ${escrow.id} released to provider ${escrow.provider_entity_type}:${escrow.provider_entity_id}`);
}

async function _isProviderForBooking(userId, booking) {
  if (booking.entity_type === 'provider') {
    const { data } = await supabase.from('provider_profiles').select('id').eq('id', booking.entity_id).eq('user_id', userId).single();
    return !!data;
  } else if (booking.entity_type === 'business') {
    const { data } = await supabase.from('business_members').select('id').eq('business_id', booking.entity_id).eq('user_id', userId).in('role', ['owner', 'manager']).single();
    return !!data;
  } else if (booking.entity_type === 'organization') {
    const { data } = await supabase.from('organization_members').select('id').eq('organization_id', booking.entity_id).eq('user_id', userId).in('role', ['owner', 'manager']).single();
    return !!data;
  }
  return false;
}

module.exports = { initiate, handleWebhook, markServiceComplete, confirmDelivery, raiseDispute, resolveDispute, _releaseFunds };
```

#### 4. `server/src/modules/payments/autoRelease.job.js`
```js
const escrowRepo = require('./escrow.repository');
const { _releaseFunds } = require('./escrow.service');
const logger = require('../../utils/logger');

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

async function runAutoReleaseCheck() {
  try {
    const overdue = await escrowRepo.findOverdueForRelease();
    if (overdue.length === 0) return;
    logger.info(`AutoRelease: processing ${overdue.length} overdue escrow(s)`);
    for (const escrow of overdue) {
      try {
        await _releaseFunds(escrow);
        logger.info(`AutoRelease: released escrow ${escrow.id}`);
      } catch (err) {
        logger.error(`AutoRelease failed for ${escrow.id}: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error('AutoRelease job error: ' + err.message);
  }
}

function startAutoReleaseJob() {
  logger.info(`AutoRelease job started`);
  runAutoReleaseCheck();
  return setInterval(runAutoReleaseCheck, CHECK_INTERVAL_MS);
}

module.exports = { startAutoReleaseJob, runAutoReleaseCheck };
```

#### 5. `server/src/modules/payments/payments.controller.js`
```js
const escrowService = require('./escrow.service');
const chapaClient = require('./chapa.client');
const escrowRepo = require('./escrow.repository');
const { success, error } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

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

const chapaWebhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;
    logger.info(`Chapa webhook received: tx_ref=${tx_ref} status=${status}`);
    if (status === 'success' && tx_ref) {
      await escrowService.handleWebhook({ txRef: tx_ref });
    }
    res.status(200).json({ received: true });
  } catch (err) {
    logger.error('Chapa webhook error: ' + err.message);
    res.status(200).json({ received: true });
  }
};

const verifyPayment = asyncHandler(async (req, res) => {
  const { txRef } = req.params;
  const chapaData = await chapaClient.verifyPayment(txRef);
  if (chapaData.status === 'success') {
    await escrowService.handleWebhook({ txRef });
  }
  return success(res, { status: chapaData.status, txRef });
});

const confirmDelivery = asyncHandler(async (req, res) => {
  const result = await escrowService.confirmDelivery({ escrowId: req.params.id, userId: req.user.id });
  return success(res, result, 'Service confirmed. Payment released to provider.');
});

const raiseDispute = asyncHandler(async (req, res) => {
  const { reason, evidenceUrls } = req.body;
  if (!reason) return error(res, 'reason is required', 400);
  const dispute = await escrowService.raiseDispute({ escrowId: req.params.id, userId: req.user.id, reason, evidenceUrls: evidenceUrls || [] });
  return success(res, dispute, 'Dispute raised. Our team will review within 24 hours.', 201);
});

const getEscrow = asyncHandler(async (req, res) => {
  const escrow = await escrowRepo.findById(req.params.id);
  if (!escrow) return error(res, 'Escrow not found', 404);
  if (escrow.requester_id !== req.user.id && !req.user.is_admin) return error(res, 'Forbidden', 403);
  return success(res, escrow);
});

const listEscrows = asyncHandler(async (req, res) => {
  const rows = await escrowRepo.findByUser(req.user.id);
  return success(res, rows);
});

const listDisputes = asyncHandler(async (req, res) => {
  const disputes = await escrowRepo.findOpenDisputes();
  return success(res, disputes);
});

const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution, adminNote } = req.body;
  if (!['refund', 'release'].includes(resolution)) return error(res, "resolution must be 'refund' or 'release'", 400);
  const result = await escrowService.resolveDispute({ disputeId: req.params.id, adminId: req.user.id, resolution, adminNote });
  return success(res, result, `Dispute resolved: ${resolution}`);
});

module.exports = { initiateEscrow, chapaWebhook, verifyPayment, confirmDelivery, raiseDispute, getEscrow, listEscrows, listDisputes, resolveDispute };
```

#### 6. `server/src/modules/payments/payments.routes.js`
```js
const express = require('express');
const router = express.Router();
const ctrl = require('./payments.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');

router.post('/escrow/initiate', authMiddleware, ctrl.initiateEscrow);
router.post('/escrow/:id/confirm', authMiddleware, ctrl.confirmDelivery);
router.post('/escrow/:id/dispute', authMiddleware, ctrl.raiseDispute);
router.get('/escrow', authMiddleware, ctrl.listEscrows);
router.get('/escrow/:id', authMiddleware, ctrl.getEscrow);

router.post('/chapa/webhook', ctrl.chapaWebhook);
router.get('/chapa/verify/:txRef', authMiddleware, ctrl.verifyPayment);

router.get('/admin/disputes', authMiddleware, requireRole('admin'), ctrl.listDisputes);
router.post('/admin/disputes/:id/resolve', authMiddleware, requireRole('admin'), ctrl.resolveDispute);

module.exports = router;
```

### Step 4: Verification & Git Commit
1. Verify node syntax:
   `node -c server/src/modules/payments/payments.routes.js`
2. Commit and push:
   `git add . && git commit -m "feat(payments): Chapa escrow payment system with 72h auto-release, disputes, and anti-fraud" && git push origin main`
