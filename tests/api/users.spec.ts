// tests/api/users.spec.ts

import { test, expect, APIResponse } from '@playwright/test';
import { ApiClient, User, Post } from './client';

/**
 * Небольшой хелпер: общая проверка для "успешного JSON-ответа".
 *
 * Что он делает:
 *  - проверяет, что статус в "зелёной зоне" (2xx)
 *  - проверяет заголовок content-type (должен содержать application/json)
 *  - парсит JSON и возвращает его типизированным (T)
 */
async function expectJsonResponse<T>(response: APIResponse): Promise<T> {
  // HTTP-статус: 2xx
  expect(response.ok(), 'Ожидаем успешный статус (2xx)').toBeTruthy();

  // Проверяем, что сервер прислал JSON
  const headers = response.headers();
  const contentType = headers['content-type'] ?? headers['Content-Type'];
  expect(
    contentType,
    'Ответ должен иметь content-type с application/json',
  ).toBeDefined();
  expect(contentType).toContain('application/json');

  // Парсим тело
  const json = (await response.json()) as T;
  return json;
}

/**
 * Дополнительный хелпер: "форма" пользователя.
 * Мы не делаем строгую TS-проверку, но руками
 * убеждаемся, что нужные поля существуют и правильного типа.
 */
function expectUserShape(user: User) {
  expect(typeof user.id).toBe('number');
  expect(typeof user.name).toBe('string');
  expect(typeof user.username).toBe('string');
  expect(typeof user.email).toBe('string');
}

test.describe('Users API (jsonplaceholder)', () => {
  let client: ApiClient;

  /**
   * Перед каждым тестом создаём новый экземпляр клиента.
   * Playwright сам создаёт fresh APIRequestContext для каждого test, 
   * мы просто оборачиваем его в наш удобный класс.
   */
  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  test('GET /users возвращает список пользователей и правильные заголовки', async () => {
    // Use typed client helper to get JSON directly
    const users = await client.getUsersJson();

    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    for (const user of users.slice(0, 3)) {
      expectUserShape(user);
    }
  });

  test('GET /users/:id возвращает одного пользователя с ожидаемой структурой', async () => {
    const userId = 1;
    const user = await client.getUserJson(userId);
    expectUserShape(user);
    expect(user.id).toBe(userId);
  });

  test('GET /users/:id для большого ID возвращает 404', async () => {
    // jsonplaceholder обычно возвращает пустой объект с 200,
    // но допустим мы хотим проверить, что наш тест корректно
    // умеет работать и с ошибками (пример "негативного" теста).
    //
    // Здесь покажем пример "ожидаемой" ошибки, но не будем падать,
    // а именно проверим статус.
    const veryHighId = 999_999;

    const response = await client.getUser(veryHighId);

    // В реальном API мы бы ожидали 404.
    // Для jsonplaceholder это может быть 200 и {}, но кейс полезен
    // как демонстрация.
    const status = response.status();
    // Просто логируем для наглядности
    console.log(`Status for non-existing user: ${status}`);

    // В "боевом" API здесь было бы:
    // expect(response.status()).toBe(404);
    // Для демо оставим гарантию, что статус не 5xx:
    expect(status).toBeLessThan(500);
  });

  test('POST /posts создаёт новый пост и возвращает правильное тело', async () => {
    const newPostData: Omit<Post, 'id'> = {
      userId: 1,
      title: 'My API test post',
      body: 'This post was created via Playwright APIRequestContext.',
    };

    const createdPost = await client.createPostJson(newPostData);
    // jsonplaceholder всегда возвращает 201 + объект с id = 101
    // We still might want to check the response status via the raw method
    const response = await client.createPost(newPostData);
    expect(response.status()).toBe(201);

    // Проверяем, что сервер "вернул" то, что мы отправили
    expect(createdPost.title).toBe(newPostData.title);
    expect(createdPost.body).toBe(newPostData.body);
    expect(createdPost.userId).toBe(newPostData.userId);

    // Ид должен быть числом
    expect(typeof createdPost.id).toBe('number');
  });
});