import { test, expect } from '@playwright/test';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

type User = {
  id: number;
  name: string;
  username?: string;
  email: string;
  [k: string]: unknown;
};

function userShape() {
  return expect.objectContaining({
    id: expect.any(Number),
    name: expect.any(String),
    email: expect.any(String),
  });
}

test.describe('Users API', () => {
  test('GET /users — возвращает список пользователей', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users`);

    // Basic checks
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');

    const users = (await response.json()) as User[];
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toEqual(userShape());
  });

  test('GET /users/1 — возвращает одного пользователя', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users/1`);

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');

    const user = (await response.json()) as User;
    expect(Array.isArray(user)).toBe(false);
    expect(user).toEqual(expect.objectContaining({ id: 1 }));
    expect(user).toEqual(userShape());
  });

  test('GET /this-route-does-not-exist — возвращает 404', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/this-route-does-not-exist`);

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(404);
    const bodyText = await response.text();
    expect(typeof bodyText === 'string').toBeTruthy();
  });

  test('POST /posts — создаёт новый пост (фейково)', async ({ request }) => {
    const newPost = {
      title: 'My first API test',
      body: 'Hello from Playwright API tests',
      userId: 1,
    };

    const response = await request.post(`${BASE_URL}/posts`, {
      data: newPost,
    });

    expect(response.status()).toBe(201);
    expect(response.ok()).toBeTruthy();
    const created = await response.json();
    expect(created).toMatchObject(newPost);
    expect(created).toHaveProperty('id');
  });
});