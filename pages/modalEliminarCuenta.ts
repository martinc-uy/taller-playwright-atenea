import {Page, Locator} from '@playwright/test';

export class ModalEliminarCuenta {
    readonly page: Page;
    readonly seleccionarCuentaDropdown: Locator;
    readonly botonCancelar: Locator;
    readonly botonEliminar: Locator; 
    
    constructor(page: Page){
        this.page = page;
        this.seleccionarCuentaDropdown = page.getByRole('combobox', { name: 'Selecciona cuenta' });
        this.botonCancelar = page.getByRole('button', { name: 'Cancelar' });
        this.botonEliminar = page.getByRole('button', { name: 'Eliminar' });
    }

    async seleccionarCuentaABorrar(cuenta: string) {
        await this.seleccionarCuentaDropdown.click();
        await this.page.getByRole('option', { name: cuenta }).click();
    }
}