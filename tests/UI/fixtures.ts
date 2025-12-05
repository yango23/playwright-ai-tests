// tests/ui/fixtures.ts
//
// Общая UI-фикстура для E2E-тестов TodoMVC.
// Даёт готовый todoPage, уже открытый и подготовленный.

import { test as base, expect } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';

export type UiFixtures = {
  todoPage: TodoPage;
};

const uiTest = base.extend<UiFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);

    await todoPage.open();
    await todoPage.waitForAppReady();

    await use(todoPage);
  },
});

export { uiTest, expect };
export { uiTest as test }; // Also export as 'test' for convenience
export type { UiFixtures };