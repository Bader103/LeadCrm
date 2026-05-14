const db = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.assignLead = async (req, res) => {
    try {
        const { leadId, userId } = req.body;
        
        // Check if lead exists
        const [leads] = await db.execute('SELECT id, first_name, last_name FROM leads WHERE id = ?', [leadId]);
        if (leads.length === 0) return res.status(404).json({ success: false, message: 'Lead not found' });

        // Check if user exists
        const [users] = await db.execute('SELECT id, name FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

        // Update lead
        await db.execute('UPDATE leads SET assigned_to = ? WHERE id = ?', [userId, leadId]);

        // Log assignment history
        await db.execute(
            'INSERT INTO lead_assignments (lead_id, assigned_to, assigned_by) VALUES (?, ?, ?)',
            [leadId, userId, req.user.id]
        );

        // Log Activity
        await logActivity(req.user.id, 'ASSIGN_LEAD', leadId, { assigned_to: users[0].name });

        // Create Notification for assigned user
        const Notification = require('../models/notificationModel');
        await Notification.create({
            user_id: userId,
            type: 'ASSIGNMENT',
            message: `A new lead "${leads[0].first_name} ${leads[0].last_name}" has been assigned to you by ${req.user.name}.`,
            lead_id: leadId
        });

        res.json({ success: true, message: `Lead assigned to ${users[0].name}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
