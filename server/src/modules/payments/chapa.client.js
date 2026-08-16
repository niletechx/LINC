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

/**
 * Generate a unique transaction reference for Chapa.
 * Format: LINC-{bookingId}-{timestamp}
 */
function generateTxRef(bookingId) {
  return `LINC-${bookingId}-${Date.now()}`;
}

/**
 * Calculate platform fee and provider payout amount.
 */
function calculateAmounts(totalAmount) {
  const platformFee = parseFloat((totalAmount * PLATFORM_FEE_RATE).toFixed(2));
  const providerAmount = parseFloat((totalAmount - platformFee).toFixed(2));
  return { platformFee, providerAmount };
}

/**
 * Initialize a Chapa payment — returns a checkout URL.
 * The user is redirected to this URL to complete payment.
 */
async function initializePayment({
  amount,
  currency = 'ETB',
  email,
  firstName,
  lastName,
  phone,
  txRef,
  bookingId,
  serviceDescription,
}) {
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

  const { data } = await axios.post(
    `${CHAPA_BASE}/transaction/initialize`,
    payload,
    { headers: getHeaders() }
  );

  logger.info(`Chapa payment initialized: ${txRef}`);
  return data.data; // { checkout_url }
}

/**
 * Verify a transaction by tx_ref.
 * Call this from the webhook AND from the return_url redirect to confirm payment.
 */
async function verifyPayment(txRef) {
  const { data } = await axios.get(
    `${CHAPA_BASE}/transaction/verify/${txRef}`,
    { headers: getHeaders() }
  );
  logger.info(`Chapa verify ${txRef}: ${data.data?.status}`);
  return data.data; // { status, amount, currency, reference, ... }
}

module.exports = { generateTxRef, calculateAmounts, initializePayment, verifyPayment };
