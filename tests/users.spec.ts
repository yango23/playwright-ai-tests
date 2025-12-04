// tests/api/users.spec.ts
//
// API-тесты к публичному jsonplaceholder.
// Здесь мы показываем, что умеем:
//  - пользоваться ApiClient
//  - выносить общие проверки в хелперы
//  - делать параметризованные тесты (одна логика, разные данные)

import { test, expect } from '@playwright/test';
import type { APIResponse } from '@playwright/test';
import { ApiClient, type User, type Post } from '../api/client.ts';

// Простая проверка: строка "похожа" на e-mail.
// Для реального проекта можно сделать строже, но для учебного репо этого достаточно.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─────────────────────────────────────────────────────────────────────────
// Общие хелперы
// ─────────────────────────────────────────────────────────────────────────

/**
 * Базовая проверка успешного JSON-ответа:
 *  - статус == expectedStatus
 *  - response.ok() === true
 *  - content-type содержит application/json
 *
 * ВАЖНО: здесь мы НЕ читаем тело ответа (не вызываем json()/text()),
 * чтобы не "съесть" стрим до того, как его распарсят другие хелперы.
 */
async function expectJsonResponse(
  response: APIResponse,
  expectedStatus = 200,
): Promise<void> {
  // HTTP-статус
  expect(response.status(), 'HTTP status').toBe(expectedStatus);

  // Для 2xx/3xx ok() должен быть true
  expect(response.ok(), 'response.ok()').toBeTruthy();

  // Заголовок content-type
  const contentType = response.headers()['content-type'] ?? '';
  expect(contentType).toContain('application/json');
}

/**
 * Базовая проверка массива пользователей.
 */
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

// ─────────────────────────────────────────────────────────────────────────
// Наборы данных для параметризованных тестов
// ─────────────────────────────────────────────────────────────────────────

/**
 * Пользовательские ID, которые мы считаем "валидными" для демо-API.
 * Для каждого id будет создан отдельный тест.
 */
const USER_IDS = [1, 2, 3, 4, 5];

/**
 * Набор вариантов payload'ов для POST /posts.
 * Каждый элемент превратится в отдельный тест.
 */
const POST_CASES: Array<{
  name: string;            // человеко-читаемое имя кейса
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

// ─────────────────────────────────────────────────────────────────────────
// Набор тестов
// ─────────────────────────────────────────────────────────────────────────

test.describe('Users API (jsonplaceholder)', () => {
  // 1) БАЗОВЫЙ ТЕСТ: список пользователей
  test('GET /users возвращает валидный список пользователей', async ({
    request,
  }) => {
    const client = new ApiClient(request);

    // Берём JSON через "высокоуровневый" метод клиента
    const { response, data: users } = await client.getUsersJson();

    // Общие проверки ответа (статус + заголовки)
    await expectJsonResponse(response);

    // Проверяем структуру массива
    expectUsersArray(users);
  });

  // 2) ПАРАМЕТРИЗОВАННЫЕ ТЕСТЫ: GET /users/:id
  //
  // ЛОГИКА одна:
  //   - запросили пользователя по id
  //   - убедились, что всё ок и пришёл именно этот id
  //
  // МЕНЯЮТСЯ только данные (id), поэтому вместо копипасты
  // мы проходимся по USER_IDS и создаём тесты в цикле.
  for (const id of USER_IDS) {
    test(`GET /users/${id} возвращает корректного пользователя`, async ({
      request,
    }) => {
      const client = new ApiClient(request);

      const { response, data: user } = await client.getUserJson(id);

      await expectJsonResponse(response);

      expect(user.id).toBe(id);
      expect(typeof user.name).toBe('string');
      expect(typeof user.username).toBe('string');
      expect(user.email).toMatch(EMAIL_REGEX);
    });
  }
  // В репорте Playwright это будут несколько отдельных тестов
  // с разными названиями, но общей логикой.

  // 3) НЕГАТИВНЫЙ ТЕСТ: несуществующий пользователь
  test('GET /users/:id возвращает 404 для несуществующего id', async ({
    request,
  }) => {
    const client = new ApiClient(request);

    // Берём заведомо "нереальный" ID.
    const response = await client.getUser(99999);

    // Здесь нам важно только то, что ресурс не найден.
    expect(response.status()).toBe(404);
  });

  // 4) ПАРАМЕТРИЗОВАННЫЕ ТЕСТЫ: POST /posts
  //
  // Мы создаём несколько постов с разными payload'ами, но
  // проверяем одну и ту же логику.
  for (const { name, payload } of POST_CASES) {
    test(`POST /posts: ${name}`, async ({ request }) => {
      const client = new ApiClient(request);

      const { response, data: post } = await client.createPostJson(payload);

      // Для jsonplaceholder успешный POST = 201
      await expectJsonResponse(response, 201);

      // Сервер должен вернуть те же данные, что мы отправили
      expect(post).toMatchObject({
        userId: payload.userId,
        title: payload.title,
        body: payload.body,
      });

      // И выдать какой-то id (само число нам не важно)
      expect(typeof post.id).toBe('number');
    });
  }
});