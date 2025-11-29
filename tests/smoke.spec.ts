import { test } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

test.describe('smoke tests', () => {
  test('can add a task', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.addTask('SmokeTask');
    await todo.expectTaskVisible('SmokeTask');
  });

  test('can add and complete multiple tasks', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.addTask('Smoke1');
    await todo.addTask('Smoke2');

    await todo.completeTask('Smoke1');
    await todo.completeTask('Smoke2');

    await todo.goToCompleted();
    await todo.expectTaskVisible('Smoke1');
    await todo.expectTaskVisible('Smoke2');
  });

  test('can delete a task', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.addTask('ToDelete');
    await todo.deleteTask('ToDelete');
    await todo.expectTaskNotVisible('ToDelete');
  });
});
