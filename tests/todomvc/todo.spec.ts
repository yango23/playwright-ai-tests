import { test } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';

test('completed todos appear in Completed tab', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.open();

    await todo.addTask('TestTask');
    await todo.addTask('anotherTask');

    await todo.completeTask('TestTask');
    await todo.completeTask('anotherTask');

    await todo.goToCompleted();

    await todo.expectTaskVisible('TestTask');
    await todo.expectTaskVisible('anotherTask');
});

test('new task is not shown in Completed tab', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.open();
    await todo.addTask('FreshTask');

    await todo.goToCompleted();
    await todo.expectTaskNotVisible('FreshTask');
});

test('completed task does not appear in Active tab', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.open();
    await todo.addTask('Task1');
    await todo.completeTask('Task1');

    await todo.goToCompleted();
    await todo.expectTaskVisible('Task1');

    await todo.goToActive();
    await todo.expectTaskNotVisible('Task1');
});

test('clear completed removes completed tasks', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.open();
    await todo.createAndCompleteTasks('Task1', 'Task2');

    await todo.goToCompleted();
    await todo.expectTaskVisible('Task1');
    await todo.expectTaskVisible('Task2');

    await todo.clearCompleted();

    // После очистки completed-список пуст
    await todo.goToCompleted();
    await todo.expectTaskNotVisible('Task1');
    await todo.expectTaskNotVisible('Task2');
});

test('deleted task disappears from the list', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.open();
    await todo.addTask('TaskToDelete');

    await todo.deleteTask('TaskToDelete');

    await todo.expectTaskNotVisible('TaskToDelete');
});

test('editing existing todo updates the task name', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.open();
    await todo.addTask('OriginalTask');

    await todo.editTask('OriginalTask', 'EditedTask');

    await todo.expectTaskVisible('EditedTask');
    await todo.expectTaskNotVisible('OriginalTask');
});

test('editing todo to empty string removes the task', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.open();
    await todo.addTask('TaskToClear');

    // Редактируем в пустую строку
    await todo.editTask('TaskToClear', '');

    // В классическом TodoMVC такая задача удаляется
    await todo.expectTaskNotVisible('TaskToClear');
});

test('editing todo trims leading and trailing spaces', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.open();
    await todo.addTask('TrimMe');

    // Добавляем лишние пробелы вокруг
    await todo.editTask('TrimMe', '   TrimMe Edited   ');

    // Ожидаем, что в UI отображается уже без мусорных пробелов
    await todo.expectTaskVisible('TrimMe Edited');
    // The UI may or may not display the exact raw string with spaces; we only assert the trimmed value is visible
});

test('toggling completed todo returns it back to Active', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.open();
    await todo.addTask('RevertMe');

    // Отмечаем как completed
    await todo.completeTask('RevertMe');

    await todo.goToCompleted();
    await todo.expectTaskVisible('RevertMe');

    // Возвращаем обратно (toggle)
    await todo.toggleTask('RevertMe');

    await todo.goToActive();
    await todo.expectTaskVisible('RevertMe');
});

 
test('clear completed does nothing when there are no completed tasks', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.open();
    await todo.addTask('OnlyActive');

    // Кнопка Clear completed либо не видна, либо клик по ней не должен ничего ломать
    await todo.clearCompleted();

    await todo.goToAll();
    await todo.expectTaskVisible('OnlyActive');
});
