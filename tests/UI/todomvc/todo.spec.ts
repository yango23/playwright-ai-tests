// tests/ui/todomvc/todo.spec.ts
import { uiTest as test } from '../fixtures';

// Все тесты тут используют теговую схему:
// [ui]     — UI-тест
// [todo]   — функционал TodoMVC
// [smoke]  — быстрые базовые проверки
// [regression] — более детальные/краевые кейсы

test('[ui][todo][smoke] completed todos appear in Completed tab', async ({ todoPage }) => {
  await todoPage.addTask('TestTask');
  await todoPage.addTask('anotherTask');

  await todoPage.completeTask('TestTask');
  await todoPage.completeTask('anotherTask');

  await todoPage.goToCompleted();

  await todoPage.expectTaskVisible('TestTask');
  await todoPage.expectTaskVisible('anotherTask');
});

test('[ui][todo][smoke] new task is not shown in Completed tab', async ({ todoPage }) => {
  await todoPage.addTask('FreshTask');

  await todoPage.goToCompleted();
  await todoPage.expectTaskNotVisible('FreshTask');
});

test('[ui][todo][smoke] completed task does not appear in Active tab', async ({ todoPage }) => {
  await todoPage.addTask('Task1');
  await todoPage.completeTask('Task1');

  await todoPage.goToCompleted();
  await todoPage.expectTaskVisible('Task1');

  await todoPage.goToActive();
  await todoPage.expectTaskNotVisible('Task1');
});

test('[ui][todo][smoke] clear completed removes completed tasks', async ({ todoPage }) => {
  await todoPage.createAndCompleteTasks('Task1', 'Task2');

  await todoPage.goToCompleted();
  await todoPage.expectTaskVisible('Task1');
  await todoPage.expectTaskVisible('Task2');

  await todoPage.clearCompleted();

  await todoPage.goToCompleted();
  await todoPage.expectTaskNotVisible('Task1');
  await todoPage.expectTaskNotVisible('Task2');
});

test('[ui][todo] deleted task disappears from the list', async ({ todoPage }) => {
  await todoPage.addTask('TaskToDelete');

  await todoPage.deleteTask('TaskToDelete');

  await todoPage.expectTaskNotVisible('TaskToDelete');
});

test('[ui][todo][regression] editing existing todo updates the task name', async ({ todoPage }) => {
  await todoPage.addTask('OriginalTask');

  await todoPage.editTask('OriginalTask', 'EditedTask');

  await todoPage.expectTaskVisible('EditedTask');
  await todoPage.expectTaskNotVisible('OriginalTask');
});

test('[ui][todo][regression] editing todo to empty string removes the task', async ({ todoPage }) => {
  await todoPage.addTask('TaskToClear');

  // Редактируем в пустую строку
  await todoPage.editTask('TaskToClear', '');

  // В классическом TodoMVC такая задача удаляется
  await todoPage.expectTaskNotVisible('TaskToClear');
});

test('[ui][todo][regression] editing todo trims leading and trailing spaces', async ({ todoPage }) => {
  await todoPage.addTask('TrimMe');

  // Добавляем лишние пробелы вокруг
  await todoPage.editTask('TrimMe', '   TrimMe Edited   ');

  // Ожидаем, что в UI отображается уже без мусорных пробелов
  await todoPage.expectTaskVisible('TrimMe Edited');
});

test('[ui][todo] toggling completed todo returns it back to Active', async ({ todoPage }) => {
  await todoPage.addTask('RevertMe');

  await todoPage.completeTask('RevertMe');

  await todoPage.goToCompleted();
  await todoPage.expectTaskVisible('RevertMe');

  // Возвращаем обратно (toggle)
  await todoPage.toggleTask('RevertMe');

  await todoPage.goToActive();
  await todoPage.expectTaskVisible('RevertMe');
});

test('[ui][todo] clear completed does nothing when there are no completed tasks', async ({ todoPage }) => {
  await todoPage.addTask('OnlyActive');

  // Кнопка Clear completed либо не видна, либо клик по ней не должен ничего ломать
  await todoPage.clearCompleted();

  await todoPage.goToAll();
  await todoPage.expectTaskVisible('OnlyActive');
});
