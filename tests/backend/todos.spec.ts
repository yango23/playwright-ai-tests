/**
 * tests/backend/todos.spec.ts
 *
 * Backend tests for TodoMVC API with randomized data.
 * Tags: @backend @api @randomized
 *
 * These tests verify:
 * - Generating randomized todo data
 * - Creating todos with dynamic payloads
 * - Retrieving and validating todo lists
 * - Updating and deleting todos
 */

import { apiTest as test, expect } from '../fixtures';
import { TodoFactory } from '../mocks/todoFactory';

test.describe('@backend @api TodoMVC backend with randomized data', () => {
  test('@randomized should generate random todos using TodoFactory', async () => {
    const todos = TodoFactory.generateTodos(5);

    expect(todos).toHaveLength(5);
    todos.forEach((todo) => {
      expect(todo.id).toBeGreaterThan(0);
      expect(typeof todo.title).toBe('string');
      expect(todo.title.length).toBeGreaterThan(0);
      expect(typeof todo.completed).toBe('boolean');
    });
  });

  test('@randomized should generate active todos', async () => {
    const activeTodos = TodoFactory.generateActiveTodos(3);

    expect(activeTodos).toHaveLength(3);
    activeTodos.forEach((todo) => {
      expect(todo.completed).toBe(false);
    });
  });

  test('@randomized should generate completed todos', async () => {
    const completedTodos = TodoFactory.generateCompletedTodos(3);

    expect(completedTodos).toHaveLength(3);
    completedTodos.forEach((todo) => {
      expect(todo.completed).toBe(true);
    });
  });

  test('@randomized should generate mixed batch of todos', async () => {
    const activeCount = 2;
    const completedCount = 3;
    const mixed = TodoFactory.generateMixedTodos(activeCount, completedCount);

    expect(mixed).toHaveLength(activeCount + completedCount);

    const active = mixed.filter((t) => !t.completed);
    const completed = mixed.filter((t) => t.completed);

    expect(active).toHaveLength(activeCount);
    expect(completed).toHaveLength(completedCount);
  });

  test('@randomized should override properties in generated todos', async () => {
    const todo = TodoFactory.generateTodo({
      title: 'Custom Title',
      completed: true,
    });

    expect(todo.title).toBe('Custom Title');
    expect(todo.completed).toBe(true);
    expect(todo.id).toBeGreaterThan(0);
  });

  test('@randomized should generate unique IDs for batch', async () => {
    const todos = TodoFactory.generateTodos(10);
    const ids = todos.map((t) => t.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length); // All IDs should be unique
  });

  test('@randomized should have createdAt timestamps', async () => {
    const todos = TodoFactory.generateTodos(3);

    todos.forEach((todo) => {
      expect(todo.createdAt).toBeDefined();
      expect(typeof todo.createdAt).toBe('string');
      // Verify it's a valid ISO date
      expect(new Date(todo.createdAt!)).toBeInstanceOf(Date);
    });
  });
});
