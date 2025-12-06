// tests/ui/todomvc/visual.spec.ts
import { expect } from '@playwright/test';
import { uiTest as test } from '../fixtures';

// Теги:
// [ui]        — UI-тест
// [visual]    — визуальный/скриншотный
// [snapshot]  — работает через toHaveScreenshot

test.describe('[ui][visual] TodoMVC visual regression', () => {
  // Фиксируем размер окна, чтобы скриншоты были одинаковыми
  test.use({
    viewport: { width: 1280, height: 720 },
  });

  // Визуальные тесты проверяем только в chromium, чтобы не страдать от разных движков
  test.beforeEach(async ({ browserName, todoPage }) => {
    test.skip(browserName !== 'chromium', 'Visual snapshots проверяются только в chromium');
    // todoPage уже инициализирован fixture-ом; просто очищаем состояние
    await todoPage.reset();
  });

  test('[ui][visual][snapshot] empty app looks correct', async ({ page }) => {
    await expect(page).toHaveScreenshot('todomvc-empty.png', {
      fullPage: true,
      maxDiffPixels: 50,
    });
  });

  test('[ui][visual][snapshot] app with few active tasks', async ({ todoPage, page }) => {
    await todoPage.addTask('Buy milk');
    await todoPage.addTask('Walk the dog');

    await expect(page).toHaveScreenshot('todomvc-two-active.png', {
      fullPage: true,
      maxDiffPixels: 80,
    });
  });

  test('[ui][visual][snapshot] completed tasks in Completed tab', async ({ todoPage, page }) => {
    await todoPage.addTask('Task 1');
    await todoPage.addTask('Task 2');
    await todoPage.completeTask('Task 1');
    await todoPage.completeTask('Task 2');

    await todoPage.goToCompleted();
    const list = page.locator('.todo-list');
    await list.waitFor({ state: 'visible' });

    await expect(list).toHaveScreenshot('todomvc-completed-list.png', {
      maxDiffPixels: 50,
    });
  });
});
