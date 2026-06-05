const express = require('express');
const cors = require('cors');
const queries = require('./queries'); 

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
// Authentication Routes
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

        const user = await queries.verifyLogin(username, password);
        if (!user) return res.status(401).json({ error: 'Invalid username or password' });

        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error during login process' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        if (!name || !username || !email || !password) return res.status(400).json({ error: 'All fields are required' });

        const newUser = await queries.registerUser(name, username, email, password);
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Username or Email already exists' });
        res.status(500).json({ error: 'Error during registration process' });
    }
});

// ==========================================
// Users Routes
// ==========================================
app.get('/api/users', async (req, res) => {
    try {
        const users = await queries.getAllUsers(); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await queries.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, username, email } = req.body;
        if (!name || !username || !email) return res.status(400).json({ error: 'Missing fields' });

        const newUser = await queries.createUser(name, username, email);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, username, email } = req.body;
        const success = await queries.updateUser(req.params.id, name, username, email);
        if (!success) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const success = await queries.deleteUser(req.params.id);
        if (!success) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// ==========================================
// Todos Routes
// ==========================================
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await queries.getAllTodos();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching todos' });
    }
});

app.get('/api/users/:userId/todos', async (req, res) => {
    try {
        const todos = await queries.getTodosByUserId(req.params.userId);
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user todos' });
    }
});

app.get('/api/todos/:id', async (req, res) => {
    try {
        const todo = await queries.getTodoById(req.params.id);
        if (!todo) return res.status(404).json({ error: 'Todo not found' });
        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching todo' });
    }
});

app.post('/api/todos', async (req, res) => {
    try {
        const { user_id, title, completed } = req.body;
        if (!user_id || !title) return res.status(400).json({ error: 'Missing fields' });

        const newTodo = await queries.createTodo(user_id, title, completed);
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(500).json({ error: 'Error creating todo' });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    try {
        const { title, completed } = req.body;
        const success = await queries.updateTodo(req.params.id, title, completed);
        if (!success) return res.status(404).json({ error: 'Todo not found' });
        res.json({ message: 'Todo updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating todo' });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        const success = await queries.deleteTodo(req.params.id);
        if (!success) return res.status(404).json({ error: 'Todo not found' });
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting todo' });
    }
});

// ==========================================
// Posts Routes
// ==========================================
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await queries.getAllPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching posts' });
    }
});

app.get('/api/users/:userId/posts', async (req, res) => {
    try {
        const posts = await queries.getPostsByUserId(req.params.userId);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user posts' });
    }
});

app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await queries.getPostById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching post' });
    }
});

app.get('/api/posts/:id/comments', async (req, res) => {
    try {
        const comments = await queries.getCommentsByPostId(req.params.id);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching comments for this post' });
    }
});

app.post('/api/posts', async (req, res) => {
    try {
        const { user_id, title, body } = req.body;
        if (!user_id || !title) return res.status(400).json({ error: 'Missing fields' });

        const newPost = await queries.createPost(user_id, title, body);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Error creating post' });
    }
});

app.put('/api/posts/:id', async (req, res) => {
    try {
        const { title, body } = req.body;
        const success = await queries.updatePost(req.params.id, title, body);
        if (!success) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating post' });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    try {
        const success = await queries.deletePost(req.params.id);
        if (!success) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting post' });
    }
});

// ==========================================
// Comments Routes
// ==========================================
app.get('/api/comments', async (req, res) => {
    try {
        const comments = await queries.getAllComments();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching comments' });
    }
});

app.post('/api/comments', async (req, res) => {
    try {
        const { post_id, name, email, body } = req.body;
        if (!post_id || !name || !email) return res.status(400).json({ error: 'Missing fields' });

        const newComment = await queries.createComment(post_id, name, email, body);
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: 'Error creating comment' });
    }
});

app.put('/api/comments/:id', async (req, res) => {
    try {
        const { name, email, body } = req.body;
        const success = await queries.updateComment(req.params.id, name, email, body);
        if (!success) return res.status(404).json({ error: 'Comment not found' });
        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating comment' });
    }
});

app.delete('/api/comments/:id', async (req, res) => {
    try {
        const success = await queries.deleteComment(req.params.id);
        if (!success) return res.status(404).json({ error: 'Comment not found' });
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
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