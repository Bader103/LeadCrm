const db = require('../config/db');

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
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
