import { test } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage'

test('completed todos appear in Completed tab', async ({ page }) => {
    const todo = new TodoPage(page);

    await page.pause();

    await todo.open();
    await todo.addTask('TestTask');
    await todo.addTask('anotherTask');

    await todo.completeTask('TestTask');
    await todo.completeTask('anotherTask');

    await todo.goToCompleted();

    await todo.expectTaskVisible('TestTask');
    await todo.expectTaskVisible('anotherTask');
});