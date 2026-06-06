const db = require('../config/db');

exports.getPerformanceStats = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'Admin';
        const userId = req.user.id;

        // 1. Leads by Status
        let statusQuery = 'SELECT status as name, COUNT(*) as value FROM leads';
        let statusParams = [];
        if (!isAdmin) {
            statusQuery += ' WHERE assigned_to = ?';
            statusParams.push(userId);
        }
        statusQuery += ' GROUP BY status';
        const [statusRows] = await db.execute(statusQuery, statusParams);

        // 2. Leads by Agent
        let agentQuery, agentParams;
        if (isAdmin) {
            agentQuery = `
                SELECT u.name, COUNT(l.id) as count 
                FROM users u 
                LEFT JOIN leads l ON u.id = l.assigned_to 
                WHERE u.role != 'Client'
                GROUP BY u.id, u.name`;
            agentParams = [];
        } else {
            agentQuery = `
                SELECT u.name, COUNT(l.id) as count 
                FROM users u 
                LEFT JOIN leads l ON u.id = l.assigned_to 
                WHERE u.id = ?
                GROUP BY u.id, u.name`;
            agentParams = [userId];
        }
        const [agentRows] = await db.execute(agentQuery, agentParams);

        // 3. Conversion Rate (Closed / Total)
        let totalQuery = 'SELECT COUNT(*) as total FROM leads';
        let closedQuery = 'SELECT COUNT(*) as closed FROM leads WHERE status = "Closed"';
        let rateParams = [];
        if (!isAdmin) {
            totalQuery += ' WHERE assigned_to = ?';
            closedQuery += ' AND assigned_to = ?';
            rateParams = [userId];
        }
        
        const [totalLeads] = await db.execute(totalQuery, rateParams);
        const [closedLeads] = await db.execute(closedQuery, rateParams);
        
        const conversionRate = totalLeads[0].total > 0 
            ? ((closedLeads[0].closed / totalLeads[0].total) * 100).toFixed(1) 
            : 0;

        // 4. Source distribution
        let sourceQuery = 'SELECT source as name, COUNT(*) as value FROM leads';
        let sourceParams = [];
        if (!isAdmin) {
            sourceQuery += ' WHERE assigned_to = ?';
            sourceParams.push(userId);
        }
        sourceQuery += ' GROUP BY source';
        const [sourceRows] = await db.execute(sourceQuery, sourceParams);

        // 5. Weekly trend (Last 7 days)
        let trendQuery = `
            SELECT DAYNAME(created_at) as name, COUNT(*) as leads, SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as conversions
            FROM leads
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `;
        let trendParams = [];
        if (!isAdmin) {
            trendQuery += ' AND assigned_to = ?';
            trendParams.push(userId);
        }
        trendQuery += ' GROUP BY DAYNAME(created_at), DATE(created_at) ORDER BY DATE(created_at) ASC';
        const [trendRows] = await db.execute(trendQuery, trendParams);

        // Format short day names for trend
        const formattedTrend = trendRows.map(row => ({
            name: row.name ? row.name.substring(0, 3) : '',
            leads: parseInt(row.leads) || 0,
            conversions: parseInt(row.conversions) || 0
        }));

        res.json({
            success: true,
            data: {
                statusDistribution: statusRows,
                agentPerformance: agentRows,
                conversionRate,
                sourceDistribution: sourceRows,
                trendData: formattedTrend,
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
