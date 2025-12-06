// tests/api/users.spec.ts
//
// API-тесты к публичному jsonplaceholder.
// Теги:
// [api]     — API-тесты
// [users]   — работа с ресурсом /users
// [posts]   — работа с ресурсом /posts
// [smoke]   — базовые быстрые проверки
// [negative] — негативные сценарии

// Здесь главное — показать умение:
// - пользоваться ApiClient
// - писать хелперы для ассертов
// - делать параметризованные тесты (одна логика, много данных)
import { expect } from '@playwright/test';
import { apiTest as test } from './fixtures';
import type { User, Post } from './client';
import { ApiClient } from './client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Хелпер: проверяем, что ответ успешный и имеет JSON content-type.
// IMPORTANT: this helper intentionally does NOT parse the response body
// because callers may choose to parse it themselves (and APIResponse.json()/text()
// can only be called once). Keep this function focused on status & headers.
async function expectJsonResponse(
  response: Awaited<ReturnType<ApiClient['getUsers']>>,
  expectedStatus = 200,
): Promise<void> {
  expect(response.status(), 'HTTP status').toBe(expectedStatus);
  expect(response.ok(), 'response.ok()').toBeTruthy();

  const contentType = response.headers()['content-type'] ?? '';
  expect(contentType).toContain('application/json');
}

// Хелпер: базовая проверка массива пользователей.
function expectUsersArray(users: User[]) {
  expect(Array.isArray(users), 'users should be an array').toBe(true);
  expect(users.length).toBeGreaterThan(0);

  for (const user of users) {
    expect(typeof user.id).toBe('number');
    expect(typeof user.name).toBe('string');
    expect(typeof user.username).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(user.email).toMatch(EMAIL_REGEX);
  }
}

test.describe('[api][users] Users API (jsonplaceholder)', () => {
  // ─────────────────────────────────────────────
  // 1) БАЗОВЫЙ ТЕСТ: список пользователей
  // ─────────────────────────────────────────────
  test('[api][users][smoke] GET /users возвращает валидный список пользователей', async ({ apiClient }) => {
    const { response, data: users } = await apiClient.getUsersJson();

    // Общие проверки ответа
    await expectJsonResponse(response);

    // Проверяем структуру массива
    expectUsersArray(users);
  });

  const USER_IDS = [1, 2, 3, 4, 5];

  for (const id of USER_IDS) {
    test(`[api][users] GET /users/${id} возвращает корректного пользователя`, async ({ apiClient }) => {
      const { response, data: user } = await apiClient.getUserJson(id);

      await expectJsonResponse(response);
      expect(user.id).toBe(id);
      expect(typeof user.name).toBe('string');
      expect(typeof user.username).toBe('string');
      expect(user.email).toMatch(EMAIL_REGEX);
    });
  }

  // ─────────────────────────────────────────────
  // 3) НЕГАТИВНЫЙ ТЕСТ: несуществующий пользователь
  // ─────────────────────────────────────────────
  test('[api][users][negative] GET /users/:id возвращает 404 для несуществующего id', async ({ apiClient }) => {
    const response = await apiClient.getUser(99999);
    expect(response.status()).toBe(404);
  });

  // ─────────────────────────────────────────────
  // 4) ПАРАМЕТРИЗОВАННЫЕ POST-ТЕСТЫ: /posts
  // Проверяем, что API создаёт посты с разными payload'ами.
  // ─────────────────────────────────────────────

  // Набор вариантов данных для создания постов
  const POST_CASES: Array<{
    name: string; // читаемое имя кейса для названия теста
    payload: Omit<Post, 'id'>;
  }> = [
    {
      name: 'простой пост для userId=1',
      payload: {
        userId: 1,
        title: 'Smoke test post',
        body: 'This is a test post for portfolio #1',
      },
    },
    {
      name: 'ещё один пост для userId=2',
      payload: {
        userId: 2,
        title: 'Another API test',
        body: 'Second test body for portfolio.',
      },
    },
  ];

  for (const { name, payload } of POST_CASES) {
    test(`[api][posts] POST /posts: ${name}`, async ({ apiClient }) => {
      const { response, data: post } = await apiClient.createPostJson(payload);

      await expectJsonResponse(response, 201);

      expect(post).toMatchObject({
        userId: payload.userId,
        title: payload.title,
        body: payload.body,
      });
      expect(typeof post.id).toBe('number');
    });
  }
});
