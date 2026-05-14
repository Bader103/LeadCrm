const sendEmail = require('../utils/mailer');
const Lead = require('../models/leadModel');
const { logActivity } = require('../utils/logger');

exports.sendTemplateEmail = async (req, res) => {
    try {
        const { leadId, subject, body } = req.body;

        const [rows] = await require('../config/db').execute('SELECT email, first_name FROM leads WHERE id = ?', [leadId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Lead not found' });

        const lead = rows[0];

        await sendEmail({
            email: lead.email,
            subject: subject,
            message: body.replace('{name}', lead.first_name),
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    ${body.replace('{name}', lead.first_name).replace(/\n/g, '<br>')}
                   </div>`
        });

        await logActivity(req.user.id, 'SEND_EMAIL', leadId, { subject });

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email. Check SMTP settings.' });
    }
};
