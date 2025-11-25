# Copilot Instructions for AI Agents

## Project Overview
This project is a Playwright-based end-to-end (E2E) testing suite for a TodoMVC-style web application. The codebase is organized for clarity and maintainability, with a focus on automated browser testing.

## Key Components
- **pages/**: Page Object Models (POMs) encapsulating UI interactions. Example: `pages/TodoPage.ts` defines reusable selectors and actions for the Todo page.
- **tests/**: Contains all test specs. Subfolders (e.g., `todomvc/`) group related tests. Example: `tests/todomvc/todo.spec.ts` is a main E2E test file.
- **playwright.config.ts**: Central Playwright configuration (test runner options, browser settings, etc.).
- **playwright-report/**, **test-results/**: Output directories for Playwright HTML reports and raw results.

## Developer Workflows
- **Run all tests:**
  ```powershell
  npx playwright test
  ```
- **Run a specific test file:**
  ```powershell
  npx playwright test tests/todomvc/todo.spec.ts
  ```
- **View HTML report:**
  ```powershell
  npx playwright show-report
  ```
- **Debug tests (headed mode):**
  ```powershell
  npx playwright test --headed --debug
  ```

## Project-Specific Patterns
- **Page Object Model:** All UI interactions should go through page classes in `pages/`. Avoid direct selectors in test files.
- **Test Naming:** Use `.spec.ts` or `.test.ts` suffixes for test files. Group related tests in subfolders.
- **Assertions:** Use Playwright's built-in expect API for assertions.
- **Test Isolation:** Each test should be independent; use Playwright's fixtures for setup/teardown.

## Integration & Dependencies
- **Playwright** is the primary dependency (see `package.json`). No custom test runners or frameworks are used.
- **No backend/server code** is present in this repo; tests assume an external TodoMVC app is running or accessible.

## Examples
- See `pages/TodoPage.ts` for POM conventions.
- See `tests/todomvc/todo.spec.ts` for E2E test structure and best practices.

---

**For AI agents:**
- Always prefer updating/creating Page Objects for new UI flows.
- Keep tests atomic and stateless.
- Update this file if you introduce new conventions or workflows.
