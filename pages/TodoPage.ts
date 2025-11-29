import { Page, expect, Locator } from '@playwright/test';

export class TodoPage {
    private todoInput: Locator;
    private clearCompletedButton: Locator;
    private filtersNav: Locator;

    constructor(public page: Page) {
        this.todoInput = this.page.getByPlaceholder('What needs to be done?');
        this.clearCompletedButton = this.page.getByRole('button', { name: 'Clear completed' });
        this.filtersNav = this.page.locator('ul.filters');
    }

    async open() {
        await this.page.goto('https://demo.playwright.dev/todomvc/#/');
        await this.waitForAppReady();
    }

    /**
     * Reset application storage and reload the app (useful between tests)
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
     * Wait for the app to be ready by waiting for the input, filters, and clear button
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

    async addTask(taskName: string) {
        await this.todoInput.fill(taskName);
        await this.page.keyboard.press('Enter');
    }

    async completeTask(taskName: string) {
        const item = this.getTaskItem(taskName);

        await item.getByLabel('Toggle Todo').check();
        // Wait for the item to have the 'completed' class (UI state update)
        await expect(item).toHaveClass(/completed/);
    }

    async goToAll() { await this.gotoFilter('All', "a[href='#/']"); }

    async goToActive() { await this.gotoFilter('Active', "a[href='#/active']"); }

    async goToCompleted() { await this.gotoFilter('Completed', "a[href='#/completed']"); }

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

    async expectTaskVisible(taskName: string) {
        const item = this.getTaskItem(taskName);
        await expect(item).toBeVisible();
    }

    async expectTaskNotVisible(taskName: string) {
        const item = this.getTaskItem(taskName);
        // The item may not be in the DOM; assert that it's not visible or has no elements
        await expect(item).toBeHidden();
    }

    async deleteTask(taskName: string) {
        const item = this.getTaskItem(taskName);
        await item.hover();
        await item.locator('button.destroy').click();
    }

    async clearCompleted() {
        if (await this.clearCompletedButton.isVisible()) {
            await this.clearCompletedButton.click();
        }
    }

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

    async editTask(oldName: string, newName: string) {
        const item = this.getTaskItem(oldName);
        // Double click the label to enter edit mode
        await item.locator('label').dblclick();

        const input = item.locator('input.edit');
        await input.fill(newName);
        await input.press('Enter');
    }

    async toggleTask(taskName: string) {
        const item = this.getTaskItem(taskName);
        await item.getByLabel('Toggle Todo').click();
    }

    private getTaskItem(taskName: string) {
        return this.page.getByRole('listitem').filter({ hasText: taskName });
    }

}