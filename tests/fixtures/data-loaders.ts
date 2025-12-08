/**
 * tests/fixtures/data-loaders.ts
 *
 * Helper functions to load fixture data from JSON files or other sources.
 */

import fs from 'fs';
import path from 'path';

/**
 * Load users fixture data from JSON file.
 */
export function loadUsersFixture(): string {
  const filePath = path.join(__dirname, '../mocks/users-list.json');
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Load todo fixture data from JSON file.
 */
export function loadTodosFixture(): string {
  const filePath = path.join(__dirname, '../mocks/todos-list.json');
  return fs.readFileSync(filePath, 'utf-8');
}
