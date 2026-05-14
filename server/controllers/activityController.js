const db = require('../config/db');

// @desc    Get all activity logs
// @route   GET /api/activities
// @access  Private (Admin, Manager)
exports.getActivities = async (req, res) => {
    try {
        let query = `
            SELECT a.*, u.name as user_name, l.first_name, l.last_name 
            FROM activities a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN leads l ON a.lead_id = l.id
            ORDER BY a.created_at DESC
        `;
        
        const [activities] = await db.execute(query);

        res.json({ success: true, count: activities.length, data: activities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get activity logs for a specific lead
// @route   GET /api/activities/lead/:id
// @access  Private
exports.getLeadActivities = async (req, res) => {
    try {
        const [activities] = await db.execute(
            `SELECT a.*, u.name as user_name 
             FROM activities a
             JOIN users u ON a.user_id = u.id
             WHERE a.lead_id = ? 
             ORDER BY a.created_at DESC`,
            [req.params.id]
        );

        res.json({ success: true, count: activities.length, data: activities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
