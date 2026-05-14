const mysql = require('mysql2/promise');
require('dotenv').config();

const seedLeads = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // Get an admin ID for created_by
        const [users] = await connection.execute('SELECT id FROM users WHERE role = "Admin" LIMIT 1');
        const adminId = users[0]?.id || 1;

        const leads = [
            ['Alex', 'Johnson', 'alex.j@techcorp.com', '555-0101', 'TechCorp Solutions', 'Website', 'New', 'High', adminId],
            ['Sarah', 'Williams', 'sarah.w@creative.io', '555-0102', 'Creative Studios', 'Referral', 'Contacted', 'Medium', adminId],
            ['Michael', 'Brown', 'm.brown@globalogistics.com', '555-0103', 'Global Logistics', 'Cold Call', 'Interested', 'High', adminId],
            ['Emily', 'Davis', 'emily@startup.co', '555-0104', 'CloudNine SaaS', 'Social Media', 'Follow-up', 'Low', adminId],
            ['David', 'Wilson', 'd.wilson@enterprise.com', '555-0105', 'Enterprise Holdings', 'Website', 'Closed', 'High', adminId],
            ['Jessica', 'Taylor', 'jessica.t@retail.net', '555-0106', 'Urban Retail', 'Referral', 'New', 'Medium', adminId],
            ['Robert', 'Martinez', 'robert.m@fintech.com', '555-0107', 'SafePay Fintech', 'Cold Call', 'Contacted', 'High', adminId]
        ];

        for (const lead of leads) {
            await connection.execute(
                'INSERT INTO leads (first_name, last_name, email, phone, company, source, status, priority, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                lead
            );
        }

        console.log('Successfully seeded 7 professional leads into the pipeline.');
        await connection.end();
    } catch (error) {
        console.error('Error seeding leads:', error.message);
    }
};

seedLeads();
