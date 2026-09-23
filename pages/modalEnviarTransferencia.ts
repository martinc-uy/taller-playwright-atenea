import { Page, Locator } from '@playwright/test';

export class ModalEnviarTransferencia {
    readonly page: Page;
    readonly emailDestinatarioInput: Locator;
    readonly cuentaOrigenDropdown: Locator;
    readonly montoEnviarInput: Locator;
    readonly botonEnviar: Locator;
    readonly botonCancelar: Locator;
    readonly cuentaOrigenOption: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailDestinatarioInput = page.getByRole('textbox', { name: 'Email del destinatario *' });
        this.cuentaOrigenDropdown = page.getByRole('combobox', { name: 'Cuenta origen *' });
        this.montoEnviarInput = page.getByRole('spinbutton', { name: 'Monto a enviar *' });
        this.botonEnviar = page.getByRole('button', { name: 'Enviar' });
        this.botonCancelar = page.getByRole('button', { name: 'Cancelar' });
        this.cuentaOrigenOption = page.getByRole('option', { name: '••••' });
    }

    async completarYEnviar(emailDestinatario: string, monto:string) {
        await this.emailDestinatarioInput.fill(emailDestinatario);
        await this.cuentaOrigenDropdown.click();
        await this.cuentaOrigenOption.first().click();
        await this.montoEnviarInput.fill(monto);
        await this.botonEnviar.click();
    }
}