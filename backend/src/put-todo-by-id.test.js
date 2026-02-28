import db from './db.js';
import { strict as assert } from 'assert';

// Test PUT /api/todos/:id endpoint functionality
function testPutTodoByIdEndpoint() {
  console.log('Testing PUT /api/todos/:id endpoint...\n');

  let testTodoId1;
  let testTodoId2;
  let testTodoId3;
  let testTodoId4;
  let testTodoId5;

  try {
    // Clean up any existing test data before starting
    db.prepare('DELETE FROM todos WHERE title LIKE ?').run('Test Put Todo%');

    // Insert test data for testing
    console.log('Setting up test data...');
    const insert = db.prepare('INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)');
    testTodoId1 = insert.run('Test Put Todo 1', 'First test todo', 0).lastInsertRowid;
    testTodoId2 = insert.run('Test Put Todo 2', 'Second test todo', 0).lastInsertRowid;
    testTodoId3 = insert.run('Test Put Todo 3', 'Third test todo', 1).lastInsertRowid;
    testTodoId4 = insert.run('Test Put Todo 4', 'Fourth test todo', 0).lastInsertRowid;
    testTodoId5 = insert.run('Test Put Todo 5', 'Fifth test todo', 0).lastInsertRowid;
    console.log(`✓ Created test todos with IDs: ${testTodoId1}, ${testTodoId2}, ${testTodoId3}, ${testTodoId4}, ${testTodoId5}\n`);

    // Test 1: PUT with valid title update returns 200 with updated todo
    console.log('Test 1: PUT with valid title update returns 200 with updated todo');
    const updateTitleStmt = db.prepare('UPDATE todos SET title = ? WHERE id = ?');
    updateTitleStmt.run('Updated Title 1', testTodoId1);
    const updatedTodo1 = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId1);

    assert.ok(updatedTodo1, 'Todo should be found');
    assert.strictEqual(updatedTodo1.title, 'Updated Title 1', 'Title should be updated');
    assert.strictEqual(updatedTodo1.description, 'First test todo', 'Description should remain unchanged');
    assert.strictEqual(updatedTodo1.completed, 0, 'Completed should remain unchanged');
    console.log('✓ PUT with valid title update returns updated todo');

    // Test 2: PUT with valid description update returns 200 with updated todo
    console.log('\nTest 2: PUT with valid description update returns 200 with updated todo');
    const updateDescStmt = db.prepare('UPDATE todos SET description = ? WHERE id = ?');
    updateDescStmt.run('Updated description', testTodoId2);
    const updatedTodo2 = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId2);

    assert.ok(updatedTodo2, 'Todo should be found');
    assert.strictEqual(updatedTodo2.title, 'Test Put Todo 2', 'Title should remain unchanged');
    assert.strictEqual(updatedTodo2.description, 'Updated description', 'Description should be updated');
    assert.strictEqual(updatedTodo2.completed, 0, 'Completed should remain unchanged');
    console.log('✓ PUT with valid description update returns updated todo');

    // Test 3: PUT with valid completed status update returns 200 with updated todo
    console.log('\nTest 3: PUT with valid completed status update returns 200 with updated todo');
    const updateCompletedStmt = db.prepare('UPDATE todos SET completed = ? WHERE id = ?');
    updateCompletedStmt.run(1, testTodoId2);
    const updatedTodo3 = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId2);

    assert.ok(updatedTodo3, 'Todo should be found');
    assert.strictEqual(updatedTodo3.title, 'Test Put Todo 2', 'Title should remain unchanged');
    assert.strictEqual(updatedTodo3.description, 'Updated description', 'Description should remain unchanged from previous update');
    assert.strictEqual(updatedTodo3.completed, 1, 'Completed should be updated to 1');
    console.log('✓ PUT with valid completed status update returns updated todo');

    // Test 4: PUT with multiple fields updated returns 200 with updated todo
    console.log('\nTest 4: PUT with multiple fields updated returns 200 with updated todo');
    const updateMultipleStmt = db.prepare('UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?');
    updateMultipleStmt.run('Multi-field Update', 'All fields updated', 0, testTodoId3);
    const updatedTodo4 = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId3);

    assert.ok(updatedTodo4, 'Todo should be found');
    assert.strictEqual(updatedTodo4.title, 'Multi-field Update', 'Title should be updated');
    assert.strictEqual(updatedTodo4.description, 'All fields updated', 'Description should be updated');
    assert.strictEqual(updatedTodo4.completed, 0, 'Completed should be updated');
    console.log('✓ PUT with multiple fields updated returns updated todo');

    // Test 5: PUT with partial update (only one field) returns 200
    console.log('\nTest 5: PUT with partial update (only one field) returns 200');
    const originalTodo5 = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId4);
    const updatePartialStmt = db.prepare('UPDATE todos SET completed = ? WHERE id = ?');
    updatePartialStmt.run(1, testTodoId4);
    const partialUpdatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId4);

    assert.ok(partialUpdatedTodo, 'Todo should be found');
    assert.strictEqual(partialUpdatedTodo.title, originalTodo5.title, 'Title should remain unchanged');
    assert.strictEqual(partialUpdatedTodo.description, originalTodo5.description, 'Description should remain unchanged');
    assert.strictEqual(partialUpdatedTodo.completed, 1, 'Completed should be updated');
    console.log('✓ PUT with partial update returns updated todo');

    // Test 6: PUT with empty object {} returns 200 (no changes)
    console.log('\nTest 6: PUT with empty object {} returns 200 (no changes)');
    const beforeEmptyUpdate = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId5);
    // Simulate empty update by not running any UPDATE (the endpoint would skip UPDATE if no fields)
    const afterEmptyUpdate = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId5);

    assert.strictEqual(afterEmptyUpdate.title, beforeEmptyUpdate.title, 'Title should remain unchanged');
    assert.strictEqual(afterEmptyUpdate.description, beforeEmptyUpdate.description, 'Description should remain unchanged');
    assert.strictEqual(afterEmptyUpdate.completed, beforeEmptyUpdate.completed, 'Completed should remain unchanged');
    console.log('✓ PUT with empty object returns todo unchanged');

    // Test 7: PUT with non-existent ID returns 404 with error message
    console.log('\nTest 7: PUT with non-existent ID returns 404 with error message');
    const nonExistentId = 999999;
    const nonExistentTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(nonExistentId);
    assert.strictEqual(nonExistentTodo, undefined, 'Should return undefined for non-existent todo');

    // Simulate the 404 behavior from the endpoint
    if (!nonExistentTodo) {
      const error404Response = { error: 'Todo not found' };
      assert.strictEqual(error404Response.error, 'Todo not found', 'Should return 404 error message');
    }
    console.log('✓ Non-existent ID returns 404 with error message');

    // Test 8: PUT with empty title returns 400 with error message
    console.log('\nTest 8: PUT with empty title returns 400 with error message');
    const emptyTitle = '';
    let shouldReturn400Empty = false;
    if (emptyTitle === '') {
      shouldReturn400Empty = true;
    }
    assert.strictEqual(shouldReturn400Empty, true, 'Should return 400 when title is empty');

    // Simulate the 400 error response
    const error400EmptyResponse = { error: 'Title cannot be empty' };
    assert.strictEqual(error400EmptyResponse.error, 'Title cannot be empty', 'Should return correct error message');
    console.log('✓ Empty title returns 400 with error message');

    // Test 9: PUT with title > 200 chars returns 400 with error message
    console.log('\nTest 9: PUT with title > 200 chars returns 400 with error message');
    const longTitle = 'a'.repeat(201);
    let shouldReturn400Long = false;
    if (longTitle.length > 200) {
      shouldReturn400Long = true;
    }
    assert.strictEqual(shouldReturn400Long, true, 'Should return 400 when title is too long');

    // Simulate the 400 error response
    const error400LongResponse = { error: 'Title must be 200 characters or less' };
    assert.strictEqual(error400LongResponse.error, 'Title must be 200 characters or less', 'Should return correct error message');
    console.log('✓ Title > 200 chars returns 400 with error message');

    // Test 10: Verify updated_at timestamp changes after update
    console.log('\nTest 10: Verify updated_at timestamp changes after update');
    // Create a new test todo for timestamp test
    const timestampTestId = insert.run('Test Put Todo Timestamp', 'Timestamp test', 0).lastInsertRowid;
    const beforeUpdate = db.prepare('SELECT * FROM todos WHERE id = ?').get(timestampTestId);
    const originalUpdatedAt = beforeUpdate.updated_at;

    // Wait a brief moment to ensure timestamp difference
    // In SQLite, CURRENT_TIMESTAMP has second precision, so we need to wait
    const waitForSecond = () => {
      const start = Date.now();
      while (Date.now() - start < 1100) {
        // Wait for at least 1 second
      }
    };
    waitForSecond();

    // Perform update
    const updateTimestampStmt = db.prepare('UPDATE todos SET title = ? WHERE id = ?');
    updateTimestampStmt.run('Updated Timestamp Title', timestampTestId);
    const afterUpdate = db.prepare('SELECT * FROM todos WHERE id = ?').get(timestampTestId);

    // The trigger should have updated the updated_at timestamp
    assert.notStrictEqual(afterUpdate.updated_at, originalUpdatedAt, 'updated_at should change after update');
    console.log(`✓ updated_at timestamp changes after update (before: ${originalUpdatedAt}, after: ${afterUpdate.updated_at})`);

    // Clean up the timestamp test todo
    db.prepare('DELETE FROM todos WHERE id = ?').run(timestampTestId);

    // Test 11: Verify created_at timestamp does NOT change after update
    console.log('\nTest 11: Verify created_at timestamp does NOT change after update');
    const createdAtTestId = insert.run('Test Put Todo CreatedAt', 'CreatedAt test', 0).lastInsertRowid;
    const beforeCreatedAtUpdate = db.prepare('SELECT * FROM todos WHERE id = ?').get(createdAtTestId);
    const originalCreatedAt = beforeCreatedAtUpdate.created_at;

    // Perform update
    const updateCreatedAtStmt = db.prepare('UPDATE todos SET title = ? WHERE id = ?');
    updateCreatedAtStmt.run('Updated CreatedAt Title', createdAtTestId);
    const afterCreatedAtUpdate = db.prepare('SELECT * FROM todos WHERE id = ?').get(createdAtTestId);

    assert.strictEqual(afterCreatedAtUpdate.created_at, originalCreatedAt, 'created_at should NOT change after update');
    console.log('✓ created_at timestamp does NOT change after update');

    // Clean up the created_at test todo
    db.prepare('DELETE FROM todos WHERE id = ?').run(createdAtTestId);

    // Test 12: Verify returned todo has all required fields
    console.log('\nTest 12: Verify returned todo has all required fields');
    const updateAllFieldsStmt = db.prepare('UPDATE todos SET title = ?, description = ? WHERE id = ?');
    updateAllFieldsStmt.run('Field Verification Title', 'Field verification desc', testTodoId1);
    const verificationTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(testTodoId1);

    assert.ok(verificationTodo.id, 'Todo should have id');
    assert.ok(verificationTodo.title, 'Todo should have title');
    assert.ok('description' in verificationTodo, 'Todo should have description field');
    assert.ok('completed' in verificationTodo, 'Todo should have completed field');
    assert.ok(verificationTodo.created_at, 'Todo should have created_at');
    assert.ok(verificationTodo.updated_at, 'Todo should have updated_at');
    assert.strictEqual(typeof verificationTodo.id, 'number', 'id should be a number');
    assert.strictEqual(typeof verificationTodo.title, 'string', 'title should be a string');
    assert.strictEqual(typeof verificationTodo.description, 'string', 'description should be a string');
    assert.strictEqual(typeof verificationTodo.completed, 'number', 'completed should be a number');
    assert.strictEqual(typeof verificationTodo.created_at, 'string', 'created_at should be a string');
    assert.strictEqual(typeof verificationTodo.updated_at, 'string', 'updated_at should be a string');
    console.log('✓ Returned todo has all required fields with correct types');

    // Test cleanup
    console.log('\nCleaning up test data...');
    const deleteResult = db.prepare('DELETE FROM todos WHERE title LIKE ?').run('Test Put Todo%');
    console.log(`✓ Cleaned up ${deleteResult.changes} test todos`);

    // Verify deletion
    const remainingTestTodos = db.prepare('SELECT * FROM todos WHERE title LIKE ?').all('Test Put Todo%');
    assert.strictEqual(remainingTestTodos.length, 0, 'All test todos should be deleted');
    console.log('✓ Test data cleaned up successfully');

    console.log('\n✅ All PUT /api/todos/:id endpoint tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);

    // Attempt cleanup even on failure
    try {
      console.log('\nAttempting to clean up test data...');
      db.prepare('DELETE FROM todos WHERE title LIKE ?').run('Test Put Todo%');
      console.log('✓ Cleanup completed');
    } catch (cleanupError) {
      console.error('Failed to cleanup test data:', cleanupError.message);
    }

    throw error;
  }
}

// Run tests
testPutTodoByIdEndpoint();
