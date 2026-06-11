const db = require('./db');

// ==========================================
// Auth Functions
// ==========================================
async function verifyLogin(username, password) {
    const [rows] = await db.query(
        `SELECT u.id, u.name, u.username, u.email 
         FROM users u 
         JOIN passwords p ON u.id = p.user_id 
         WHERE u.username = ? AND p.password_hash = ?`,
        [username, password]
    );
    return rows.length > 0 ? rows[0] : null;
}

async function registerUser(name, username, email, password) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [userResult] = await connection.query(
            'INSERT INTO users (name, username, email) VALUES (?, ?, ?)',
            [name, username, email]
        );
        const newUserId = userResult.insertId;

        await connection.query(
            'INSERT INTO passwords (user_id, password_hash) VALUES (?, ?)',
            [newUserId, password]
        );

        await connection.commit();
        return { id: newUserId, name, username, email };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// ==========================================
// Users Functions
// ==========================================
async function getAllUsers() {
    const [users] = await db.query('SELECT * FROM users');
    return users;
}

async function getUserById(id) {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return users.length > 0 ? users[0] : null;
}

async function createUser(name, username, email) {
    const [result] = await db.query('INSERT INTO users (name, username, email) VALUES (?, ?, ?)', [name, username, email]);
    return { id: result.insertId, name, username, email };
}

async function updateUser(id, name, username, email, password) {
    const userSql = 'UPDATE users SET name = ?, username = ?, email = ? WHERE id = ?';
    const [userResult] = await db.query(userSql, [name, username, email, id]);

    if (password && password.trim() !== '') {
        const passSql = 'UPDATE passwords SET password_hash = ? WHERE user_id = ?';
        await db.query(passSql, [password, id]);
    }

    return userResult.affectedRows > 0;
}

