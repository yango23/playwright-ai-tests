// tests/api/fixtures.ts
//
// Общая фикстура для API-тестов.
// Даёт готовый apiClient в каждый тест.

import { test as base, expect } from '@playwright/test';
import { ApiClient } from './client';

export type ApiFixtures = {
  apiClient: ApiClient;
};

const apiTest = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    // Здесь можно подхватывать BASE_URL из env, логировать и т.п.
    const client = new ApiClient(request);
    await use(client);
  },
});

export { apiTest, expect };
export { apiTest as test }; // Also export as 'test' for convenience