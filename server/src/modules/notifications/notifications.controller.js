const notificationsService = require('./notifications.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  if (!req.user) {
    return success(res, []);
  }
  const notifications = await notificationsService.listNotifications(req.user.id);
  return success(res, notifications);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationsService.markAsRead(req.user.id, req.params.id);
  return success(res, notification, 'Notification marked as read');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const notifications = await notificationsService.markAllAsRead(req.user.id);
  return success(res, notifications, 'All notifications marked as read');
});

module.exports = { listNotifications, markAsRead, markAllAsRead };
