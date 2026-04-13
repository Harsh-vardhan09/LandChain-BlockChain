const Notification = require('../models/Notification');

class NotificationService {
  async createNotification(walletAddress, type, message, landId = null) {
    const notification = new Notification({
      walletAddress,
      type,
      message,
      landId,
      isRead: false,
      createdAt: new Date()
    });
    await notification.save();
    return notification;
  }

  async getNotifications(walletAddress, limit = 50) {
    return await Notification.find({ walletAddress })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async markAsRead(notificationId, walletAddress) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, walletAddress },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(walletAddress) {
    return await Notification.updateMany(
      { walletAddress, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(walletAddress) {
    return await Notification.countDocuments({ walletAddress, isRead: false });
  }
}

module.exports = new NotificationService();