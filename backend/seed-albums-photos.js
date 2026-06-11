const db = require('./db');

async function seedAlbumsAndPhotos() {
    try {
        console.log('Starting albums and photos seeding...');

        const [users] = await db.query('SELECT id FROM users ORDER BY id ASC');
        console.log(`Found ${users.length} existing users...`);

        for (const user of users) {
            const albumsResponse = await fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/albums`);
            if (!albumsResponse.ok) throw new Error(`Failed to fetch albums for user ${user.id}`);

            const userAlbums = await albumsResponse.json();
            const limitedAlbums = userAlbums.slice(0, 2);

            for (const album of limitedAlbums) {
                await db.query(
                    'INSERT INTO albums (id, user_id, title) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), user_id = VALUES(user_id)',
                    [album.id, user.id, album.title]
                );

                const photosResponse = await fetch(`https://jsonplaceholder.typicode.com/albums/${album.id}/photos`);
                if (!photosResponse.ok) throw new Error(`Failed to fetch photos for album ${album.id}`);

                const albumPhotos = await photosResponse.json();
                const limitedPhotos = albumPhotos.slice(0, 3);

                for (const photo of limitedPhotos) {
                    await db.query(
                        'INSERT INTO photos (id, album_id, title, url, thumbnailUrl) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), url = VALUES(url), thumbnailUrl = VALUES(thumbnailUrl), album_id = VALUES(album_id)',
                        [photo.id, album.id, photo.title, photo.url, photo.thumbnailUrl]
                    );
                }
            }
        }

        console.log('✅ Albums and photos seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during albums/photos seeding:', error);
        process.exit(1);
    }
}

seedAlbumsAndPhotos();