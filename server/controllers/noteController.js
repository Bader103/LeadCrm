const Note = require('../models/noteModel');
const { logActivity } = require('../utils/logger');

exports.addNote = async (req, res) => {
    try {
        const { content } = req.body;
        const lead_id = req.params.leadId;
        
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
        const notes = await Note.findByLeadId(req.params.leadId);
        res.json({ success: true, data: notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
