// ==========================================
// One-off script: create a default ADMIN account
// ==========================================
// Inserts a user "ADMIN" with is_admin = TRUE and password "123456".
// Safe to re-run: if the username already exists it just reports it.
//
// Run with:  node backend/create-admin.js

const db = require('./db');

const ADMIN = {
    name: 'ADMIN',
    username: 'ADMIN',
    email: 'admin@admin.com',
    password: '123456',
};

(async () => {
    const connection = await db.getConnection();
    try {
        const [existing] = await connection.query(
            'SELECT id FROM users WHERE username = ?',
            [ADMIN.username]
        );
        if (existing.length > 0) {
            console.log(`Admin user "${ADMIN.username}" already exists (id ${existing[0].id}).`);
            return;
        }

        await connection.beginTransaction();

        const [userResult] = await connection.query(
            'INSERT INTO users (name, username, email, is_admin, is_blocked) VALUES (?, ?, ?, TRUE, FALSE)',
            [ADMIN.name, ADMIN.username, ADMIN.email]
        );
        const newUserId = userResult.insertId;

        await connection.query(
            'INSERT INTO passwords (user_id, password_hash) VALUES (?, ?)',
            [newUserId, ADMIN.password]
        );

        await connection.commit();
        console.log(`Admin user created: id ${newUserId}, username "${ADMIN.username}", password "${ADMIN.password}".`);
    } catch (error) {
        await connection.rollback();
        console.error('Failed to create admin:', error.code || error.message);
    } finally {
        connection.release();
        process.exit(0);
    }
})();
