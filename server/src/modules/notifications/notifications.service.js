const notificationsRepo = require('./notifications.repository');

async function listNotifications(userId) {
  return notificationsRepo.listByUser(userId);
}

async function getNotification(userId, notificationId) {
  const notification = await notificationsRepo.findById(notificationId);
  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }

  if (notification.user_id !== userId) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return notification;
}

async function createNotification(userId, payload = {}) {
  const { type, title, body, data = {} } = payload;
  if (!type || !title || !body) {
    const err = new Error('type, title, and body are required');
    err.statusCode = 400;
    throw err;
  }

  return notificationsRepo.createNotification({ user_id: userId, type, title, body, data });
}

async function markAsRead(userId, notificationId) {
  await getNotification(userId, notificationId);
  return notificationsRepo.markAsRead(notificationId);
}

async function markAllAsRead(userId) {
  return notificationsRepo.markAllAsRead(userId);
}

module.exports = { listNotifications, getNotification, createNotification, markAsRead, markAllAsRead };
