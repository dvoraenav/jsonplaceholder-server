const db = require('./db');

// ============================================================
// JSONPlaceholder API - FINAL united seed script
// Seeds EVERYTHING in one run:
//   users (+ login passwords), todos, albums, photos, posts, comments,
//   and a default ADMIN account.
// This file consolidates seed.js + create-admin.js.
//
// Run with:  node backend/seed_final.js
// (run from the backend/ folder so .env is picked up)
// ============================================================

// Default login password given to every seeded JSONPlaceholder user.
// Passwords are stored in plain text in `password_hash` to match the
// existing login flow (verifyLogin compares the raw value).
const DEFAULT_PASSWORD = '123456';

// Default admin account
const ADMIN = {
    name: 'ADMIN',
    username: 'ADMIN',
    email: 'admin@admin.com',
    password: '123456',
};

// How much sample data to pull per entity
const LIMITS = {
    users: 10,
    todosPerUser: 5,
    albumsPerUser: 3,
    photosPerAlbum: 5,
    postsPerUser: 4,
    commentsPerPost: 3,
};

async function seedDatabase() {
    try {
        console.log('Starting united database seeding...');

        // 1. Fetch all users
        const usersResponse = await fetch('https://jsonplaceholder.typicode.com/users');
        const allUsers = await usersResponse.json();
        const limitedUsers = allUsers.slice(0, LIMITS.users);

        console.log(`Inserting ${limitedUsers.length} users...`);
        for (const user of limitedUsers) {
            // Insert the user
            await db.query(
                'INSERT INTO users (id, name, username, email) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                [user.id, user.name, user.username, user.email]
            );

            // Give the user a login password so they can sign in
            await db.query(
                'INSERT INTO passwords (user_id, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
                [user.id, DEFAULT_PASSWORD]
            );

            // 2. Todos for this user
            const todosResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/todos`);
            const userTodos = await todosResponse.json();
            for (const todo of userTodos.slice(0, LIMITS.todosPerUser)) {
                await db.query(
                    'INSERT INTO todos (id, user_id, title, completed) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                    [todo.id, user.id, todo.title, todo.completed]
                );
            }

            // 3. Albums for this user (+ photos for each album)
            const albumsResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/albums`);
            const userAlbums = await albumsResponse.json();
            for (const album of userAlbums.slice(0, LIMITS.albumsPerUser)) {
                await db.query(
                    'INSERT INTO albums (id, user_id, title) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                    [album.id, user.id, album.title]
                );

                // 4. Photos for this album
                const photosResponse = await fetch(`https://jsonplaceholder.typicode.com/albums/${album.id}/photos`);
                const albumPhotos = await photosResponse.json();
                for (const photo of albumPhotos.slice(0, LIMITS.photosPerAlbum)) {
                    await db.query(
                        'INSERT INTO photos (id, album_id, title, url, thumbnailUrl) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                        [photo.id, album.id, photo.title, photo.url, photo.thumbnailUrl]
                    );
                }
            }

            // 5. Posts for this user (+ comments for each post)
            const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/posts`);
            const userPosts = await postsResponse.json();
            for (const post of userPosts.slice(0, LIMITS.postsPerUser)) {
                await db.query(
                    'INSERT INTO posts (id, user_id, title, body) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                    [post.id, user.id, post.title, post.body]
                );

                // 6. Comments for this post
                const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`);
                const postComments = await commentsResponse.json();
                for (const comment of postComments.slice(0, LIMITS.commentsPerPost)) {
                    await db.query(
                        'INSERT INTO comments (id, post_id, name, email, body) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                        [comment.id, post.id, comment.name, comment.email, comment.body]
                    );
                }
            }
        }

        // 7. Create the default ADMIN account (if it doesn't already exist)
        await seedAdmin();

        console.log('✅ Database successfully seeded with users, passwords, todos, albums, photos, posts, comments, and an admin account!');
        console.log(`   Default user password: "${DEFAULT_PASSWORD}"`);
        console.log(`   Admin login: username "${ADMIN.username}" / password "${ADMIN.password}"`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}

async function seedAdmin() {
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [ADMIN.username]);
    if (existing.length > 0) {
        console.log(`Admin user "${ADMIN.username}" already exists (id ${existing[0].id}).`);
        return;
    }

    const [userResult] = await db.query(
        'INSERT INTO users (name, username, email, is_admin, is_blocked) VALUES (?, ?, ?, TRUE, FALSE)',
        [ADMIN.name, ADMIN.username, ADMIN.email]
    );
    const newUserId = userResult.insertId;

    await db.query(
        'INSERT INTO passwords (user_id, password_hash) VALUES (?, ?)',
        [newUserId, ADMIN.password]
    );

    console.log(`Admin user created: id ${newUserId}, username "${ADMIN.username}".`);
}

seedDatabase();
