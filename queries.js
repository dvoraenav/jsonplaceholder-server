const db = require('./db');

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

async function updateUser(id, name, username, email) {
    const [result] = await db.query('UPDATE users SET name = ?, username = ?, email = ? WHERE id = ?', [name, username, email, id]);
    return result.affectedRows > 0;
}

async function deleteUser(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

// ==========================================
// Todos Functions
// ==========================================
async function getAllTodos() {
    const [todos] = await db.query('SELECT * FROM todos');
    return todos;
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
// Posts & Comments Functions
// ==========================================
async function getAllPosts() {
    const [posts] = await db.query('SELECT * FROM posts');
    return posts;
}

async function getPostById(id) {
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    return posts.length > 0 ? posts[0] : null;
}

async function getCommentsByPostId(postId) {
    const [comments] = await db.query('SELECT * FROM comments WHERE post_id = ?', [postId]);
    return comments;
}

// Exporting all functions so server.js can use them
module.exports = {
    getAllUsers, getUserById, createUser, updateUser, deleteUser,
    getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo,
    getAllPosts, getPostById, getCommentsByPostId
};