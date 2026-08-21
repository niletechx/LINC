const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

const REQUEST_STATUS = {
  OPEN: 'open',
  MATCHED: 'matched',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  AWAY: 'away',
};

const PRICE_TYPE = {
  FIXED: 'fixed',
  HOURLY: 'hourly',
  NEGOTIABLE: 'negotiable',
  FREE: 'free',
};

const URGENCY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
};

module.exports = {
  BOOKING_STATUS,
  REQUEST_STATUS,
  AVAILABILITY_STATUS,
  PRICE_TYPE,
  URGENCY,
  VERIFICATION_STATUS,
  REPORT_STATUS,
};
