/**
 * tests/UI/todomvc/todo.spec.ts
 *
 * TodoMVC UI functional tests (consolidated smoke + regression tests).
 * Tags: @ui @todo @smoke @regression
 * 
 * These tests verify core TodoMVC functionality:
 * - Adding, completing, editing, and deleting tasks
 * - Filtering (All, Active, Completed)
 * - Bulk operations (Clear Completed)
 */

import { uiTest as test } from '../../fixtures/ui';

test.describe('@ui @todo TodoMVC core functionality', () => {
  test('@smoke can add a task', async ({ todoPage }) => {
    await todoPage.addTask('SmokeTask');
    await todoPage.expectTaskVisible('SmokeTask');
  });

  test('@smoke can add and complete multiple tasks', async ({ todoPage }) => {
    await todoPage.addTask('Smoke1');
    await todoPage.addTask('Smoke2');

    await todoPage.completeTask('Smoke1');
    await todoPage.completeTask('Smoke2');

    await todoPage.goToCompleted();
    await todoPage.expectTaskVisible('Smoke1');
    await todoPage.expectTaskVisible('Smoke2');
  });

  test('@smoke can delete a task', async ({ todoPage }) => {
    await todoPage.addTask('ToDelete');
    await todoPage.deleteTask('ToDelete');
    await todoPage.expectTaskNotVisible('ToDelete');
  });

  test('@smoke completed todos appear in Completed tab', async ({ todoPage }) => {
  await todoPage.addTask('TestTask');
  await todoPage.addTask('anotherTask');

  await todoPage.completeTask('TestTask');
  await todoPage.completeTask('anotherTask');

  await todoPage.goToCompleted();

  await todoPage.expectTaskVisible('TestTask');
  await todoPage.expectTaskVisible('anotherTask');
});

  test('@smoke new task is not shown in Completed tab', async ({ todoPage }) => {
  await todoPage.addTask('FreshTask');

  await todoPage.goToCompleted();
  await todoPage.expectTaskNotVisible('FreshTask');
});

  test('@smoke completed task does not appear in Active tab', async ({ todoPage }) => {
  await todoPage.addTask('Task1');
  await todoPage.completeTask('Task1');

  await todoPage.goToCompleted();
  await todoPage.expectTaskVisible('Task1');

  await todoPage.goToActive();
  await todoPage.expectTaskNotVisible('Task1');
});

  test('@smoke clear completed removes completed tasks', async ({ todoPage }) => {
  await todoPage.createAndCompleteTasks('Task1', 'Task2');

  await todoPage.goToCompleted();
  await todoPage.expectTaskVisible('Task1');
  await todoPage.expectTaskVisible('Task2');

  await todoPage.clearCompleted();

  await todoPage.goToCompleted();
  await todoPage.expectTaskNotVisible('Task1');
  await todoPage.expectTaskNotVisible('Task2');
});

  test('@regression deleted task disappears from the list', async ({ todoPage }) => {
  await todoPage.addTask('TaskToDelete');

  await todoPage.deleteTask('TaskToDelete');

  await todoPage.expectTaskNotVisible('TaskToDelete');
});

  test('@regression editing existing todo updates the task name', async ({ todoPage }) => {
  await todoPage.addTask('OriginalTask');

  await todoPage.editTask('OriginalTask', 'EditedTask');

  await todoPage.expectTaskVisible('EditedTask');
  await todoPage.expectTaskNotVisible('OriginalTask');
});

  test('@regression editing todo to empty string removes the task', async ({ todoPage }) => {
    await todoPage.addTask('TaskToClear');
    await todoPage.editTask('TaskToClear', '');
    await todoPage.expectTaskNotVisible('TaskToClear');
  });

  test('@regression editing todo trims leading and trailing spaces', async ({ todoPage }) => {
    await todoPage.addTask('TrimMe');
    await todoPage.editTask('TrimMe', '   TrimMe Edited   ');
    await todoPage.expectTaskVisible('TrimMe Edited');
  });

  test('@regression toggling completed todo returns it back to Active', async ({ todoPage }) => {
    await todoPage.addTask('RevertMe');
    await todoPage.completeTask('RevertMe');
    await todoPage.goToCompleted();
    await todoPage.expectTaskVisible('RevertMe');
    await todoPage.toggleTask('RevertMe');
    await todoPage.goToActive();
    await todoPage.expectTaskVisible('RevertMe');
  });

  test('@regression clear completed does nothing when there are no completed tasks', async ({ todoPage }) => {
    await todoPage.addTask('OnlyActive');
    await todoPage.clearCompleted();
    await todoPage.goToAll();
    await todoPage.expectTaskVisible('OnlyActive');
  });
});
