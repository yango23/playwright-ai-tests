/**
 * tests/fixtures/api.ts
 *
 * API fixtures for testing against jsonplaceholder and other HTTP APIs.
 * Provides: apiTest fixture with typed ApiClient.
 */

import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../api/client';

export type ApiFixtures = {
  apiClient: ApiClient;
};

const apiTest = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    await use(client);
  },
});

export { apiTest, expect };
export { apiTest as test };
