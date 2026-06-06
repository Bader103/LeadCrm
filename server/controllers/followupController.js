const db = require('../config/db');
const Notification = require('../models/notificationModel');

exports.checkFollowups = async (userId) => {
    try {
        // Find followups due today or overdue with status still Pending
        const [dueFollowups] = await db.execute(
            `SELECT f.*, l.first_name, l.last_name, l.assigned_to 
             FROM followups f 
             JOIN leads l ON f.lead_id = l.id 
             WHERE l.assigned_to = ? 
             AND f.scheduled_date <= NOW() 
             AND f.status = 'Pending'`,
            [userId]
        );

        for (const f of dueFollowups) {
            await Notification.create({
                user_id: userId,
                type: 'REMINDER',
                message: `URGENT: Follow-up scheduled for ${f.first_name} ${f.last_name} is due now!`,
                lead_id: f.lead_id
            });
        }
    } catch (error) {
        console.error('Follow-up check error:', error);
    }
};

exports.addFollowup = async (req, res) => {
    try {
        const { leadId, scheduled_date, notes } = req.body;
        
        // Check lead existence and ownership
        const [leads] = await db.execute('SELECT assigned_to FROM leads WHERE id = ?', [leadId]);
        if (leads.length === 0) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        const isAuthorized = 
            req.user.role === 'Admin' || 
            (req.user.role === 'Sales Manager' && (leads[0].assigned_to === req.user.id || leads[0].assigned_to === null)) ||
            leads[0].assigned_to === req.user.id;

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized to add follow-ups for this lead' });
        }
        
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
        // Check lead existence and ownership
        const [leads] = await db.execute('SELECT assigned_to FROM leads WHERE id = ?', [req.params.leadId]);
        if (leads.length === 0) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        
        const isAuthorized = 
            req.user.role === 'Admin' || 
            (req.user.role === 'Sales Manager' && (leads[0].assigned_to === req.user.id || leads[0].assigned_to === null)) ||
            leads[0].assigned_to === req.user.id;

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this lead\'s follow-ups' });
        }

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
        
        if (req.user.role === 'Sales Manager') {
            query += ` WHERE (l.assigned_to = ${req.user.id} OR l.assigned_to IS NULL) `;
        } else if (req.user.role !== 'Admin') {
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
