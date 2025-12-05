import { uiTest as test, type UiFixtures } from '@ui/fixtures';

test.describe<[UiFixtures]>('smoke tests', () => {
  test('can add a task', async ({ todoPage }) => {
    // todoPage is already initialized and opened via fixture
    await todoPage.addTask('SmokeTask');
    await todoPage.expectTaskVisible('SmokeTask');
  });

  test('can add and complete multiple tasks', async ({ todoPage }) => {
    // todoPage is already initialized and opened via fixture
    await todoPage.addTask('Smoke1');
    await todoPage.addTask('Smoke2');

    await todoPage.completeTask('Smoke1');
    await todoPage.completeTask('Smoke2');

    await todoPage.goToCompleted();
    await todoPage.expectTaskVisible('Smoke1');
    await todoPage.expectTaskVisible('Smoke2');
  });

  test('can delete a task', async ({ todoPage }) => {
    // todoPage is already initialized and opened via fixture
    await todoPage.addTask('ToDelete');
    await todoPage.deleteTask('ToDelete');
    await todoPage.expectTaskNotVisible('ToDelete');
  });
});
