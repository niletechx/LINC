const escrowRepo = require('./escrow.repository');
const { _releaseFunds } = require('./escrow.service');
const logger = require('../../utils/logger');

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // every hour

/**
 * Auto-release job: finds all escrow records past their auto_release_at
 * and releases funds to the provider automatically.
 *
 * This protects providers from requesters who never confirm delivery.
 */
async function runAutoReleaseCheck() {
  try {
    const overdue = await escrowRepo.findOverdueForRelease();

    if (overdue.length === 0) {
      logger.debug('AutoRelease: no overdue escrows found');
      return;
    }

    logger.info(`AutoRelease: processing ${overdue.length} overdue escrow(s)`);

    for (const escrow of overdue) {
      try {
        await _releaseFunds(escrow);
        logger.info(`AutoRelease: released escrow ${escrow.id}`);
      } catch (err) {
        logger.error(`AutoRelease: failed to release escrow ${escrow.id}: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error('AutoRelease job error: ' + err.message);
  }
}

/**
 * Start the auto-release background job.
 * Call this once from server startup.
 */
function startAutoReleaseJob() {
  logger.info(`AutoRelease job started — checking every ${CHECK_INTERVAL_MS / 60000} minutes`);
  // Run check on interval
  return setInterval(runAutoReleaseCheck, CHECK_INTERVAL_MS);
}

module.exports = { startAutoReleaseJob, runAutoReleaseCheck };
