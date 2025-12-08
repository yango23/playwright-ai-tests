/**
 * tests/UI/todomvc/smoke.spec.ts
 *
 * Quick smoke tests for TodoMVC UI.
 * Tags: @ui @smoke
 * 
 * Consolidated with todo.spec.ts - kept for backward compatibility.
 * All smoke tests are now in todo.spec.ts under @smoke tag.
 */

import { uiTest as test } from '../../fixtures/ui';

test.skip('placeholder - see todo.spec.ts for actual smoke tests', async ({ todoPage }) => {
  await todoPage.addTask('Placeholder');
});

