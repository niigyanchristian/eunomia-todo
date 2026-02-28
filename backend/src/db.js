import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create/open database file at backend/todos.db
const dbPath = join(__dirname, '..', 'todos.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create todos table with the specified schema
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createTableSQL);

// Create a trigger to automatically update the updated_at timestamp
const createTriggerSQL = `
  CREATE TRIGGER IF NOT EXISTS update_todos_timestamp
  AFTER UPDATE ON todos
  FOR EACH ROW
  BEGIN
    UPDATE todos SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
  END
`;

db.exec(createTriggerSQL);

// Export the database instance as default export
export default db;
