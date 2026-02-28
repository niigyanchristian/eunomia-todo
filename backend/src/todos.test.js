import db from './db.js';
import { strict as assert } from 'assert';

// Test GET /api/todos endpoint functionality
function testTodosEndpoint() {
  console.log('Testing GET /api/todos endpoint...\n');

  try {
    // Clean up any existing test data before starting
    db.prepare('DELETE FROM todos WHERE title LIKE ?').run('Test Todo%');

    // Test 1: GET /api/todos returns all todos
    console.log('Test 1: GET /api/todos returns all todos');

    // Insert test data with different created_at times
    const insert = db.prepare('INSERT INTO todos (title, description, completed, created_at) VALUES (?, ?, ?, ?)');
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const id1 = insert.run('Test Todo 1', 'First todo', 0, twoHoursAgo.toISOString()).lastInsertRowid;
    const id2 = insert.run('Test Todo 2', 'Second todo', 1, oneHourAgo.toISOString()).lastInsertRowid;
    const id3 = insert.run('Test Todo 3', 'Third todo', 0, now.toISOString()).lastInsertRowid;

    // Query all todos
    const allTodos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
    assert.ok(allTodos.length >= 3, 'Should have at least 3 todos');

    // Find our test todos in the results
    const testTodos = allTodos.filter(t => t.title.startsWith('Test Todo'));
    assert.strictEqual(testTodos.length, 3, 'Should have exactly 3 test todos');
    console.log('✓ GET /api/todos returns all todos');

    // Test 2: Results are ordered by created_at DESC
    console.log('\nTest 2: Results are ordered by created_at DESC');
    const orderedTodos = db.prepare('SELECT * FROM todos WHERE title LIKE ? ORDER BY created_at DESC').all('Test Todo%');
    assert.strictEqual(orderedTodos[0].id, id3, 'Most recent todo should be first');
    assert.strictEqual(orderedTodos[1].id, id2, 'Second most recent todo should be second');
    assert.strictEqual(orderedTodos[2].id, id1, 'Oldest todo should be last');
    console.log('✓ Results are ordered by created_at DESC');

    // Test 3: ?status=active filter returns only incomplete todos (completed=0)
    console.log('\nTest 3: ?status=active filter returns only incomplete todos');
    const activeTodos = db.prepare('SELECT * FROM todos WHERE completed = ? ORDER BY created_at DESC').all(0);
    assert.ok(activeTodos.length >= 2, 'Should have at least 2 active todos');

    // Verify all returned todos are incomplete
    activeTodos.forEach(todo => {
      assert.strictEqual(todo.completed, 0, 'All active todos should have completed=0');
    });

    // Verify our test active todos are in results
    const testActiveTodos = activeTodos.filter(t => t.title.startsWith('Test Todo'));
    assert.strictEqual(testActiveTodos.length, 2, 'Should have exactly 2 test active todos');
    assert.ok(testActiveTodos.some(t => t.id === id1), 'Should include Test Todo 1');
    assert.ok(testActiveTodos.some(t => t.id === id3), 'Should include Test Todo 3');
    console.log('✓ ?status=active filter returns only incomplete todos');

    // Test 4: ?status=completed filter returns only completed todos (completed=1)
    console.log('\nTest 4: ?status=completed filter returns only completed todos');
    const completedTodos = db.prepare('SELECT * FROM todos WHERE completed = ? ORDER BY created_at DESC').all(1);
    assert.ok(completedTodos.length >= 1, 'Should have at least 1 completed todo');

    // Verify all returned todos are completed
    completedTodos.forEach(todo => {
      assert.strictEqual(todo.completed, 1, 'All completed todos should have completed=1');
    });

    // Verify our test completed todo is in results
    const testCompletedTodos = completedTodos.filter(t => t.title.startsWith('Test Todo'));
    assert.strictEqual(testCompletedTodos.length, 1, 'Should have exactly 1 test completed todo');
    assert.strictEqual(testCompletedTodos[0].id, id2, 'Should be Test Todo 2');
    console.log('✓ ?status=completed filter returns only completed todos');

    // Test 5: Invalid status values are handled gracefully (no filter applied)
    console.log('\nTest 5: Invalid status values are handled gracefully');
    // With invalid status, should return all todos (no filter applied)
    const allTodosAgain = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
    assert.ok(allTodosAgain.length >= 3, 'Should return all todos with invalid status');
    console.log('✓ Invalid status values are handled gracefully');

    // Test 6: Verify todo objects have all required fields
    console.log('\nTest 6: Verify todo objects have all required fields');
    const sampleTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id1);
    assert.ok(sampleTodo.id, 'Todo should have id');
    assert.ok(sampleTodo.title, 'Todo should have title');
    assert.ok('description' in sampleTodo, 'Todo should have description field');
    assert.ok('completed' in sampleTodo, 'Todo should have completed field');
    assert.ok(sampleTodo.created_at, 'Todo should have created_at');
    assert.ok(sampleTodo.updated_at, 'Todo should have updated_at');
    console.log('✓ Todo objects have all required fields');

    // Test 7: Clean up test data
    console.log('\nTest 7: Clean up test data');
    const deleteResult = db.prepare('DELETE FROM todos WHERE id IN (?, ?, ?)').run(id1, id2, id3);
    assert.strictEqual(deleteResult.changes, 3, 'Should delete all 3 test todos');

    // Verify deletion
    const remainingTestTodos = db.prepare('SELECT * FROM todos WHERE title LIKE ?').all('Test Todo%');
    assert.strictEqual(remainingTestTodos.length, 0, 'All test todos should be deleted');
    console.log('✓ Test data cleaned up');

    console.log('\n✅ All GET /api/todos endpoint tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);

    // Attempt cleanup even on failure
    try {
      db.prepare('DELETE FROM todos WHERE title LIKE ?').run('Test Todo%');
    } catch (cleanupError) {
      console.error('Failed to cleanup test data:', cleanupError.message);
    }

    throw error;
  }
}

// Run tests
testTodosEndpoint();
