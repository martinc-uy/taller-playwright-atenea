import {Page, Locator} from '@playwright/test';

export class DashboardPage{
    readonly page: Page;
    readonly dashBoardTitle: Locator;

    constructor(page: Page){
        this.page = page;
        this.dashBoardTitle = page.getByTestId('titulo-dashboard');
    }

    async visitarPaginaLogin() {
        await this.page.goto('http://localhost:3000/dashboard');
        await this.page.waitForLoadState('networkidle');
    }

}