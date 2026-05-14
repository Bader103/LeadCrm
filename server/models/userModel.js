const db = require('../config/db');

const User = {
    // Create a new user
    create: async (userData) => {
        const { name, email, password, role } = userData;
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role]
        );
        return result;
    },

    // Find user by email
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Find user by ID
    findById: async (id) => {
        const [rows] = await db.execute('SELECT id, name, email, role, status, notify_email, notify_assignment, notify_status_change, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    // Update user status
    updateStatus: async (id, status) => {
        const [result] = await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        return result;
    }
};

module.exports = User;
