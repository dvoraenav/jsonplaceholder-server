const express = require('express');
const cors = require('cors');

const queries = require('./queries'); 

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// Users Routes
// ==========================================
app.get('/api/users', async (req, res) => {
    try {
        const users = await queries.getAllUsers(); 
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await queries.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
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
        console.error(error);
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
        console.error(error);
        res.status(500).json({ error: 'Error updating user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const success = await queries.deleteUser(req.params.id);
        if (!success) return res.status(404).json({ error: 'User not found' });
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
        const todos = await queries.getAllTodos();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching todos' });
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

// ==========================================
// Start Server
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});