const db = require('../config/db');

exports.globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, data: { leads: [], users: [] } });

        const searchTerm = `%${q}%`;

        // Search Leads
        let leadQuery = `SELECT id, first_name, last_name, email, company, 'lead' as type 
             FROM leads 
             WHERE (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company LIKE ?)`;
        let queryParams = [searchTerm, searchTerm, searchTerm, searchTerm];

        if (req.user.role === 'Sales Manager') {
            leadQuery += ` AND (assigned_to = ? OR assigned_to IS NULL)`;
            queryParams.push(req.user.id);
        } else if (req.user.role !== 'Admin') {
            leadQuery += ` AND assigned_to = ?`;
            queryParams.push(req.user.id);
        }

        leadQuery += ` LIMIT 10`;

        const [leads] = await db.execute(leadQuery, queryParams);

        // Search Users (if Admin/Manager)
        let users = [];
        if (req.user.role === 'Admin' || req.user.role === 'Sales Manager') {
            const [userRows] = await db.execute(
                `SELECT id, name, email, role, 'user' as type 
                 FROM users 
                 WHERE name LIKE ? OR email LIKE ? 
                 LIMIT 5`,
                [searchTerm, searchTerm]
            );
            users = userRows;
        }

        res.json({ 
            success: true, 
            data: { leads, users } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
};
