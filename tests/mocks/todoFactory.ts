/**
 * tests/mocks/todoFactory.ts
 *
 * Factory for generating randomized Todo data using Faker.
 * Used in backend tests and mocked UI tests.
 */

import { faker } from '@faker-js/faker';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt?: string;
}

export class TodoFactory {
  /**
   * Generate a single randomized todo item.
   */
  static generateTodo(overrides?: Partial<Todo>): Todo {
    return {
      id: faker.number.int({ min: 1, max: 10000 }),
      title: faker.lorem.sentence(),
      completed: faker.datatype.boolean(),
      createdAt: faker.date.past().toISOString(),
      ...overrides,
    };
  }

  /**
   * Generate multiple randomized todo items.
   */
  static generateTodos(count: number, overrides?: Partial<Todo>): Todo[] {
    return Array.from({ length: count }, (_, i) => 
      this.generateTodo({
        id: i + 1,
        ...overrides,
      })
    );
  }

  /**
   * Generate completed todos.
   */
  static generateCompletedTodos(count: number): Todo[] {
    return this.generateTodos(count, { completed: true });
  }

  /**
   * Generate active (not completed) todos.
   */
  static generateActiveTodos(count: number): Todo[] {
    return this.generateTodos(count, { completed: false });
  }

  /**
   * Generate a mixed batch of completed and active todos.
   */
  static generateMixedTodos(activeCount: number, completedCount: number): Todo[] {
    const active = this.generateActiveTodos(activeCount);
    const completed = this.generateCompletedTodos(completedCount);
    return [...active, ...completed];
  }
}
