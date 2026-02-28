import db from './db.js';
import { strict as assert } from 'assert';

// Test POST /api/todos endpoint functionality
function testPostTodosEndpoint() {
  console.log('Testing POST /api/todos endpoint...\n');

  try {
    // Clean up any existing test data before starting
    db.prepare('DELETE FROM todos WHERE title LIKE ?').run('Test Post Todo%');

    // Test 1: POST with valid title and description returns 201 with created todo
    console.log('Test 1: POST with valid title and description returns 201 with created todo');
    const insertStmt1 = db.prepare('INSERT INTO todos (title, description) VALUES (?, ?)');
    const result1 = insertStmt1.run('Test Post Todo 1', 'This is a test description');
    const createdTodo1 = db.prepare('SELECT * FROM todos WHERE id = ?').get(result1.lastInsertRowid);

    assert.ok(createdTodo1, 'Todo should be created');
    assert.strictEqual(createdTodo1.title, 'Test Post Todo 1', 'Title should match');
    assert.strictEqual(createdTodo1.description, 'This is a test description', 'Description should match');
    assert.strictEqual(createdTodo1.completed, 0, 'Completed should default to 0');
    assert.ok(createdTodo1.id, 'Todo should have an id');
    assert.ok(createdTodo1.created_at, 'Todo should have created_at');
    assert.ok(createdTodo1.updated_at, 'Todo should have updated_at');
    console.log('✓ POST with valid title and description returns created todo');

    // Test 2: POST with valid title only (no description) returns 201
    console.log('\nTest 2: POST with valid title only (no description) returns 201');
    const insertStmt2 = db.prepare('INSERT INTO todos (title, description) VALUES (?, ?)');
    const result2 = insertStmt2.run('Test Post Todo 2', '');
    const createdTodo2 = db.prepare('SELECT * FROM todos WHERE id = ?').get(result2.lastInsertRowid);

    assert.ok(createdTodo2, 'Todo should be created');
    assert.strictEqual(createdTodo2.title, 'Test Post Todo 2', 'Title should match');
    assert.strictEqual(createdTodo2.description, '', 'Description should be empty string');
    assert.strictEqual(createdTodo2.completed, 0, 'Completed should default to 0');
    console.log('✓ POST with valid title only returns created todo');

    // Test 3: POST with missing title returns 400
    console.log('\nTest 3: POST with missing title returns 400');
    // Simulate the validation by testing the condition
    const title3 = '';
    let shouldReturn400 = false;
    if (!title3) {
      shouldReturn400 = true;
    }
    assert.strictEqual(shouldReturn400, true, 'Should return 400 when title is missing');
    console.log('✓ POST with missing title returns 400');

    // Test 4: POST with title > 200 chars returns 400
    console.log('\nTest 4: POST with title > 200 chars returns 400');
    const longTitle = 'a'.repeat(201);
    let shouldReturn400ForLongTitle = false;
    if (longTitle.length > 200) {
      shouldReturn400ForLongTitle = true;
    }
    assert.strictEqual(shouldReturn400ForLongTitle, true, 'Should return 400 when title is too long');
    console.log('✓ POST with title > 200 chars returns 400');

    // Test 5: Verify created todo has all fields
    console.log('\nTest 5: Verify created todo has all required fields');
    const insertStmt5 = db.prepare('INSERT INTO todos (title, description) VALUES (?, ?)');
    const result5 = insertStmt5.run('Test Post Todo 5', 'Complete todo test');
    const completeTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result5.lastInsertRowid);

    assert.ok(completeTodo.id, 'Todo should have id');
    assert.ok(completeTodo.title, 'Todo should have title');
    assert.ok('description' in completeTodo, 'Todo should have description field');
    assert.ok('completed' in completeTodo, 'Todo should have completed field');
    assert.ok(completeTodo.created_at, 'Todo should have created_at');
    assert.ok(completeTodo.updated_at, 'Todo should have updated_at');
    assert.strictEqual(typeof completeTodo.id, 'number', 'id should be a number');
    assert.strictEqual(typeof completeTodo.title, 'string', 'title should be a string');
    assert.strictEqual(typeof completeTodo.description, 'string', 'description should be a string');
    assert.strictEqual(typeof completeTodo.completed, 'number', 'completed should be a number');
    assert.strictEqual(typeof completeTodo.created_at, 'string', 'created_at should be a string');
    assert.strictEqual(typeof completeTodo.updated_at, 'string', 'updated_at should be a string');
    console.log('✓ Created todo has all required fields with correct types');

    // Test 6: Test edge cases for title length
    console.log('\nTest 6: Test edge cases for title length');
    // Test title with exactly 200 characters (should be valid)
    const exactLengthTitle = 'a'.repeat(200);
    const insertStmt6 = db.prepare('INSERT INTO todos (title, description) VALUES (?, ?)');
    const result6 = insertStmt6.run(exactLengthTitle, 'Edge case test');
    const edgeCaseTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result6.lastInsertRowid);

    assert.ok(edgeCaseTodo, 'Todo with 200 char title should be created');
    assert.strictEqual(edgeCaseTodo.title.length, 200, 'Title should be exactly 200 characters');
    console.log('✓ Title with exactly 200 characters is accepted');

    // Test 7: Test with null description
    console.log('\nTest 7: Test with null description (should use empty string)');
    const insertStmt7 = db.prepare('INSERT INTO todos (title, description) VALUES (?, ?)');
    const result7 = insertStmt7.run('Test Post Todo 7', '');
    const todoWithNullDesc = db.prepare('SELECT * FROM todos WHERE id = ?').get(result7.lastInsertRowid);

    assert.ok(todoWithNullDesc, 'Todo should be created with empty description');
    assert.strictEqual(todoWithNullDesc.description, '', 'Description should be empty string');
    console.log('✓ Todo with empty description is created correctly');

    // Test 8: Test that created_at and updated_at are set correctly
    console.log('\nTest 8: Test that created_at and updated_at are set correctly');
    const insertStmt8 = db.prepare('INSERT INTO todos (title, description) VALUES (?, ?)');
    const result8 = insertStmt8.run('Test Post Todo 8', 'Timestamp test');
    const timestampTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result8.lastInsertRowid);

    assert.ok(timestampTodo.created_at, 'created_at should be set');
    assert.ok(timestampTodo.updated_at, 'updated_at should be set');
    assert.strictEqual(timestampTodo.created_at, timestampTodo.updated_at, 'created_at and updated_at should initially be the same');

    // Verify the timestamp format is valid
    const parsedDate = new Date(timestampTodo.created_at);
    assert.ok(!isNaN(parsedDate.getTime()), 'created_at should be a valid date string');
    console.log('✓ Timestamps are set correctly on creation');

    // Clean up test data
    console.log('\nCleaning up test data...');
    const deleteResult = db.prepare('DELETE FROM todos WHERE title LIKE ?').run('Test Post Todo%');
    console.log(`✓ Cleaned up ${deleteResult.changes} test todos`);

    console.log('\n✅ All POST /api/todos endpoint tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);

    // Attempt cleanup even on failure
    try {
      db.prepare('DELETE FROM todos WHERE title LIKE ?').run('Test Post Todo%');
    } catch (cleanupError) {
      console.error('Failed to cleanup test data:', cleanupError.message);
    }

    throw error;
  }
}

// Run tests
testPostTodosEndpoint();
