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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
