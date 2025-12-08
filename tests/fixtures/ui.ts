/**
 * tests/fixtures/ui.ts
 *
 * UI fixtures for TodoMVC E2E tests.
 * Provides: uiTest fixture with TodoPage POM.
 */

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
export { uiTest as test };
