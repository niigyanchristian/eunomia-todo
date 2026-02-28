import db from './db.js';
import { strict as assert } from 'assert';

// Test database connection and table creation
function testDatabaseSetup() {
  console.log('Testing database connection and setup...');

  try {
    // Test 1: Verify database connection
    const isOpen = db.open;
    assert.ok(isOpen, 'Database should be open');
    console.log('✓ Database connection verified');

    // Test 2: Verify todos table exists
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='todos'").get();
    assert.ok(tableInfo, 'Todos table should exist');
    assert.strictEqual(tableInfo.name, 'todos', 'Table name should be "todos"');
    console.log('✓ Todos table exists');

    // Test 3: Verify table schema
    const columns = db.prepare('PRAGMA table_info(todos)').all();
    const columnNames = columns.map(col => col.name);

    assert.ok(columnNames.includes('id'), 'Table should have id column');
    assert.ok(columnNames.includes('title'), 'Table should have title column');
    assert.ok(columnNames.includes('description'), 'Table should have description column');
    assert.ok(columnNames.includes('completed'), 'Table should have completed column');
    assert.ok(columnNames.includes('created_at'), 'Table should have created_at column');
    assert.ok(columnNames.includes('updated_at'), 'Table should have updated_at column');
    console.log('✓ All required columns exist');

    // Test 4: Verify column types and constraints
    const idColumn = columns.find(col => col.name === 'id');
    assert.strictEqual(idColumn.type, 'INTEGER', 'id should be INTEGER type');
    assert.strictEqual(idColumn.pk, 1, 'id should be primary key');

    const titleColumn = columns.find(col => col.name === 'title');
    assert.strictEqual(titleColumn.type, 'TEXT', 'title should be TEXT type');
    assert.strictEqual(titleColumn.notnull, 1, 'title should be NOT NULL');

    const descriptionColumn = columns.find(col => col.name === 'description');
    assert.strictEqual(descriptionColumn.type, 'TEXT', 'description should be TEXT type');
    assert.strictEqual(descriptionColumn.dflt_value, "''", 'description should default to empty string');

    const completedColumn = columns.find(col => col.name === 'completed');
    assert.strictEqual(completedColumn.type, 'BOOLEAN', 'completed should be BOOLEAN type');
    assert.strictEqual(completedColumn.dflt_value, '0', 'completed should default to 0');

    console.log('✓ Column types and constraints verified');

    // Test 5: Verify we can insert a record
    const insert = db.prepare('INSERT INTO todos (title, description) VALUES (?, ?)');
    const result = insert.run('Test Todo', 'This is a test');
    assert.ok(result.lastInsertRowid, 'Should return inserted row id');
    console.log('✓ Can insert records');

    // Test 6: Verify we can read the record
    const select = db.prepare('SELECT * FROM todos WHERE id = ?');
    const row = select.get(result.lastInsertRowid);
    assert.strictEqual(row.title, 'Test Todo', 'Title should match');
    assert.strictEqual(row.description, 'This is a test', 'Description should match');
    assert.strictEqual(row.completed, 0, 'Completed should default to 0');
    assert.ok(row.created_at, 'created_at should be set');
    assert.ok(row.updated_at, 'updated_at should be set');
    console.log('✓ Can read records');

    // Test 7: Clean up test data
    db.prepare('DELETE FROM todos WHERE id = ?').run(result.lastInsertRowid);
    console.log('✓ Test data cleaned up');

    console.log('\n✅ All database tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// Run tests
testDatabaseSetup();
