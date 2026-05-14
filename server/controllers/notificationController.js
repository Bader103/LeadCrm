const Notification = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
    try {
        // Auto-check for followups
        await require('./followupController').checkFollowups(req.user.id);
        
        const notifications = await Notification.findByUser(req.user.id);
        const unreadCount = await Notification.getUnreadCount(req.user.id);
        res.json({ success: true, data: notifications, unreadCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.markRead = async (req, res) => {
    try {
        await Notification.markAsRead(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        await Notification.markAllAsRead(req.user.id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
