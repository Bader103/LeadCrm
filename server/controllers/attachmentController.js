const db = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { leadId } = req.body;
        
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
            return res.status(403).json({ success: false, message: 'Not authorized to upload attachments for this lead' });
        }

        const fileName = req.file.originalname;
        const filePath = req.file.path;
        const fileType = req.file.mimetype;

        const [result] = await db.execute(
            'INSERT INTO attachments (lead_id, file_name, file_path, file_type, uploaded_by) VALUES (?, ?, ?, ?, ?)',
            [leadId, fileName, filePath, fileType, req.user.id]
        );

        await logActivity(req.user.id, 'UPLOAD_FILE', leadId, { file_name: fileName });

        res.status(201).json({ 
            success: true, 
            data: { id: result.insertId, fileName, filePath } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getLeadAttachments = async (req, res) => {
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
            return res.status(403).json({ success: false, message: 'Not authorized to view attachments for this lead' });
        }

        const [rows] = await db.execute(
            'SELECT * FROM attachments WHERE lead_id = ? ORDER BY created_at DESC',
            [req.params.leadId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteAttachment = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT file_path, lead_id FROM attachments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'File not found' });

        // Check lead ownership
        const [leads] = await db.execute('SELECT assigned_to FROM leads WHERE id = ?', [rows[0].lead_id]);
        
        const isAuthorized = 
            req.user.role === 'Admin' || 
            (req.user.role === 'Sales Manager' && (leads[0] && (leads[0].assigned_to === req.user.id || leads[0].assigned_to === null))) ||
            (leads[0] && leads[0].assigned_to === req.user.id);

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete attachments for this lead' });
        }

        // Delete from filesystem
        const fs = require('fs');
        if (fs.existsSync(rows[0].file_path)) {
            fs.unlinkSync(rows[0].file_path);
        }

        await db.execute('DELETE FROM attachments WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'File deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
