const db = require('../config/db');

exports.getPerformanceStats = async (req, res) => {
    try {
        // 1. Leads by Status
        const [statusRows] = await db.execute(
            'SELECT status as name, COUNT(*) as value FROM leads GROUP BY status'
        );

        // 2. Leads by Agent
        const [agentRows] = await db.execute(
            `SELECT u.name, COUNT(l.id) as count 
             FROM users u 
             LEFT JOIN leads l ON u.id = l.assigned_to 
             WHERE u.role != 'Client'
             GROUP BY u.id, u.name`
        );

        // 3. Conversion Rate (Closed / Total)
        const [totalLeads] = await db.execute('SELECT COUNT(*) as total FROM leads');
        const [closedLeads] = await db.execute('SELECT COUNT(*) as closed FROM leads WHERE status = \"Closed\"');
        
        const conversionRate = totalLeads[0].total > 0 
            ? ((closedLeads[0].closed / totalLeads[0].total) * 100).toFixed(1) 
            : 0;

        // 4. Source distribution
        const [sourceRows] = await db.execute(
            'SELECT source as name, COUNT(*) as value FROM leads GROUP BY source'
        );

        res.json({
            success: true,
            data: {
                statusDistribution: statusRows,
                agentPerformance: agentRows,
                conversionRate,
                sourceDistribution: sourceRows,
                summary: {
                    total: totalLeads[0].total,
                    closed: closedLeads[0].closed
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch report data' });
    }
};
