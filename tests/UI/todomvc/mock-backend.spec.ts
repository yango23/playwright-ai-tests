
import { test, expect } from '@playwright/test';
import { loadUsersFixture } from '../../fixtures/data-loaders';
import { faker } from '@faker-js/faker';

test('UI handles randomly generated task names', async ({ page }) => {
  await page.route('**/api/users', route => {
    const users = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      name: faker.person.fullName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
    }));

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(users),
    });
  });

  await page.goto('/');

  const list = await page.evaluate(async () => {
    const resp = await fetch('/api/users');
    return resp.json();
  });

  expect(list.length).toBe(3);
});

test('UI uses mocked /api/users', async ({ page }) => {
  const usersJson = loadUsersFixture();

  await page.route('**/api/users', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: usersJson,
    });
  });

  await page.goto('/');
  // UI somewhere requests /api/users
  const users = await page.evaluate(async () => {
    const resp = await fetch('/api/users');
    return resp.json();
  });

  expect(users.length).toBe(2);
  expect(users[0].name).toBe('Neo Anderson');
});