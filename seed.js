const db = require('./db');

async function seedDatabase() {
    try {
        console.log('Starting expanded database seeding...');

        // 1. Fetch and insert all 10 users
        const usersResponse = await fetch('https://jsonplaceholder.typicode.com/users');
        const allUsers = await usersResponse.json();
        const limitedUsers = allUsers.slice(0, 10); // Takes all 10 users

        console.log(`Inserting ${limitedUsers.length} users...`);
        for (const user of limitedUsers) {
            await db.query(
                'INSERT INTO users (id, name, username, email) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                [user.id, user.name, user.username, user.email]
            );

            // 2. Fetch and insert 2 Albums for this specific user
            const albumsResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/albums`);
            const userAlbums = await albumsResponse.json();
            const limitedAlbums = userAlbums.slice(0, 2);

            for (const album of limitedAlbums) {
                await db.query(
                    'INSERT INTO albums (id, user_id, title) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                    [album.id, user.id, album.title]
                );

                // 3. Fetch and insert 3 Photos for this specific album
                const photosResponse = await fetch(`https://jsonplaceholder.typicode.com/albums/${album.id}/photos`);
                const albumPhotos = await photosResponse.json();
                const limitedPhotos = albumPhotos.slice(0, 3);

                for (const photo of limitedPhotos) {
                    await db.query(
                        'INSERT INTO photos (id, album_id, title, url, thumbnailUrl) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                        [photo.id, album.id, photo.title, photo.url, photo.thumbnailUrl]
                    );
                }
            }

            // 4. Fetch and insert 5 Todos for this specific user
            const todosResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/todos`);
            const userTodos = await todosResponse.json();
            const limitedTodos = userTodos.slice(0, 5); // Increased to 5 todos per user

            for (const todo of limitedTodos) {
                await db.query(
                    'INSERT INTO todos (id, user_id, title, completed) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                    [todo.id, user.id, todo.title, todo.completed]
                );
            }

            // 5. Fetch and insert 4 Posts for this specific user
            const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/posts`);
            const userPosts = await postsResponse.json();
            const limitedPosts = userPosts.slice(0, 4); // Increased to 4 posts per user

            for (const post of limitedPosts) {
                await db.query(
                    'INSERT INTO posts (id, user_id, title, body) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                    [post.id, user.id, post.title, post.body]
                );

                // 6. Fetch and insert 3 Comments for this specific post
                const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`);
                const postComments = await commentsResponse.json();
                const limitedComments = postComments.slice(0, 3); // Increased to 3 comments per post

                for (const comment of limitedComments) {
                    await db.query(
                        'INSERT INTO comments (id, post_id, name, email, body) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
                        [comment.id, post.id, comment.name, comment.email, comment.body]
                    );
                }
            }
        }

        console.log('✅ Database successfully seeded with users, albums, photos, posts & comments!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}

seedDatabase();