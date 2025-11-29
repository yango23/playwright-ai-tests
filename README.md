# Playwright AI Tests (playwright-ai-tests)

This repository contains a Playwright-based end-to-end testing suite for a TodoMVC example app (https://demo.playwright.dev/todomvc/#/). The tests are structured using a Page Object Model (POM) and focus on verifying common Todo app behaviours.

## Project structure
- `pages/` - Page Object Model classes for UI interactions. Example: `TodoPage.ts`.
- `tests/` - Playwright test files. Example: `tests/todomvc/todo.spec.ts`.
- `playwright.config.ts` - Playwright project configuration (browsers, timeouts, reporters, etc.).
- `playwright-report/` and `test-results/` - Output directories for reports and results.

## Getting started
Prerequisites: Node.js and npm installed

Install dependencies:

```powershell
cd f:\ai-qa-project
npm ci
```

Run the full test suite:

```powershell
npm test
```

Run a single spec:

```powershell
npm run test:spec
```

Run a single test by name (grep):

```powershell
npx playwright test --grep "editing existing todo updates the task name"
```

View the HTML report:

```powershell
npm run report
```

Debug (headed mode):

```powershell
npx playwright test --headed --debug
```

## Test patterns and conventions
- Use Page Objects in `pages/` to encapsulate selectors and UI flows. Tests should call POM methods instead of raw locators in tests.
- Tests are isolated; the app is loaded in each test using `TodoPage.open()`.
- Naming: use `.spec.ts` or `.test.ts` suffixes for test files.
- Assertions: use Playwright's `expect` API.

## Key files
- `pages/TodoPage.ts` - Encapsulates application interactions like adding, editing, completing, deleting tasks and navigation between All/Active/Completed views.
- `tests/todomvc/todo.spec.ts` - Contains tests for the Todo app: creating tasks, completing tasks, clearing completed, deleting and editing a task.

## Recent changes (Transkription)
- Added a new test case: `editing existing todo updates the task name` in `tests/todomvc/todo.spec.ts` verifying editing flow.
- Added `editTask(oldName, newName)` helper in `pages/TodoPage.ts` that enters edit mode (double-click on the label), updates the text, and submits with Enter.
- Improved POM resilience and test stability:
  - `open()` now waits for the todo input placeholder to be visible.
  - `completeTask()` includes an assertion to wait for the list item to receive the 'completed' class after toggling the checkbox.
  - Navigation helpers `goToAll()`/`goToActive()`/`goToCompleted()` use waits and fallbacks to reduce flakiness (wait for visibility, fallback to JS-click if necessary).
  - `createAndCompleteTasks()` waits for the UI to reveal the 'Clear completed' button and the filter nav, ensuring the 'Completed' link becomes actionable.

## Recommendations
- If flakiness persists, consider adding longer timeouts or waiting for additional app-stability signals in `open()` (e.g., `networkidle`, or a footer/footer text as a stable marker).
- Add more edge-case tests (e.g., editing to an empty name removes a task, editing with whitespace, editing in different views) to expand coverage.

## Contributing
- Create a new branch for features/bug fixes.
- Tests and related POM updates should be added together; keep tests focused and isolated.

## License
This project is provided as an example; check repository owner license.

---

If you'd like, I can add a detailed transkription file with step-by-step notes or add more examples and edge-case tests. Let me know.