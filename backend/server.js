const express = require('express');
const cors = require('cors');
const queries = require('./queries');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// Test Route
// ==========================================
app.get('/api/test', async (req, res) => {
    try {
        console.log('🔍 Test endpoint called - attempting query');
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        console.log('✓ Query successful:', rows);
        res.json({ message: 'MySQL connection works perfectly!', result: rows[0].solution });
    } catch (error) {
        console.error('❌ Database test error:', error.message, error.code);
        res.status(500).json({
            error: 'Database connection error',
            details: error.message,
            code: error.code
        });
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
        
        const { name, username, email, password } = req.body;
        
        const success = await queries.updateUser(req.params.id, name, username, email, password);
        
        if (!success) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error("❌ שגיאה בעדכון משתמש:", error);
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
// Albums Routes
// ==========================================
app.get('/api/users/:userId/albums', async (req, res) => {
    try {
        const albums = await queries.getAlbumsByUserId(req.params.userId);
        res.json(albums);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user albums' });
    }
});

app.post('/api/albums', async (req, res) => {
    try {
        const { user_id, title } = req.body;
        if (!user_id || !title) return res.status(400).json({ error: 'Missing fields' });

        const newAlbum = await queries.createAlbum(user_id, title);
        res.status(201).json(newAlbum);
    } catch (error) {
        res.status(500).json({ error: 'Error creating album' });
    }
});

app.put('/api/albums/:id', async (req, res) => {
    try {
        const { title, userId } = req.body;
        const album = await queries.getAlbumById(req.params.id);
        if (!album) return res.status(404).json({ error: 'Album not found' });

        if (userId && album.user_id !== parseInt(userId, 10)) {
            return res.status(403).json({ error: 'Unauthorized: Album does not belong to active user' });
        }

        const success = await queries.updateAlbum(req.params.id, title);
        if (!success) return res.status(404).json({ error: 'Album not found' });
        res.json({ message: 'Album updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating album' });
    }
});

app.delete('/api/albums/:id', async (req, res) => {
    try {
        const userId = req.query?.userId || req.body?.userId;
        const album = await queries.getAlbumById(req.params.id);
        if (!album) return res.status(404).json({ error: 'Album not found' });

        if (userId && album.user_id !== parseInt(userId, 10)) {
            return res.status(403).json({ error: 'Unauthorized: Album does not belong to active user' });
        }

        const success = await queries.deleteAlbum(req.params.id);
        if (!success) return res.status(404).json({ error: 'Album not found' });
        res.json({ message: 'Album deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting album' });
    }
});

// ==========================================
// Photos Routes
// ==========================================
app.get('/api/albums/:albumId/photos', async (req, res) => {
    try {
        const photos = await queries.getPhotosByAlbumId(req.params.albumId);
        res.json(photos);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching album photos' });
    }
});

app.post('/api/photos', async (req, res) => {
    try {
        const { album_id, title, url, thumbnailUrl, userId } = req.body;
        if (!album_id || !title || !url) return res.status(400).json({ error: 'Missing fields' });

        const album = await queries.getAlbumById(album_id);
        if (!album) return res.status(404).json({ error: 'Album not found' });
        if (userId && album.user_id !== parseInt(userId, 10)) {
            return res.status(403).json({ error: 'Unauthorized: Photo does not belong to active user' });
        }

        const newPhoto = await queries.createPhoto(album_id, title, url, thumbnailUrl);
        res.status(201).json(newPhoto);
    } catch (error) {
        res.status(500).json({ error: 'Error creating photo' });
    }
});

app.put('/api/photos/:id', async (req, res) => {
    try {
        const { title, url, thumbnailUrl, userId } = req.body;
        const photo = await queries.getPhotoById(req.params.id);
        if (!photo) return res.status(404).json({ error: 'Photo not found' });

        const album = await queries.getAlbumById(photo.album_id);
        if (userId && album.user_id !== parseInt(userId, 10)) {
            return res.status(403).json({ error: 'Unauthorized: Photo does not belong to active user' });
        }

        const success = await queries.updatePhoto(req.params.id, title, url, thumbnailUrl);
        if (!success) return res.status(404).json({ error: 'Photo not found' });
        res.json({ message: 'Photo updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating photo' });
    }
});

app.delete('/api/photos/:id', async (req, res) => {
    try {
        const userId = req.query?.userId || req.body?.userId;
        const photo = await queries.getPhotoById(req.params.id);
        if (!photo) return res.status(404).json({ error: 'Photo not found' });

        const album = await queries.getAlbumById(photo.album_id);
        if (userId && album.user_id !== parseInt(userId, 10)) {
            return res.status(403).json({ error: 'Unauthorized: Photo does not belong to active user' });
        }

        const success = await queries.deletePhoto(req.params.id);
        if (!success) return res.status(404).json({ error: 'Photo not found' });
        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting photo' });
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
        
        const { q, completed, limit } = req.query;
        
        const todos = await queries.getTodosByUserId(req.params.userId, { q, completed, limit });
        res.json(todos);
    } catch (error) {
        console.error(error);
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
        // Extract query parameters sent by React
        const { q, limit } = req.query;
        
        // Pass the filters object to the query function
        const posts = await queries.getPostsByUserId(req.params.userId, { q, limit });
        res.json(posts);
    } catch (error) {
        console.error("❌ Error fetching user posts:", error);
        res.status(500).json({ error: 'Error fetching posts' });
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
        const { limit } = req.query;
        const comments = await queries.getCommentsByPostId(req.params.id, { limit });
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
        const { title, body, userId } = req.body;
        const post = await queries.getPostById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        
        // Ownership Validation
        if (userId && post.user_id !== parseInt(userId, 10)) {
            return res.status(403).json({ error: 'Unauthorized: Post does not belong to active user' });
        }

        const success = await queries.updatePost(req.params.id, title, body);
        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating post' });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    try {
        const userId = req.query?.userId || req.body?.userId;
        const post = await queries.getPostById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Ownership Validation
        if (userId && post.user_id !== parseInt(userId, 10)) {
            return res.status(403).json({ error: 'Unauthorized: Post does not belong to active user' });
        }

        const success = await queries.deletePost(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error("❌ שגיאה במחיקת פוסט:", error);
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
        const { name, email, body, requesterEmail } = req.body;
        const comment = await queries.getCommentById(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        // Ownership Validation
        if (requesterEmail && comment.email !== requesterEmail) {
            return res.status(403).json({ error: 'Unauthorized: Comment does not belong to active user' });
        }

        const success = await queries.updateComment(req.params.id, name, email, body);
        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating comment' });
    }
});

app.delete('/api/comments/:id', async (req, res) => {
    try {
        const requesterEmail = req.query?.requesterEmail || req.body?.requesterEmail;
        const comment = await queries.getCommentById(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        // Ownership Validation
        if (requesterEmail && comment.email !== requesterEmail) {
            return res.status(403).json({ error: 'Unauthorized: Comment does not belong to active user' });
        }

        const success = await queries.deleteComment(req.params.id);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error("❌ השרת התרסק במחיקה בגלל:", error);
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