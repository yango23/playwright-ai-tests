// tests/api/client.ts

import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Базовый URL для всех API-запросов.
 * В реальном проекте обычно берётся из env-переменных,
 * но здесь мы фиксируем публичное демо-API.
 */
export const BASE_URL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';

/**
 * Тип одного пользователя в jsonplaceholder.
 * Мы описываем только те поля, которые реально проверяем в тестах.
 */
export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

/**
 * Тип поста в jsonplaceholder.
 */
export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

/**
 * Небольшой API-клиент поверх Playwright APIRequestContext.
 *
 * Идея:
 *  - тесты не знают, как именно собирается URL
 *  - вся работа с базовым URL и путями спрятана внутри
 *  - если поменяется базовый адрес (staging / prod) —
 *    меняем только здесь
 */
export class ApiClient {
  /**
   * @param request - встроенный в Playwright объект для HTTP-запросов
   * @param baseUrl - базовый URL сервиса (по умолчанию jsonplaceholder)
   */
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string = BASE_URL,
  ) {}

  /**
   * Вспомогательный метод: аккуратно склеивает baseUrl и путь.
   * Чтобы не дублировать `${this.baseUrl}/...` в каждом методе.
   */
  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  // -----------------------
  // Users
  // -----------------------

  /**
   * GET /users
   * Возвращает "сырое" APIResponse — тест сам решает,
   * как его парсить и что проверять.
   */
  async getUsers(): Promise<APIResponse> {
    return this.request.get(this.url('/users'));
  }

  async getUsersJson(): Promise<User[]> {
    const response = await this.getUsers();
    return (await response.json()) as User[];
  }

  /**
   * GET /users/:id
   */
  async getUser(id: number): Promise<APIResponse> {
    return this.request.get(this.url(`/users/${id}`));
  }

  async getUserJson(id: number): Promise<User> {
    const response = await this.getUser(id);
    return (await response.json()) as User;
  }

  // -----------------------
  // Posts
  // -----------------------

  /**
   * POST /posts
   * @param data - данные поста без поля id (id создаёт сервер)
   */
  async createPost(data: Omit<Post, 'id'>): Promise<APIResponse> {
    return this.request.post(this.url('/posts'), {
      data,
    });
  }

  async createPostJson(data: Omit<Post, 'id'>): Promise<Post> {
    const response = await this.createPost(data);
    return (await response.json()) as Post;
  }
}