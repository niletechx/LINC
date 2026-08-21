const express = require('express');
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const authRouter = require('../modules/auth/auth.routes');
const usersRouter = require('../modules/users/users.routes');
const providersRouter = require('../modules/providers/providers.routes');
const businessesRouter = require('../modules/businesses/businesses.routes');
const organizationsRouter = require('../modules/organizations/organizations.routes');
const servicesRouter = require('../modules/services/services.routes');
const categoriesRouter = require('../modules/categories/categories.routes');
const requestsRouter = require('../modules/requests/requests.routes');
const matchingRouter = require('../modules/matching/matching.routes');
const bookingRouter = require('../modules/booking/booking.routes');
const messagingRouter = require('../modules/messaging/messaging.routes');
const reviewsRouter = require('../modules/reviews/reviews.routes');
const verificationRouter = require('../modules/verification/verification.routes');
const reportsRouter = require('../modules/reports/reports.routes');
const notificationsRouter = require('../modules/notifications/notifications.routes');
const adminRouter = require('../modules/admin/admin.routes');
const aiRouter = require('../ai/chat/ai.routes');
const paymentsRouter = require('../modules/payments/payments.routes');

const router = express.Router();
router.use(apiLimiter);

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/providers', providersRouter);
router.use('/businesses', businessesRouter);
router.use('/organizations', organizationsRouter);
router.use('/services', servicesRouter);
router.use('/categories', categoriesRouter);
router.use('/requests', requestsRouter);
router.use('/matching', matchingRouter);
router.use('/bookings', bookingRouter);
router.use('/messaging', messagingRouter);
router.use('/reviews', reviewsRouter);
router.use('/verification', verificationRouter);
router.use('/reports', reportsRouter);
router.use('/notifications', notificationsRouter);
router.use('/admin', adminRouter);
router.use('/ai', aiRouter);
router.use('/payments', paymentsRouter);

module.exports = router;
