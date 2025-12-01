// tests/api/users.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Users API', () => {

  test('GET /users возвращает список пользователей', async ({ request }) => {
    // 1. Делаем GET-запрос к публичному API. Using jsonplaceholder for a stable open API
    const response = await request.get('https://jsonplaceholder.typicode.com/users');

    // 2. Проверяем статус-код и что запрос успешен
    // APIResponse.ok() returns true for 2xx status codes
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    // 3. Парсим JSON (после проверки статуса)
    const body = await response.json();
    // Ensure response is an array of users

    // 4. Проверяем структуру ответа — jsonplaceholder returns an array of users
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // 5. Проверяем конкретное поле у первого пользователя
    const firstUser = body[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('email');
  });

});
