import { test as setup, expect } from '@playwright/test';
import { BackendUtils } from '../utils/backendUtils';
import testData from '../data/testData.json'
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashoardPage';
import { ModalCrearCuenta } from '../pages/modalCrearCuenta';
import fs from 'fs/promises';
import path from 'path';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let modalCrearCuenta: ModalCrearCuenta;

const usuarioEnviaAuthFile = 'playwright/.auth/usuarioEnvia.json';
const usuarioRecibeAuthFile = 'playwright/.auth/usuarioRecibe.json';
const usuarioEnviaDataFile = 'playwright/.auth/usuarioEnvia.data.json';

setup.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    modalCrearCuenta = new ModalCrearCuenta(page);
    await loginPage.visitarPaginaLogin();
});

setup('CONFIG-1 Generar usuario que envía dinero', async ({ page, request }) => {
    const nuevoUsuario = await BackendUtils.crearUsuarioPorAPI(request, testData.usuarioValido);

    // me lo pasó chatgpt para arreglar mis github actions
    await fs.mkdir(path.resolve(__dirname, '..', 'playwright/.auth'), { recursive: true });

    // Guardamos los datos del nuevo usuario para poder usarlos en los tests de transacciones
    await fs.writeFile(path.resolve(__dirname, '..', usuarioEnviaDataFile), JSON.stringify(nuevoUsuario, null, 2));

    await loginPage.completarYHacerClickBotonLogin(nuevoUsuario);
    await dashboardPage.botonDeAgregarCuenta.click();
    await modalCrearCuenta.crearCuentaNueva('Débito', "2850");
    await expect(page.getByText('¡Cuenta creada exitosamente!')).toBeVisible();
    await page.context().storageState({ path: usuarioEnviaAuthFile });
});

setup('CONFIG-2 Crear, loguearse con usuario que recibe dinero y crear cuenta de débito', async ({ page, request }) => {
    await BackendUtils.crearUsuarioPorAPI(request, testData.usuarioQueRecibeDinero,false);

    await loginPage.completarYHacerClickBotonLogin(testData.usuarioQueRecibeDinero);
    await expect(dashboardPage.dashBoardTitle).toBeVisible();
    await dashboardPage.botonDeAgregarCuenta.click();
    await modalCrearCuenta.crearCuentaNueva('Débito', "10");
    await expect(page.getByText('¡Cuenta creada exitosamente!')).toBeVisible();
    await page.context().storageState({ path: usuarioRecibeAuthFile });
});

setup('CONFIG-3 Crear usuario válido inicial', async ({ request }) => {
    await BackendUtils.crearUsuarioPorAPI(request, testData.usuarioValido, false);
});