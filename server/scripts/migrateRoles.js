const mysql = require('mysql2/promise');
require('dotenv').config();

const migrateRoles = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // 1. First, temporarily add 'Sales Manager' to the ENUM so we can update rows
        await connection.execute(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('Admin', 'Manager', 'Sales Manager', 'Sales Agent', 'Sales Intern', 'Marketing Head', 'Support Agent', 'Client') NOT NULL
        `);

        // 2. Update existing 'Manager' users to 'Sales Manager'
        await connection.execute("UPDATE users SET role = 'Sales Manager' WHERE role = 'Manager'");

        // 3. Remove 'Manager' and 'Support Agent' from the ENUM
        await connection.execute(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('Admin', 'Sales Manager', 'Sales Agent', 'Sales Intern', 'Marketing Head', 'Client') NOT NULL
        `);

        console.log('Successfully renamed Manager to Sales Manager and removed Support Agent.');
        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error.message);
    }
};

migrateRoles();
