import { test, expect } from '@playwright/test';

test('Google search works', async ({ page }) => {
    await page.goto('https://www.google.com')

    await page.getByRole('combobox').fill('Playwright');

    // Пауза для дебага
    await page.pause();

    await page.keyboard.press('Enter');

    await expect(page.getByRole('heading', {level: 3})).toBeVisible();
});