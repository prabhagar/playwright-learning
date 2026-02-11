const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'website')));
app.use(express.json());

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'login.html'));
});

// Mock API endpoints
app.get('/api/users', (req, res) => {
    res.json([
        { id: 1, name: 'John Admin', email: 'john@example.com', role: 'admin', status: 'active' },
        { id: 2, name: 'Jane User', email: 'jane@example.com', role: 'user', status: 'active' },
        { id: 3, name: 'Bob Moderator', email: 'bob@example.com', role: 'moderator', status: 'inactive' },
    ]);
});

app.post('/api/users', (req, res) => {
    const { name, email, role } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    res.status(201).json({
        id: Math.floor(Math.random() * 10000),
        name,
        email,
        role: role || 'user',
        status: 'active'
    });
});

app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        id: parseInt(id),
        name: 'Sample User',
        email: 'user@example.com',
        role: 'user',
        status: 'active'
    });
});

app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    res.json({
        id: parseInt(id),
        name: name || 'Updated User',
        email: email || 'updated@example.com',
        role: role || 'user',
        status: 'active'
    });
});

app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `User ${id} deleted successfully` });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API health endpoint (tests expect /api/health)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🎭 Playwright Learning Lab running on http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop\n`);
});
