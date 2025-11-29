import { test, expect } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';

test.skip('todo default view matches visual baselines', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await expect(page).toHaveScreenshot('todo-default-view.png');
});

test.skip('completed view matches visual baseline', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.addTask('TestTask');
    await todo.addTask('anotherTask');

    await todo.completeTask('TestTask');
    await todo.completeTask('anotherTask');

    await todo.goToCompleted();

    await todo.deleteTask('TestTask');

    await expect(page).toHaveScreenshot('todo-completed-view.png');
});

 
test.skip('default empty view matches baseline', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    // Пустой список, только поле ввода и фильтры
    await expect(page).toHaveScreenshot('todo-empty-view.png');
});

test.skip('view with active and completed tasks matches baseline', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.addTask('ActiveTask');
    await todo.addTask('CompletedTask');
    await todo.completeTask('CompletedTask');

    // Вид "All" с активной и завершённой задачей
    await expect(page).toHaveScreenshot('todo-mixed-all-view.png');
});

test.skip('active filter view matches baseline', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.addTask('ActiveTask');
    await todo.addTask('CompletedTask');
    await todo.completeTask('CompletedTask');

    await todo.goToActive();

    await expect(page).toHaveScreenshot('todo-active-view.png');
});

test.skip('completed filter view after clear completed matches baseline', async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.createAndCompleteTasks('Task1', 'Task2');

    await todo.goToCompleted();
    await expect(page).toHaveScreenshot('todo-completed-filled-view.png');

    await todo.clearCompleted();

    await todo.goToCompleted();
    await expect(page).toHaveScreenshot('todo-completed-empty-after-clear-view.png');
});