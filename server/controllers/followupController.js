const db = require('../config/db');
const Notification = require('../models/notificationModel');

exports.checkFollowups = async (userId) => {
    try {
        // Find followups due today or overdue that haven't been notified yet
        const [dueFollowups] = await db.execute(
            `SELECT f.*, l.first_name, l.last_name, l.assigned_to 
             FROM followups f 
             JOIN leads l ON f.lead_id = l.id 
             WHERE l.assigned_to = ? 
             AND f.scheduled_date <= NOW() 
             AND f.status = 'Pending'
             AND f.notified = FALSE`,
            [userId]
        );

        for (const f of dueFollowups) {
            await Notification.create({
                user_id: userId,
                type: 'REMINDER',
                message: `URGENT: Follow-up scheduled for ${f.first_name} ${f.last_name} is due now!`,
                lead_id: f.lead_id
            });
            
            // Mark followup as notified
            await db.execute('UPDATE followups SET notified = TRUE WHERE id = ?', [f.id]);
        }
    } catch (error) {
        console.error('Follow-up check error:', error);
    }
};

exports.addFollowup = async (req, res) => {
    try {
        const { leadId, scheduled_date, notes } = req.body;
        
        await db.execute(
            'INSERT INTO followups (lead_id, scheduled_date, notes) VALUES (?, ?, ?)',
            [leadId, scheduled_date, notes]
        );

        res.status(201).json({ success: true, message: 'Follow-up scheduled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getLeadFollowups = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM followups WHERE lead_id = ? ORDER BY scheduled_date ASC',
            [req.params.leadId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAllFollowups = async (req, res) => {
    try {
        let query = `
            SELECT f.*, CONCAT(l.first_name, ' ', l.last_name) as lead_name 
            FROM followups f 
            JOIN leads l ON f.lead_id = l.id 
        `;
        
        if (req.user.role !== 'Admin' && req.user.role !== 'Sales Manager') {
            query += ` WHERE l.assigned_to = ${req.user.id} `;
        }
        
        query += ' ORDER BY f.scheduled_date ASC';
        
        const [rows] = await db.execute(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
