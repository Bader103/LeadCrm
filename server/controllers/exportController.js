const Lead = require('../models/leadModel');

exports.exportLeads = async (req, res) => {
    try {
        let leads;
        if (req.user.role === 'Admin' || req.user.role === 'Sales Manager') {
            leads = await Lead.findAll();
        } else {
            leads = await Lead.findByAssignedTo(req.user.id);
        }

        if (leads.length === 0) {
            return res.status(404).json({ success: false, message: 'No leads to export' });
        }

        // CSV Header
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Priority', 'Created At'];
        const rows = leads.map(l => [
            l.id,
            l.first_name,
            l.last_name,
            l.email,
            l.phone,
            l.company,
            l.source,
            l.status,
            l.priority,
            l.created_at
        ]);

        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell || ''}"`).join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=leads_export.csv');
        res.status(200).send(csvContent);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
