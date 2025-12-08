/**
 * tests/fixtures/index.ts
 *
 * Centralized barrel export for all fixtures.
 * Re-exports uiTest and apiTest from their respective modules.
 */

export { uiTest, expect as uiExpect } from './ui';
export { apiTest, expect as apiExpect } from './api';
export { expect } from '@playwright/test';
