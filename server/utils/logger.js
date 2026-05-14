const db = require('../config/db');

/**
 * Log user activity to the database
 * @param {number} userId - ID of the user performing the action
 * @param {string} action - Action performed (e.g., 'CREATE_LEAD', 'UPDATE_STATUS')
 * @param {number|null} leadId - ID of the lead involved
 * @param {string|null} details - Additional JSON details or text
 */
const logActivity = async (userId, action, leadId = null, details = null) => {
    try {
        await db.execute(
            'INSERT INTO activities (user_id, lead_id, action, details) VALUES (?, ?, ?, ?)',
            [userId, leadId, action, typeof details === 'object' ? JSON.stringify(details) : details]
        );
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = { logActivity };
