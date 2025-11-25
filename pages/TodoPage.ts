import { Page, expect } from '@playwright/test';

export class TodoPage {
    constructor(public page:Page) {}

    async open() {
        await this.page.goto('https://demo.playwright.dev/todomvc/#/');
    }

    async addTask(taskName: string) {
        await this.page.getByPlaceholder('What needs to be done?').fill(taskName);
        await this.page.keyboard.press('Enter');
    }

    async completeTask(taskName: string) {
        await this.page
        .getByRole('listitem')
        .filter({hasText: taskName})
        .getByLabel('Toggle Todo')
        .check();
    }

    async goToCompleted() {
        await this.page.getByRole('link', {name:'Completed'}).click();
    }

    async expectTaskVisible(taskName: string) {
        await expect(this.page.getByText(taskName)).toBeVisible();
    }

    async expectTaskNotVisible(taskName: string) {
        await expect(this.page.getByText(taskName)).toBeHidden();
    }   
}