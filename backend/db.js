const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'jsonplaceholder_api',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database pool error:', err.message);
    } else {
        console.log('✓ Database pool created successfully');
        connection.release();
    }
});

module.exports = pool.promise();