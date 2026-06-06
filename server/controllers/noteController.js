const Note = require('../models/noteModel');
const { logActivity } = require('../utils/logger');
const db = require('../config/db');

exports.addNote = async (req, res) => {
    try {
        const { content } = req.body;
        const lead_id = req.params.leadId;
        
        // Check lead existence and ownership
        const [leads] = await db.execute('SELECT assigned_to FROM leads WHERE id = ?', [lead_id]);
        if (leads.length === 0) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        const isAuthorized = 
            req.user.role === 'Admin' || 
            (req.user.role === 'Sales Manager' && (leads[0].assigned_to === req.user.id || leads[0].assigned_to === null)) ||
            leads[0].assigned_to === req.user.id;

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized to add notes for this lead' });
        }
        
        await Note.create({
            lead_id,
            user_id: req.user.id,
            content
        });

        await logActivity(req.user.id, 'ADD_NOTE', lead_id, { content: content.substring(0, 50) });

        res.status(201).json({ success: true, message: 'Note added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getLeadNotes = async (req, res) => {
    try {
        const lead_id = req.params.leadId;
        
        // Check lead existence and ownership
        const [leads] = await db.execute('SELECT assigned_to FROM leads WHERE id = ?', [lead_id]);
        if (leads.length === 0) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        
        const isAuthorized = 
            req.user.role === 'Admin' || 
            (req.user.role === 'Sales Manager' && (leads[0].assigned_to === req.user.id || leads[0].assigned_to === null)) ||
            leads[0].assigned_to === req.user.id;

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized to view notes for this lead' });
        }

        const notes = await Note.findByLeadId(lead_id);
        res.json({ success: true, data: notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
