import { test, expect } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';

test.describe('TodoMVC visual regression', () => {
  // Фиксируем размер окна, чтобы скриншоты были одинаковыми
  test.use({
    viewport: { width: 1280, height: 720 },
  });

  // Визуальные тесты проверяем только в chromium, чтобы не страдать от разных движков
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Visual snapshots проверяются только в chromium');
    const todo = new TodoPage(page);
    // Clear local storage and open to ensure each visual test starts from a clean state.
    await todo.reset();
  });

  test('empty app looks correct', async ({ page }) => {
    // Пустое состояние приложения
    await expect(page).toHaveScreenshot('todomvc-empty.png', {
      fullPage: true,
      // небольшой threshold, чтобы простить мелкие артефакты рендера
      maxDiffPixels: 50,
    });
  });

  test('app with few active tasks', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.addTask('Buy milk');
    await todo.addTask('Walk the dog');

    // Wait for the app to be ready and stable
    await todo.waitForAppReady();

    await expect(page).toHaveScreenshot('todomvc-two-active.png', {
      fullPage: true,
      maxDiffPixels: 80,
    });
  });

  test('completed tasks in Completed tab', async ({ page }) => {
    const todo = new TodoPage(page);

    await todo.addTask('Task 1');
    await todo.addTask('Task 2');
    await todo.completeTask('Task 1');
    await todo.completeTask('Task 2');

    await todo.goToCompleted();
    await page.locator('.todo-list').waitFor({ state: 'visible' });

    // Скриншот только списка задач — меньше риска флейков
    const list = page.locator('.todo-list');
    await expect(list).toHaveScreenshot('todomvc-completed-list.png', {
      maxDiffPixels: 50,
    });
  });
});