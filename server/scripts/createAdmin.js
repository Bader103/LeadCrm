const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await connection.execute(
            'INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['System Admin', 'admin@leadcrm.com', hashedPassword, 'Admin']
        );

        console.log('Demo Admin user created: admin@leadcrm.com / admin123');
        await connection.end();
    } catch (error) {
        console.error('Error creating admin:', error.message);
    }
};

createAdmin();
