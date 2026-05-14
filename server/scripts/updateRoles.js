const mysql = require('mysql2/promise');
require('dotenv').config();

const updateRoles = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        await connection.execute(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('Admin', 'Manager', 'Sales Agent', 'Sales Intern', 'Marketing Head', 'Support Agent', 'Client') NOT NULL
        `);

        console.log('Successfully updated user roles in the database.');
        await connection.end();
    } catch (error) {
        console.error('Error updating roles:', error.message);
    }
};

updateRoles();
