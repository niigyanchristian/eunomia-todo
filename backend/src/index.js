import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/todos', (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM todos';
    const params = [];

    // Apply filtering based on status parameter
    if (status === 'active') {
      query += ' WHERE completed = ?';
      params.push(0);
    } else if (status === 'completed') {
      query += ' WHERE completed = ?';
      params.push(1);
    }

    // Order by created_at DESC
    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const todos = stmt.all(...params);

    res.json(todos);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Fetch todo by ID
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);

    // Return 404 if todo doesn't exist
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate title is present
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Validate title length (max 200 characters)
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }

    // Insert new todo
    const stmt = db.prepare('INSERT INTO todos (title, description) VALUES (?, ?)');
    const result = stmt.run(title, description || '');

    // Query back the created todo
    const createdTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(createdTodo);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
