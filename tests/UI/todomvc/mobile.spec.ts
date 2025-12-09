// tests/UI/todomvc/mobile.spec.ts

import { devices, expect } from '@playwright/test';
import { uiTest as test } from '../../fixtures/ui';
import { TodoPage } from '../../../pages/TodoPage';

/**
 * Mobile web tests for TodoMVC using Playwright device presets.
 * Tests verify TodoMVC functionality on mobile devices (Pixel 5, iPhone 12).
 * Tags: @ui @mobile @web
 */

const pixel5 = devices['Pixel 5'];
const iphone12 = devices['iPhone 12'];

test.describe('@ui @mobile TodoMVC on Mobile Devices', () => {
  /**
   * Pixel 5 mobile web tests
   * Google Pixel 5: Android device with 600x1024 viewport
   */
  test.describe('[mobile][pixel5] Pixel 5 Android Device', () => {
    test.beforeEach(({ browserName }) => {
      // Mobile emulation is only supported in Chromium and WebKit, not Firefox
      test.skip(browserName === 'firefox', 'Mobile emulation not supported in Firefox');
    });

    test('@mobile @pixel5 can add a task on mobile (Pixel 5)', async ({ browser }) => {
      const context = await browser.newContext(pixel5);
      const page = await context.newPage();
      const todoPage = new TodoPage(page);

      await todoPage.open();
      await todoPage.addTask('Buy groceries (mobile)');
      await todoPage.expectTaskVisible('Buy groceries (mobile)');

      await context.close();
    });

    test('@mobile @pixel5 can complete tasks on mobile (Pixel 5)', async ({ browser }) => {
      const context = await browser.newContext(pixel5);
      const page = await context.newPage();
      const todoPage = new TodoPage(page);

      await todoPage.open();
      await todoPage.addTask('Task 1 (mobile)');
      await todoPage.addTask('Task 2 (mobile)');
      
      await todoPage.completeTask('Task 1 (mobile)');
      
      await todoPage.goToActive();
      await todoPage.expectTaskVisible('Task 2 (mobile)');
      await todoPage.expectTaskNotVisible('Task 1 (mobile)');

      await context.close();
    });

    test('@mobile @pixel5 can delete tasks on mobile (Pixel 5)', async ({ browser }) => {
      const context = await browser.newContext(pixel5);
      const page = await context.newPage();
      const todoPage = new TodoPage(page);

      await todoPage.open();
      await todoPage.addTask('Delete me (mobile)');
      await todoPage.expectTaskVisible('Delete me (mobile)');
      
      await todoPage.deleteTask('Delete me (mobile)');
      await todoPage.expectTaskNotVisible('Delete me (mobile)');

      await context.close();
    });

    test('@mobile @pixel5 can filter tasks on mobile (Pixel 5)', async ({ browser }) => {
      const context = await browser.newContext(pixel5);
      const page = await context.newPage();
      const todoPage = new TodoPage(page);

      await todoPage.open();
      await todoPage.addTask('Active task (mobile)');
      await todoPage.addTask('Completed task (mobile)');
      
      await todoPage.completeTask('Completed task (mobile)');
      
      // Check Completed tab
      await todoPage.goToCompleted();
      await todoPage.expectTaskVisible('Completed task (mobile)');
      await todoPage.expectTaskNotVisible('Active task (mobile)');

      // Check Active tab
      await todoPage.goToActive();
      await todoPage.expectTaskVisible('Active task (mobile)');
      await todoPage.expectTaskNotVisible('Completed task (mobile)');

      await context.close();
    });
  });

  /**
   * iPhone 12 mobile web tests
   * Apple iPhone 12: iOS device with 390x844 viewport
   */
  test.describe('[mobile][iphone12] iPhone 12 iOS Device', () => {
    test.beforeEach(({ browserName }) => {
      // Mobile emulation is only supported in Chromium and WebKit, not Firefox
      test.skip(browserName === 'firefox', 'Mobile emulation not supported in Firefox');
    });

    test('@mobile @iphone12 can add a task on mobile (iPhone 12)', async ({ browser }) => {
      const context = await browser.newContext(iphone12);
      const page = await context.newPage();
      const todoPage = new TodoPage(page);

      await todoPage.open();
      await todoPage.addTask('Buy milk (iPhone)');
      await todoPage.expectTaskVisible('Buy milk (iPhone)');

      await context.close();
    });

    test('@mobile @iphone12 task list displays correctly on mobile (iPhone 12)', async ({ browser }) => {
      const context = await browser.newContext(iphone12);
      const page = await context.newPage();
      const todoPage = new TodoPage(page);

      await todoPage.open();
      await todoPage.addTask('Task A (iPhone)');
      await todoPage.addTask('Task B (iPhone)');
      await todoPage.addTask('Task C (iPhone)');

      await todoPage.goToAll();
      await todoPage.expectTaskVisible('Task A (iPhone)');
      await todoPage.expectTaskVisible('Task B (iPhone)');
      await todoPage.expectTaskVisible('Task C (iPhone)');

      await context.close();
    });
  });
});
