import { test, expect } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage'

test('todo default view matches visual baselines', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('todo-default-view.png');
});

test('completed view matches visual baseline', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.addTask('TestTask');
    await todo.addTask('anotherTask');

    await todo.completeTask('TestTask');
    await todo.completeTask('anotherTask');

    await todo.goToCompleted();

    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('todo-completed-view.png');
});