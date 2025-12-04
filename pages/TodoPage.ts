/**
 * pages/TodoPage.ts
 *
 * Page Object Model (POM) for the TodoMVC application.
 * Encapsulates all UI interactions and selectors.
 * Provides both low-level task actions and high-level helper methods.
 *
 * Usage:
 *   const page = new TodoPage(browserPage);
 *   await page.open();
 *   await page.addTask('Learn Playwright');
 *   await page.completeTask('Learn Playwright');
 */

import { Page, expect, Locator } from '@playwright/test';

export class TodoPage {
    // Cached locators for main UI elements
    // Caching improves test stability by reusing locator references
    private todoInput: Locator;
    private clearCompletedButton: Locator;
    private filtersNav: Locator;

    /**
     * Initialize the TodoPage with cached locator references.
     * @param page - Playwright Page object
     */
    constructor(public page: Page) {
        this.todoInput = this.page.getByPlaceholder('What needs to be done?');
        this.clearCompletedButton = this.page.getByRole('button', { name: 'Clear completed' });
        this.filtersNav = this.page.locator('ul.filters');
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Navigation & Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Navigate to the TodoMVC application and wait for it to be ready.
     * Safe to call from any state; will navigate to the app URL and ensure UI is interactive.
     */
    async open() {
        await this.page.goto('https://demo.playwright.dev/todomvc/#/');
        await this.waitForAppReady();
    }

    /**
     * Reset the application state by clearing localStorage and reloading.
     * Useful for test isolation and ensuring clean state between tests.
     * Note: Must call open() first to establish the correct origin before clearing.
     */
    async reset() {
        // Navigate to the app first so the origin matches before clearing localStorage
        await this.open();
        try {
            await this.page.evaluate(() => localStorage.clear());
            // reload so the app picks up the cleared storage
            await this.page.reload();
            await this.waitForAppReady();
        } catch (e) {
            // swallow security errors and proceed; open() + waitForAppReady should be sufficient
        }
    }

    /**
     * Wait for the app to be ready by checking key UI elements.
     * Implements defensive waits with fallbacks to handle async app initialization.
     * - Primary signal: main input visible
     * - Secondary: network idle (pragmatic indicator of resource loading)
     * - Tertiary (non-blocking): filters nav and clear button visibility
     *
     * Non-blocking waits ensure tests don't hang waiting for optional UI state.
     */
    async waitForAppReady() {
        // Wait for main input to be visible; that's the primary readiness signal
        await this.todoInput.waitFor({ state: 'visible', timeout: 10000 });
        // Wait for network idle as a pragmatic indicator the page finished loading resources
        try {
            await this.page.waitForLoadState('networkidle', { timeout: 5000 });
        } catch (e) {
            // Don't fail if networkidle isn't reached in time — app might still be interactive
        }
        // Filters nav sometimes isn't present or takes longer; do a short non-blocking wait so we don't block tests
        try {
            await this.filtersNav.waitFor({ state: 'visible', timeout: 1000 });
        } catch (e) {
            // ignore timeout
        }
        // The clear button only appears when the footer is visible / when there are completed tasks,
        // so do a non-blocking wait for it to be visible when present.
        try {
            await this.clearCompletedButton.waitFor({ state: 'visible', timeout: 1000 });
        } catch (e) {
            // ignore timeout — just means there are no completed tasks initially
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Task Actions
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Add a new task by typing into the input and pressing Enter.
     * @param taskName - The task description to add
     */
    async addTask(taskName: string) {
        await this.todoInput.fill(taskName);
        await this.page.keyboard.press('Enter');
    }

    /**
     * Mark a task as complete by clicking its toggle checkbox.
     * Waits for the UI state to update (item gets 'completed' class).
     * @param taskName - The task description to complete
     */
    async completeTask(taskName: string) {
        const item = this.getTaskItem(taskName);

        await item.getByLabel('Toggle Todo').check();
        // Wait for the item to have the 'completed' class (UI state update)
        await expect(item).toHaveClass(/completed/);
    }

    /**
     * Delete a task by hovering and clicking the destroy button.
     * @param taskName - The task description to delete
     */
    async deleteTask(taskName: string) {
        const item = this.getTaskItem(taskName);
        await item.hover();
        await item.locator('button.destroy').click();
    }

    /**
     * Toggle task completion state by clicking the checkbox.
     * Does not wait for state change; use completeTask() for that.
     * @param taskName - The task description to toggle
     */
    async toggleTask(taskName: string) {
        const item = this.getTaskItem(taskName);
        await item.getByLabel('Toggle Todo').click();
    }

    /**
     * Edit an existing task by double-clicking its label, updating the text, and pressing Enter.
     * @param oldName - Current task description
     * @param newName - New task description
     */
    async editTask(oldName: string, newName: string) {
        const item = this.getTaskItem(oldName);
        // Double click the label to enter edit mode
        await item.locator('label').dblclick();

        const input = item.locator('input.edit');
        await input.fill(newName);
        await input.press('Enter');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Navigation: Filters
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Navigate to 'All' filter view (shows all tasks).
     */
    async goToAll() { await this.gotoFilter('All', "a[href='#/']"); }

    /**
     * Navigate to 'Active' filter view (shows incomplete tasks).
     */
    async goToActive() { await this.gotoFilter('Active', "a[href='#/active']"); }

    /**
     * Navigate to 'Completed' filter view (shows completed tasks).
     */
    async goToCompleted() { await this.gotoFilter('Completed', "a[href='#/completed']"); }

    /**
     * Internal helper to navigate to a filter by name and selector.
     * Uses defensive approach: tries getByRole first, then falls back to selector, then JS click.
     * This ensures navigation works even if selectors or roles change.
     * @param name - Display name of the filter (used for getByRole)
     * @param selector - CSS selector as fallback
     */
    private async gotoFilter(name: string, selector: string) {
        try {
            const link = this.page.getByRole('link', { name });
            await link.waitFor({ state: 'visible', timeout: 5000 });
            await link.click();
            return;
        } catch (e) {
            // If the role-based link is not visible we use the selector fallback and a JS click fallback
        }

        try {
            await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
            await this.page.click(selector);
        } catch (e) {
            await this.page.evaluate((s) => {
                const el = document.querySelector(s) as HTMLElement | null;
                if (el) el.click();
            }, selector);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Assertions & State Checks
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Assert that a task is visible in the current view.
     * @param taskName - The task description to check
     * @throws If the task is not visible
     */
    async expectTaskVisible(taskName: string) {
        const item = this.getTaskItem(taskName);
        await expect(item).toBeVisible();
    }

    /**
     * Assert that a task is not visible in the current view.
     * @param taskName - The task description to check
     * @throws If the task is visible
     */
    async expectTaskNotVisible(taskName: string) {
        const item = this.getTaskItem(taskName);
        // The item may not be in the DOM; assert that it's not visible or has no elements
        await expect(item).toBeHidden();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Bulk Operations
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create and immediately complete multiple tasks.
     * Waits for UI indicators (footer, filters) to be visible after all tasks are created.
     * Useful for test setup with completed tasks.
     * @param names - Variable number of task descriptions to create and complete
     */
    async createAndCompleteTasks(...names: string[]) {
        for (const name of names) {
            await this.addTask(name);
            await this.completeTask(name);
        }
        // Ensure the UI displays the completed state (footer with 'Clear completed' becomes visible)
        await this.clearCompletedButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        // Ensure the filter nav is present and updated
        await this.filtersNav.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    }

    /**
     * Clear all completed tasks by clicking the 'Clear completed' button.
     * Only clicks if the button is visible (i.e., there are completed tasks).
     */
    async clearCompleted() {
        if (await this.clearCompletedButton.isVisible()) {
            await this.clearCompletedButton.click();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper Methods (Internal)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get the list item element for a specific task by its label text.
     * Returns a Locator; does not fail if the item is not found.
     * @param taskName - The task description to find
     * @returns Locator for the list item
     */
    private getTaskItem(taskName: string) {
        return this.page.getByRole('listitem').filter({ hasText: taskName });
    }

}