const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// Test Route
// ==========================================
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ message: 'MySQL connection works perfectly!', result: rows[0].solution });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database connection error' });
    }
});

// ==========================================
// Users Routes
// ==========================================
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching user' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, username, email } = req.body;
        if (!name || !username || !email) return res.status(400).json({ error: 'Name, username, and email are required' });

        const [result] = await db.query('INSERT INTO users (name, username, email) VALUES (?, ?, ?)', [name, username, email]);
        res.status(201).json({ id: result.insertId, name, username, email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, username, email } = req.body;

        const [result] = await db.query('UPDATE users SET name = ?, username = ?, email = ? WHERE id = ?', [name, username, email, userId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        
        res.json({ message: 'User updated successfully', id: userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// ==========================================
// Todos Routes
// ==========================================
app.get('/api/todos', async (req, res) => {
    try {
        const [todos] = await db.query('SELECT * FROM todos');
        res.json(todos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching todos' });
    }
});

app.get('/api/todos/:id', async (req, res) => {
    try {
        const todoId = req.params.id;
        const [todos] = await db.query('SELECT * FROM todos WHERE id = ?', [todoId]);
        
        if (todos.length === 0) return res.status(404).json({ error: 'Todo not found' });
        res.json(todos[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching todo' });
    }
});

app.post('/api/todos', async (req, res) => {
    try {
        const { user_id, title, completed } = req.body;
        if (!user_id || !title) return res.status(400).json({ error: 'user_id and title are required' });

        const isCompleted = completed ? true : false;
        const [result] = await db.query('INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?)', [user_id, title, isCompleted]);
        
        res.status(201).json({ id: result.insertId, user_id, title, completed: isCompleted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating todo' });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    try {
        const todoId = req.params.id;
        const { title, completed } = req.body;

        const [result] = await db.query('UPDATE todos SET title = ?, completed = ? WHERE id = ?', [title, completed, todoId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Todo not found' });
        
        res.json({ message: 'Todo updated successfully', id: todoId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating todo' });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        const todoId = req.params.id;
        const [result] = await db.query('DELETE FROM todos WHERE id = ?', [todoId]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Todo not found' });
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting todo' });
    }
});

// ==========================================
// Posts Routes
// ==========================================
app.get('/api/posts', async (req, res) => {
    try {
        const [posts] = await db.query('SELECT * FROM posts');
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});

app.get('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
        
        if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json(posts[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching post' });
    }
});

// Nested route: Fetch all comments for a specific post
app.get('/api/posts/:id/comments', async (req, res) => {
    try {
        const postId = req.params.id;
        const [comments] = await db.query('SELECT * FROM comments WHERE post_id = ?', [postId]);
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching comments for this post' });
    }
});

app.post('/api/posts', async (req, res) => {
    try {
        const { user_id, title, body } = req.body;
        if (!user_id || !title) return res.status(400).json({ error: 'user_id and title are required' });

        const [result] = await db.query('INSERT INTO posts (user_id, title, body) VALUES (?, ?, ?)', [user_id, title, body]);
        res.status(201).json({ id: result.insertId, user_id, title, body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating post' });
    }
});

app.put('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, body } = req.body;

        const [result] = await db.query('UPDATE posts SET title = ?, body = ? WHERE id = ?', [title, body, postId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Post not found' });
        
        res.json({ message: 'Post updated successfully', id: postId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating post' });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const [result] = await db.query('DELETE FROM posts WHERE id = ?', [postId]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting post' });
    }
});

// ==========================================
// Comments Routes
// ==========================================
app.get('/api/comments', async (req, res) => {
    try {
        const [comments] = await db.query('SELECT * FROM comments');
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching comments' });
    }
});

app.post('/api/comments', async (req, res) => {
    try {
        const { post_id, name, email, body } = req.body;
        if (!post_id || !name || !email) return res.status(400).json({ error: 'post_id, name, and email are required' });

        const [result] = await db.query('INSERT INTO comments (post_id, name, email, body) VALUES (?, ?, ?, ?)', [post_id, name, email, body]);
        res.status(201).json({ id: result.insertId, post_id, name, email, body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating comment' });
    }
});

app.put('/api/comments/:id', async (req, res) => {
    try {
        const commentId = req.params.id;
        const { name, email, body } = req.body;

        const [result] = await db.query('UPDATE comments SET name = ?, email = ?, body = ? WHERE id = ?', [name, email, body, commentId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Comment not found' });
        
        res.json({ message: 'Comment updated successfully', id: commentId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating comment' });
    }
});

app.delete('/api/comments/:id', async (req, res) => {
    try {
        const commentId = req.params.id;
        const [result] = await db.query('DELETE FROM comments WHERE id = ?', [commentId]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Comment not found' });
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting comment' });
    }
});

// ==========================================
// Start Server
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});