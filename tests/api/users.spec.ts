// tests/api/users.spec.ts
//
// API-тесты к публичному jsonplaceholder.
// Здесь главное — показать умение:
// - пользоваться ApiClient
// - писать хелперы для ассертов
// - делать параметризованные тесты (одна логика, много данных)

import { test, expect } from '@playwright/test';
import { ApiClient, User, Post } from './client';

// Простая проверка: строка похожа на e-mail.
// Для учебных целей этого достаточно.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Хелпер: проверяем, что ответ успешный и имеет JSON content-type.
// IMPORTANT: this helper intentionally does NOT parse the response body
// because callers may choose to parse it themselves (and APIResponse.json()/text()
// can only be called once). Keep this function focused on status & headers.
async function expectJsonResponse(
  response: Awaited<ReturnType<ApiClient['getUsers']>>,
  expectedStatus = 200,
): Promise<void> {
  // Проверяем HTTP-статус
  expect(response.status(), 'HTTP status').toBe(expectedStatus);

  // Playwright-флаг ok() должен быть true для 2xx–3xx.
  expect(response.ok(), 'response.ok()').toBeTruthy();

  // Проверяем заголовок content-type (не парсим тело здесь)
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

test.describe('Users API (jsonplaceholder)', () => {
  // ─────────────────────────────────────────────
  // 1) БАЗОВЫЙ ТЕСТ: список пользователей
  // ─────────────────────────────────────────────
  test('GET /users возвращает валидный список пользователей', async ({
    request,
  }) => {
    const client = new ApiClient(request);

    // Берём JSON через удобный helper
    const { response, data: users } = await client.getUsersJson();

    // Общие проверки ответа
    await expectJsonResponse(response);

    // Проверяем структуру массива
    expectUsersArray(users);
  });

  // ─────────────────────────────────────────────
  // 2) ПАРАМЕТРИЗОВАННЫЕ ТЕСТЫ: GET /users/:id
  //
  // ЛОГИКА одна и та же:
  //   - запросить пользователя по id
  //   - проверить статус, JSON, поля
  //
  // МЕНЯЮТСЯ только данные: id.
  // Вместо копипасты — цикл по массиву USER_IDS.
  // ─────────────────────────────────────────────

  const USER_IDS = [1, 2, 3, 4, 5];

  for (const id of USER_IDS) {
    test(`GET /users/${id} возвращает корректного пользователя`, async ({
      request,
    }) => {
      const client = new ApiClient(request);

      const { response, data: user } = await client.getUserJson(id);

      // Проверяем, что ответ успешный и это JSON
      await expectJsonResponse(response);

      // Проверяем, что вернулся нужный пользователь
      expect(user.id).toBe(id);
      expect(typeof user.name).toBe('string');
      expect(typeof user.username).toBe('string');
      expect(user.email).toMatch(EMAIL_REGEX);
    });
  }

  // В раннере Playwright это будут ПЯТЬ отдельных тестов
  // с разными названиями, но с общей логикой.

  // ─────────────────────────────────────────────
  // 3) НЕГАТИВНЫЙ ТЕСТ: несуществующий пользователь
  // ─────────────────────────────────────────────
  test('GET /users/:id возвращает 404 для несуществующего id', async ({
    request,
  }) => {
    const client = new ApiClient(request);

    // Берём заведомо "нереальный" ID.
    const response = await client.getUser(99999);

    // Здесь нам не нужно тело ответа — только статус.
    expect(response.status()).toBe(404);
  });

  // ─────────────────────────────────────────────
  // 4) ПАРАМЕТРИЗОВАННЫЕ POST-ТЕСТЫ: /posts
  //
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
    test(`POST /posts: ${name}`, async ({ request }) => {
      const client = new ApiClient(request);

      const { response, data: post } = await client.createPostJson(payload);

      // Для jsonplaceholder успешный POST = 201
      await expectJsonResponse(response, 201);

      // Проверяем, что сервер вернул то же, что мы отправили
      expect(post).toMatchObject({
        userId: payload.userId,
        title: payload.title,
        body: payload.body,
      });

      // И выдал какой-то id (нам важен факт, а не конкретное число)
      expect(typeof post.id).toBe('number');
    });
  }
});
