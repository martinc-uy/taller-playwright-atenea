import {Page, Locator} from '@playwright/test';

export class LoginPage{
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly dashBoardTitle: Locator;

    constructor(page: Page){
        this.page = page;
        this.emailInput = page.locator('input[name="email"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.getByTestId('boton-login');
        this.dashBoardTitle = page.getByTestId('titulo-dashboard');
    }

    async visitarPaginaLogin() {
        await this.page.goto('http://localhost:3000/login');
        await this.page.waitForLoadState('networkidle');
    }

    async completarFormularioLogin(usuario: {email: string, contraseña: string}){
        await this.emailInput.fill(usuario.email);
        await this.passwordInput.fill(usuario.contraseña);
    }

    async hacerClickBotonLogin(){
        await this.loginButton.click();
    }

    async completarYHacerClickBotonLogin(usuario: {email: string, contraseña: string}){
        await this.completarFormularioLogin(usuario);
        await this.hacerClickBotonLogin();
    }
}