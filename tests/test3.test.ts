import { test, expect } from '@playwright/test';

test('add two todos and complete them', async ({ page }) => {
  // 1. Открываем демо-приложение ToDo
  await page.goto('https://demo.playwright.dev/todomvc/#/');

  // Пауза для дебага: можно смотреть DOM, кликать, играться
  await page.pause();

  // 2. Добавляем первую задачу "TestTest"
  await page.getByPlaceholder('What needs to be done?').fill('TestTest');
  await page.keyboard.press('Enter');

  // 3. Добавляем вторую задачу "anotherTask"
  await page.getByPlaceholder('What needs to be done?').fill('anotherTask');
  await page.keyboard.press('Enter');

  // 4. Отмечаем обе задачи как выполненные (чекбоксы)
  await page
    .getByRole('listitem')
    .filter({ hasText: 'TestTest' })
    .getByLabel('Toggle Todo')
    .check();

  await page
    .getByRole('listitem')
    .filter({ hasText: 'anotherTask' })
    .getByLabel('Toggle Todo')
    .check();

  // 5. Переходим во вкладку Completed
  await page.getByRole('link', { name: 'Completed' }).click();

  // 6. Проверяем, что обе задачи видны во вкладке Completed
  await expect(page.getByText('TestTest')).toBeVisible();
  await expect(page.getByText('anotherTask')).toBeVisible();

  // Пауза для дебага: можно смотреть DOM, кликать, играться
  await page.pause();
});