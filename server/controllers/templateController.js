const db = require('../config/db');

exports.getTemplates = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM email_templates');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