async function deleteUser(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

// ==========================================
// Albums Functions
// ==========================================
async function getAlbumsByUserId(userId) {
    const [albums] = await db.query('SELECT * FROM albums WHERE user_id = ? ORDER BY id ASC', [userId]);
    return albums;
}

async function getAlbumById(id) {
    const [albums] = await db.query('SELECT * FROM albums WHERE id = ?', [id]);
    return albums.length > 0 ? albums[0] : null;
}

async function createAlbum(user_id, title) {
    const [result] = await db.query('INSERT INTO albums (user_id, title) VALUES (?, ?)', [user_id, title]);
    return { id: result.insertId, user_id, title };
}

async function updateAlbum(id, title) {
    const [result] = await db.query('UPDATE albums SET title = ? WHERE id = ?', [title, id]);
    return result.affectedRows > 0;
}

async function deleteAlbum(id) {
    const [result] = await db.query('DELETE FROM albums WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

// ==========================================
// Photos Functions
// ==========================================
async function getPhotosByAlbumId(albumId) {
    const [photos] = await db.query('SELECT * FROM photos WHERE album_id = ? ORDER BY id ASC', [albumId]);
    return photos;
}

async function getPhotoById(id) {
    const [photos] = await db.query('SELECT * FROM photos WHERE id = ?', [id]);
    return photos.length > 0 ? photos[0] : null;
}

async function createPhoto(album_id, title, url, thumbnailUrl) {
    const resolvedThumbnailUrl = thumbnailUrl || url;
    const [result] = await db.query(
        'INSERT INTO photos (album_id, title, url, thumbnailUrl) VALUES (?, ?, ?, ?)',
        [album_id, title, url, resolvedThumbnailUrl]
    );
    return { id: result.insertId, album_id, title, url, thumbnailUrl: resolvedThumbnailUrl };
}

async function updatePhoto(id, title, url, thumbnailUrl) {
    const resolvedThumbnailUrl = thumbnailUrl || url;
    const [result] = await db.query('UPDATE photos SET title = ?, url = ?, thumbnailUrl = ? WHERE id = ?', [title, url, resolvedThumbnailUrl, id]);
    return result.affectedRows > 0;
}

async function deletePhoto(id) {
    const [result] = await db.query('DELETE FROM photos WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

// ==========================================
// Todos Functions
// ==========================================
async function getAllTodos() {
    const [todos] = await db.query('SELECT * FROM todos');
    return todos;
}

async function getTodosByUserId(userId, filters = {}) {
    let sql = 'SELECT * FROM todos WHERE user_id = ?';
    const params = [userId];

    if (filters.q) {
        sql += ' AND title LIKE ?';
        params.push(`%${filters.q}%`);
    }

    if (filters.completed !== undefined && filters.completed !== '') {
        sql += ' AND completed = ?';
        params.push(filters.completed === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY id ASC';

    if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
    }

    const [rows] = await db.query(sql, params);
    return rows;
}

async function getTodoById(id) {
    const [todos] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
    return todos.length > 0 ? todos[0] : null;
}

async function createTodo(user_id, title, completed) {
    const isCompleted = completed ? true : false;
    const [result] = await db.query('INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?)', [user_id, title, isCompleted]);
    return { id: result.insertId, user_id, title, completed: isCompleted };
}

async function updateTodo(id, title, completed) {
    const [result] = await db.query('UPDATE todos SET title = ?, completed = ? WHERE id = ?', [title, completed, id]);
    return result.affectedRows > 0;
}

async function deleteTodo(id) {
    const [result] = await db.query('DELETE FROM todos WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

// ==========================================
// Posts Functions
// ==========================================
async function getAllPosts() {
    const [posts] = await db.query('SELECT * FROM posts');
    return posts;
}

async function getPostsByUserId(userId, filters = {}) {
    let sql = 'SELECT * FROM posts WHERE user_id = ?';
    const params = [userId];

    if (filters.q) {
        sql += ' AND title LIKE ?';
        params.push(`%${filters.q}%`);
    }

    sql += ' ORDER BY id ASC';

    if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
    }

    const [rows] = await db.query(sql, params);
    return rows;
}

async function getPostById(id) {
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    return posts.length > 0 ? posts[0] : null;
}

async function createPost(user_id, title, body) {
    const [result] = await db.query('INSERT INTO posts (user_id, title, body) VALUES (?, ?, ?)', [user_id, title, body]);
    return { id: result.insertId, user_id, title, body };
}

async function updatePost(id, title, body) {
    const [result] = await db.query('UPDATE posts SET title = ?, body = ? WHERE id = ?', [title, body, id]);
    return result.affectedRows > 0;
}

async function deletePost(id) {
    const [result] = await db.query('DELETE FROM posts WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

// ==========================================
// Comments Functions
// ==========================================
async function getAllComments() {
    const [comments] = await db.query('SELECT * FROM comments');
    return comments;
}

async function getCommentsByPostId(postId) {
    const [comments] = await db.query('SELECT * FROM comments WHERE post_id = ?', [postId]);
    return comments;
}

async function getCommentById(id) {
    const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
}

async function createComment(post_id, name, email, body) {
    const [result] = await db.query('INSERT INTO comments (post_id, name, email, body) VALUES (?, ?, ?, ?)', [post_id, name, email, body]);
    return { id: result.insertId, post_id, name, email, body };
}

async function updateComment(id, name, email, body) {
    const [result] = await db.query('UPDATE comments SET name = ?, email = ?, body = ? WHERE id = ?', [name, email, body, id]);
    return result.affectedRows > 0;
}

async function deleteComment(id) {
    const [result] = await db.query('DELETE FROM comments WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

module.exports = {
    verifyLogin, registerUser,
    getAllUsers, getUserById, createUser, updateUser, deleteUser,
    getAlbumsByUserId, getAlbumById, createAlbum, updateAlbum, deleteAlbum,
    getPhotosByAlbumId, getPhotoById, createPhoto, updatePhoto, deletePhoto,
    getAllTodos, getTodosByUserId, getTodoById, createTodo, updateTodo, deleteTodo,
    getAllPosts, getPostsByUserId, getPostById, createPost, updatePost, deletePost,
    getAllComments, getCommentsByPostId, getCommentById, createComment, updateComment, deleteComment
};