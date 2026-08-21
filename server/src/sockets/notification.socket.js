const logger = require('../utils/logger');

function registerNotificationSocket(io, socket) {
  // Each user joins their personal notification room on connect
  socket.on('join_notifications', ({ userId }) => {
    socket.join(`user:${userId}:notifications`);
    logger.debug(`User ${userId} joined notification room`);
  });

  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
}

/**
 * Push a notification to a specific user.
 * Called from services (e.g., booking.service.js) after DB insert.
 */
function pushNotification(io, userId, notification) {
  io.to(`user:${userId}:notifications`).emit('new_notification', notification);
}

module.exports = registerNotificationSocket;
module.exports.pushNotification = pushNotification;
