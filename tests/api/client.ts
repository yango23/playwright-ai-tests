/**
 * tests/api/client.ts
 *
 * Shared API client for jsonplaceholder tests.
 * Provides low-level (raw response) and high-level (typed JSON) methods.
 * Supports environment-based BASE_URL override for multi-environment testing.
 *
 * Usage (low-level):
 *   const resp = await client.getUsers();
 *   const status = resp.status();
 *
 * Usage (high-level):
 *   const { response, data } = await client.getUsersJson();
 *   expect(data).toHaveLength(10);
 */

import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Base URL for all API requests.
 * Configurable via process.env.API_BASE_URL for multi-environment testing.
 * Defaults to jsonplaceholder.typicode.com, a free public API service.
 */
export const BASE_URL =
  process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

/**
 * User entity from jsonplaceholder.
 * Represents a user with id, name, username, and email.
 */
export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

/**
 * Post entity from jsonplaceholder.
 * Represents a blog post with userId, title, body, and server-assigned id.
 */
export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

/**
 * Result wrapper for high-level methods.
 * Includes both the raw APIResponse (for status checks, headers) and typed data.
 * Useful when you need to assert both response properties and JSON content.
 * @template T - The JSON data type
 */
export type JsonResult<T> = {
  response: APIResponse;
  data: T;
};

// ─────────────────────────────────────────────────────────────────────────
// ApiClient Class
// ─────────────────────────────────────────────────────────────────────────

/**
 * Wrapper around Playwright's APIRequestContext.
 * Encapsulates URL building and provides both low-level and high-level methods.
 *
 * Low-level methods (getUsers, getUser, createPost) return raw APIResponse.
 * Use these when you need status codes, headers, or error handling.
 *
 * High-level methods (getUsersJson, getUserJson, createPostJson) return JsonResult.
 * Use these for convenience; includes response + typed data.
 */
export class ApiClient {
  /**
   * Initialize ApiClient.
   * @param request - Playwright APIRequestContext for making HTTP requests
   * @param baseUrl - Base URL for API endpoints (defaults to jsonplaceholder)
   */
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string = BASE_URL,
  ) {}

  /**
   * Build full URL from base and path.
   * @param path - API path (e.g., '/users', '/posts')
   * @returns Full URL string ready for request
   */
  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Low-level methods: return raw APIResponse
  // Use these when you need status codes, headers, or error details.
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /users
   * Returns raw response for all users.
   * Caller handles JSON parsing and validation.
   * @returns APIResponse from GET /users
   */
  async getUsers(): Promise<APIResponse> {
    return this.request.get(this.url('/users'));
  }

  /**
   * GET /users/:id
   * Returns raw response for a single user.
   * @param id - User ID to fetch
   * @returns APIResponse from GET /users/:id
   */
  async getUser(id: number): Promise<APIResponse> {
    return this.request.get(this.url(`/users/${id}`));
  }

  /**
   * POST /posts
   * Creates a new post and returns raw response.
   * jsonplaceholder returns the posted data with a generated id.
   * @param data - Post data (userId, title, body)
   * @returns APIResponse from POST /posts
   */
  async createPost(data: Omit<Post, 'id'>): Promise<APIResponse> {
    return this.request.post(this.url('/posts'), { data });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // High-level methods: return JsonResult<T>
  // Use these for convenience; includes response + typed data.
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /users with automatic JSON parsing and typing.
   * Combines getUsers() response with typed User array data.
   * Useful when you need both response assertions and data validation.
   * @returns JsonResult with response and typed User[] array
   */
  async getUsersJson(): Promise<JsonResult<User[]>> {
    const response = await this.getUsers();
    const data = (await response.json()) as User[];
    return { response, data };
  }

  /**
   * GET /users/:id with automatic JSON parsing and typing.
   * Combines getUser() response with typed User object data.
   * @param id - User ID to fetch
   * @returns JsonResult with response and typed User object
   */
  async getUserJson(id: number): Promise<JsonResult<User>> {
    const response = await this.getUser(id);
    const data = (await response.json()) as User;
    return { response, data };
  }

  /**
   * POST /posts with automatic JSON parsing and typing.
   * Combines createPost() response with typed Post object data.
   * jsonplaceholder returns the posted data with a server-generated id.
   * @param payload - Post data (userId, title, body)
   * @returns JsonResult with response and typed Post object (including server-assigned id)
   */
  async createPostJson(
    payload: Omit<Post, 'id'>,
  ): Promise<JsonResult<Post>> {
    const response = await this.createPost(payload);
    const data = (await response.json()) as Post;
    return { response, data };
  }
}