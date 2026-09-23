import {Page, Locator} from '@playwright/test';

export class DashboardPage{
    readonly page: Page;
    readonly dashBoardTitle: Locator;
    readonly botonDeAgregarCuenta: Locator;
    readonly botonEnviarDinero: Locator;
    readonly elementosListaTransferencia: Locator;
    readonly elementosListaMontoTransferencia: Locator;

    constructor(page: Page){
        this.page = page;
        this.dashBoardTitle = page.getByTestId('titulo-dashboard');
        this.botonDeAgregarCuenta = page.getByTestId('tarjeta-agregar-cuenta');
        this.botonEnviarDinero = page.getByTestId('boton-enviar');
        this.elementosListaTransferencia = page.locator('[data-testid="descripcion-transaccion"]');
        this.elementosListaMontoTransferencia = page.locator('[data-testid="monto-transaccion"]');
    }

    // Visita pagina dashboard y login, es el mismo método
    async visitarPaginaLogin() {
        await this.page.goto('http://localhost:3000/dashboard');
        await this.page.waitForLoadState('networkidle');
    }

}