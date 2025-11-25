import { test, expect } from '@playwright/test';

test('Google search works', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc')

    await page.getByPlaceholder('What needs to be done?').fill('Buy milk')

    await page.keyboard.press('Enter');

    await expect(page.getByText('Buy milk')).toBeVisible();
});