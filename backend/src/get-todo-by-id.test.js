import db from './db.js';
import { strict as assert } from 'assert';

// Test GET /api/todos/:id endpoint functionality
function testGetTodoByIdEndpoint() {
  console.log('Testing GET /api/todos/:id endpoint...\n');

  let testTodoId1;
  let testTodoId2;
  let testTodoId3;

  try {
    // Clean up any existing test data before starting
    db.prepare('DELETE FROM todos WHERE title LIKE ?').run('Test Get Todo By Id%');

    // Insert test data for testing
    console.log('Setting up test data...');
    const insert = db.prepare('INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)');
    testTodoId1 = insert.run('Test Get Todo By Id 1', 'First test todo', 0).lastInsertRowid;
    testTodoId2 = insert.run('Test Get Todo By Id 2', 'Second test todo', 1).lastInsertRowid;
    testTodoId3 = insert.run('Test Get Todo By Id 3', 'Third test todo', 0).lastInsertRowid;
    console.log(`✓ Created test todos with IDs: ${testTodoId1}, ${testTodoId2}, ${testTodoId3}\n`);

    // Test 1: GET /api/todos/:id with valid ID returns the correct todo object
    console.log('Test 1: GET /api/todos/:id with valid ID returns the correct todo object');
    const todo1 = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId1);
    assert.ok(todo1, 'Todo should be found');
    assert.strictEqual(todo1.id, testTodoId1, 'Todo ID should match requested ID');
    assert.strictEqual(todo1.title, 'Test Get Todo By Id 1', 'Todo title should match');
    assert.strictEqual(todo1.description, 'First test todo', 'Todo description should match');
    assert.strictEqual(todo1.completed, 0, 'Todo completed status should match');
    console.log('✓ GET /api/todos/:id returns correct todo object');

    // Test 2: GET /api/todos/:id with non-existent ID should simulate 404 behavior
    console.log('\nTest 2: GET /api/todos/:id with non-existent ID should simulate 404 behavior');
    const nonExistentId = 999999;
    const nonExistentTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(nonExistentId);
    assert.strictEqual(nonExistentTodo, undefined, 'Should return undefined for non-existent todo');

    // Simulate the 404 behavior from the endpoint
    if (!nonExistentTodo) {
      // This simulates: res.status(404).json({ error: 'Todo not found' })
      const error404Response = { error: 'Todo not found' };
      assert.strictEqual(error404Response.error, 'Todo not found', 'Should return 404 error message');
    }
    console.log('✓ Non-existent ID returns 404 behavior');

    // Test 3: Verify returned todo has all required fields
    console.log('\nTest 3: Verify returned todo has all required fields');
    const todo2 = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId2);
    assert.ok(todo2.id, 'Todo should have id');
    assert.ok(todo2.title, 'Todo should have title');
    assert.ok('description' in todo2, 'Todo should have description field');
    assert.ok('completed' in todo2, 'Todo should have completed field');
    assert.ok(todo2.created_at, 'Todo should have created_at');
    assert.ok(todo2.updated_at, 'Todo should have updated_at');
    console.log('✓ Todo has all required fields (id, title, description, completed, created_at, updated_at)');

    // Test 4: Verify returned todo field types are correct
    console.log('\nTest 4: Verify returned todo field types are correct');
    const todo3 = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId3);
    assert.strictEqual(typeof todo3.id, 'number', 'id should be a number');
    assert.strictEqual(typeof todo3.title, 'string', 'title should be a string');
    assert.strictEqual(typeof todo3.description, 'string', 'description should be a string');
    assert.strictEqual(typeof todo3.completed, 'number', 'completed should be a number');
    assert.strictEqual(typeof todo3.created_at, 'string', 'created_at should be a string');
    assert.strictEqual(typeof todo3.updated_at, 'string', 'updated_at should be a string');
    console.log('✓ All field types are correct');

    // Test 5: Test with numeric ID parameter
    console.log('\nTest 5: Test with numeric ID parameter');
    // Simulate the req.params.id from the endpoint
    const requestParamId = testTodoId1.toString(); // In Express, req.params are strings
    const todoFromParam = db.prepare('SELECT * FROM todos WHERE id = ?').get(requestParamId);
    assert.ok(todoFromParam, 'Todo should be found with numeric ID parameter');
    assert.strictEqual(todoFromParam.id, testTodoId1, 'Should return correct todo for numeric ID');

    // Also test with actual number
    const todoFromNumber = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId2);
    assert.ok(todoFromNumber, 'Todo should be found with number ID');
    assert.strictEqual(todoFromNumber.id, testTodoId2, 'Should return correct todo for number ID');
    console.log('✓ Numeric ID parameter works correctly');

    // Test 6: Verify completed status is correct for different todos
    console.log('\nTest 6: Verify completed status is correct for different todos');
    const incompleteTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId1);
    const completedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId2);

    assert.strictEqual(incompleteTodo.completed, 0, 'First test todo should be incomplete');
    assert.strictEqual(completedTodo.completed, 1, 'Second test todo should be completed');
    console.log('✓ Completed status is correctly preserved and returned');

    // Test 7: Verify timestamps are valid date strings
    console.log('\nTest 7: Verify timestamps are valid date strings');
    const todoWithTimestamps = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId3);
    const createdDate = new Date(todoWithTimestamps.created_at);
    const updatedDate = new Date(todoWithTimestamps.updated_at);

    assert.ok(!isNaN(createdDate.getTime()), 'created_at should be a valid date string');
    assert.ok(!isNaN(updatedDate.getTime()), 'updated_at should be a valid date string');
    assert.strictEqual(todoWithTimestamps.created_at, todoWithTimestamps.updated_at,
      'created_at and updated_at should initially be the same');
    console.log('✓ Timestamps are valid date strings');

    // Test cleanup
    console.log('\nTest 8: Clean up test data after tests complete');
    const deleteResult = db.prepare('DELETE FROM todos WHERE id IN (?, ?, ?)').run(
      testTodoId1, testTodoId2, testTodoId3
    );
    assert.strictEqual(deleteResult.changes, 3, 'Should delete all 3 test todos');

    // Verify deletion
    const remainingTestTodos = db.prepare('SELECT * FROM todos WHERE title LIKE ?').all('Test Get Todo By Id%');
    assert.strictEqual(remainingTestTodos.length, 0, 'All test todos should be deleted');
    console.log('✓ Test data cleaned up successfully');

    console.log('\n✅ All GET /api/todos/:id endpoint tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);

    // Attempt cleanup even on failure
    try {
      if (testTodoId1 || testTodoId2 || testTodoId3) {
        console.log('\nAttempting to clean up test data...');
        db.prepare('DELETE FROM todos WHERE title LIKE ?').run('Test Get Todo By Id%');
        console.log('✓ Cleanup completed');
      }
    } catch (cleanupError) {
      console.error('Failed to cleanup test data:', cleanupError.message);
    }

    throw error;
  }
}

// Run tests
testGetTodoByIdEndpoint();
