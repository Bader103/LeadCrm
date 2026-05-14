const db = require('../config/db');

const Notification = {
    create: async (data) => {
        const { user_id, type, message, lead_id } = data;
        await db.execute(
            'INSERT INTO notifications (user_id, type, message, lead_id) VALUES (?, ?, ?, ?)',
            [user_id, type, message, lead_id]
        );
    },

    findByUser: async (userId) => {
        const [rows] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [userId]
        );
        return rows;
    },

    markAsRead: async (id) => {
        await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    },

    markAllAsRead: async (userId) => {
        await db.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    },

    getUnreadCount: async (userId) => {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
        return rows[0].count;
    }
};

module.exports = Notification;
