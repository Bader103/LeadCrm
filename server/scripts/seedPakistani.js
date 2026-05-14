const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedPakistaniData = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Clearing old leads and users...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE activities');
        await connection.execute('TRUNCATE TABLE notifications');
        await connection.execute('TRUNCATE TABLE followups');
        await connection.execute('TRUNCATE TABLE attachments');
        await connection.execute('TRUNCATE TABLE lead_assignments');
        await connection.execute('TRUNCATE TABLE leads');
        await connection.execute('TRUNCATE TABLE users');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // 1. Create Pakistani Users
        const users = [
            ['Ahmed Ali', 'admin@houseofelan.com', hashedPassword, 'Admin'],
            ['Usman Khan', 'usman@houseofelan.com', hashedPassword, 'Sales Manager'],
            ['Fatima Zahra', 'fatima@houseofelan.com', hashedPassword, 'Sales Agent'],
            ['Zainab Bibi', 'zainab@houseofelan.com', hashedPassword, 'Sales Agent'],
            ['Hamza Malik', 'hamza@houseofelan.com', hashedPassword, 'Sales Intern']
        ];

        for (const user of users) {
            await connection.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                user
            );
        }

        const [dbUsers] = await connection.execute('SELECT id, name FROM users');
        const adminId = dbUsers.find(u => u.name === 'Ahmed Ali').id;
        const agentId = dbUsers.find(u => u.name === 'Fatima Zahra').id;

        // 2. Create Pakistani Leads
        const leads = [
            ['Zaid', 'Iqbal', 'zaid.iqbal@systems.ltd', '0300-1234567', 'Systems Limited', 'Website', 'New', 'High', agentId, adminId],
            ['Ayesha', 'Siddiqui', 'ayesha@jazz.com.pk', '0321-7654321', 'Jazz Pakistan', 'Referral', 'Contacted', 'Medium', agentId, adminId],
            ['Omer', 'Sheikh', 'omer.s@engro.com', '0333-1112223', 'Engro Corporation', 'Cold Call', 'Interested', 'High', null, adminId],
            ['Hina', 'Pervez', 'hina@lucky-cement.com', '0345-9998887', 'Lucky Cement', 'Social Media', 'Follow-up', 'Low', null, adminId],
            ['Bilal', 'Saeed', 'bilal@psl.com.pk', '0301-4445556', 'PSL Official', 'Website', 'Closed', 'High', agentId, adminId],
            ['Mariam', 'Nawaz', 'mariam@k-electric.com.pk', '0312-3334445', 'K-Electric', 'Referral', 'New', 'Medium', null, adminId],
            ['Kashif', 'Abbasi', 'kashif@ary.tv', '0322-6667778', 'ARY Network', 'Cold Call', 'Contacted', 'High', agentId, adminId],
            ['Sana', 'Javed', 'sana.j@descon.com', '0300-8889990', 'Descon Engineering', 'Website', 'Interested', 'Medium', agentId, adminId],
            ['Fawad', 'Khan', 'fawad@hbl.com', '0321-1231231', 'HBL Bank', 'Social Media', 'New', 'High', null, adminId],
            ['Mahira', 'Khan', 'mahira@packages.com.pk', '0333-4564564', 'Packages Limited', 'Website', 'Follow-up', 'Medium', agentId, adminId]
        ];

        for (const lead of leads) {
            await connection.execute(
                'INSERT INTO leads (first_name, last_name, email, phone, company, source, status, priority, assigned_to, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                lead
            );
        }

        console.log('Pakistani Ecosystem Seeded Successfully for House of Elan!');
        await connection.end();
    } catch (error) {
        console.error('Error seeding Pakistani data:', error.message);
    }
};

seedPakistaniData();
