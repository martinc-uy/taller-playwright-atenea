import { test as setup, expect } from '@playwright/test';
import { BackendUtils } from '../utils/backendUtils';
import testData from '../data/testData.json'
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashoardPage';
import { ModalCrearCuenta } from '../pages/modalCrearCuenta';
import fs from 'fs/promises';
import path from 'path';

let loginPage: LoginPage;
let dashBoardPage: DashboardPage;
let modalCrearCuenta: ModalCrearCuenta;

const usuarioEnviaAuthFile = 'playwright/.auth/usuarioEnvia.json';
const usuarioRecibeAuthFile = 'playwright/.auth/usuarioRecibe.json';
const usuarioEnviaDataFile = 'playwright/.auth/usuarioEnvia.data.json';

setup.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashBoardPage = new DashboardPage(page);
    modalCrearCuenta = new ModalCrearCuenta(page);
    await loginPage.visitarPaginaLogin();
});

setup('CONFIG-1 Generar usuario que envía dinero', async ({ page, request }) => {
    const nuevoUsuario = await BackendUtils.crearUsuarioPorAPI(request, testData.usuarioValido);

    // Guardamos los datos del nuevo usuario para poder usarlos en los tests de transacciones
    await fs.writeFile(path.resolve(__dirname, '..', usuarioEnviaDataFile), JSON.stringify(nuevoUsuario, null, 2));

    await loginPage.completarYHacerClickBotonLogin(nuevoUsuario);
    await dashBoardPage.botonDeAgregarCuenta.click();
    await modalCrearCuenta.seleccionarTipoDeCuenta('Débito');
    await modalCrearCuenta.completarMonto('1000');
    await modalCrearCuenta.botonCrearCuenta.click();
    await expect(page.getByText('¡Cuenta creada exitosamente!')).toBeVisible();
    await page.context().storageState({ path: usuarioEnviaAuthFile });
});

setup('CONFIG-2 Loguear con usuario que recibe dinero', async ({ page }) => {
    await loginPage.completarYHacerClickBotonLogin(testData.usuarioQueRecibeDinero);
    await expect(dashBoardPage.dashBoardTitle).toBeVisible();
    await page.context().storageState({ path: usuarioRecibeAuthFile });
});

