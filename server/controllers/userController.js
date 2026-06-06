const db = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { registerSchema } = require('../utils/validation');

exports.createUser = async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { name, email, password, role } = req.body;

        const userExists = await User.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Sales Agent'
        });

        res.status(201).json({ success: true, message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC');
        const [leads] = await db.execute('SELECT id, first_name, last_name, status, priority, assigned_to FROM leads');
        const [followups] = await db.execute('SELECT id, lead_id, scheduled_date, notes, status FROM followups WHERE status = "Pending"');

        // Group followups by lead_id
        const followupsByLead = {};
        followups.forEach(f => {
            if (!followupsByLead[f.lead_id]) {
                followupsByLead[f.lead_id] = [];
            }
            followupsByLead[f.lead_id].push(f);
        });

        // Group leads by user id
        const leadsByUser = {};
        leads.forEach(l => {
            if (l.assigned_to) {
                if (!leadsByUser[l.assigned_to]) {
                    leadsByUser[l.assigned_to] = [];
                }
                leadsByUser[l.assigned_to].push({
                    ...l,
                    followups: followupsByLead[l.id] || []
                });
            }
        });

        // Attach leads to users
        const usersWithLeads = users.map(u => ({
            ...u,
            leads: leadsByUser[u.id] || []
        }));

        res.json({ success: true, data: usersWithLeads });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role, status } = req.body;
        await db.execute(
            'UPDATE users SET role = ?, status = ? WHERE id = ?',
            [role, status, req.params.id]
        );
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (req.user.id == req.params.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
        }
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
