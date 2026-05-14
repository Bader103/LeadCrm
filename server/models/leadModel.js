const db = require('../config/db');

const Lead = {
    // Create a new lead
    create: async (leadData) => {
        const { first_name, last_name, email, phone, company, source, status, priority, assigned_to, created_by } = leadData;
        const [result] = await db.execute(
            'INSERT INTO leads (first_name, last_name, email, phone, company, source, status, priority, assigned_to, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                first_name || null, 
                last_name || null, 
                email || null, 
                phone || null, 
                company || null, 
                source || null, 
                status || 'New', 
                priority || 'Medium', 
                assigned_to || null, 
                created_by
            ]
        );
        return result;
    },

    // Get all leads (with role-based filtering logic handled in controller)
    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM leads ORDER BY created_at DESC');
        return rows;
    },

    // Find lead by ID
    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM leads WHERE id = ?', [id]);
        return rows[0];
    },

    // Update lead
    update: async (id, leadData) => {
        const fields = Object.keys(leadData);
        const values = Object.values(leadData);
        const setQuery = fields.map(field => `${field} = ?`).join(', ');
        
        const [result] = await db.execute(
            `UPDATE leads SET ${setQuery} WHERE id = ?`,
            [...values, id]
        );
        return result;
    },

    // Delete lead
    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM leads WHERE id = ?', [id]);
        return result;
    },

    // Get leads assigned to a specific user
    findByAssignedTo: async (userId) => {
        const [rows] = await db.execute('SELECT * FROM leads WHERE assigned_to = ? ORDER BY created_at DESC', [userId]);
        return rows;
    }
};

module.exports = Lead;
