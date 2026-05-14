const db = require('../config/db');

const Note = {
    create: async (noteData) => {
        const { lead_id, user_id, content } = noteData;
        const [result] = await db.execute(
            'INSERT INTO notes (lead_id, user_id, content) VALUES (?, ?, ?)',
            [lead_id, user_id, content]
        );
        return result;
    },

    findByLeadId: async (leadId) => {
        const [rows] = await db.execute(
            `SELECT n.*, u.name as user_name 
             FROM notes n 
             JOIN users u ON n.user_id = u.id 
             WHERE n.lead_id = ? 
             ORDER BY n.created_at DESC`,
            [leadId]
        );
        return rows;
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM notes WHERE id = ?', [id]);
        return result;
    }
};

module.exports = Note;
