import { test, expect, request } from '@playwright/test';
import { RegisterPage } from '../pages/registerPage';
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashoardPage';
import { ModalCrearCuenta } from '../pages/modalCrearCuenta';
import testData from '../data/testData.json';
import { ModalEliminarCuenta } from '../pages/modalEliminarCuenta';
import { BackendUtils } from '../utils/backendUtils';

let registerPage: RegisterPage;
let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let modalCrearCuenta: ModalCrearCuenta;
let modalEliminarCuenta: ModalEliminarCuenta;

test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    modalCrearCuenta = new ModalCrearCuenta(page);
    modalEliminarCuenta = new ModalEliminarCuenta(page);
});

test('CUENTAS-01 - UI: Registrar usuario, login, creación dos cuentas, eliminación una', async ({ page, request }) => {
    const email = (testData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (testData.usuarioValido.email.split('@')[1]);
    //creo el usuario
    testData.usuarioValido.email = email;
    await registerPage.visitarPaginaRegistro();
    await registerPage.completarYHacerClickBotonRegistro(testData.usuarioValido);
    await expect(page.getByText('Registro exitoso!')).toBeVisible();
    //inicio sesión
    await loginPage.completarYHacerClickBotonLogin(testData.usuarioValido);
    await expect(dashboardPage.dashBoardTitle).toBeVisible();
    //agrego una cuenta nueva
    await dashboardPage.botonDeAgregarCuenta.click();
    await modalCrearCuenta.crearCuentaNueva('Débito', '3000');
    await expect(page.getByText('¡Cuenta creada exitosamente!')).toBeVisible();
    //agrego una segunda cuenta
    await dashboardPage.botonDeAgregarCuenta.click();
    await modalCrearCuenta.crearCuentaNueva('Ahorros', '200');
    await expect(page.getByText('¡Cuenta creada exitosamente!')).toBeVisible();
    // capturo el número de cuenta de la primer cuenta creada
    const jwt = await page.evaluate(() =>
        localStorage.getItem('jwt')
    );
    const respuestaDeCuentas = await request.get('http://localhost:6007/api/accounts', {
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    });
    const cuentas = await respuestaDeCuentas.json();
    const ultimosCuatroDigitos = cuentas[0].last4;
    console.log(ultimosCuatroDigitos);
    // elmino la primer cuenta creada
    await dashboardPage.botonEliminarCuenta.click();
    await modalEliminarCuenta.seleccionarCuentaABorrar(ultimosCuatroDigitos);
    await modalEliminarCuenta.botonEliminar.click();
    await expect(page.getByText('Cuenta eliminada exitosamente')).toBeVisible();
    // verifico que el historial muestre que la cuenta eliminada fue cerrada
    await expect(dashboardPage.elementosListaTransferencia.first()).toContainText(cuentas[0].last4);
});

test('CUENTAS-02 - API Registro usuario y creación cuenta', async ({ page, request }) => {
    const usuarioNuevo = await test.step('Se crea usuario por API', async () => {
        return await BackendUtils.crearUsuarioPorAPI(request, testData.usuarioValido, true);
    });
    await test.step('Se inicia sesión', async () => {
        await loginPage.visitarPaginaLogin();
        await loginPage.completarYHacerClickBotonLogin(usuarioNuevo);
        await expect(dashboardPage.dashBoardTitle).toBeVisible();
    });
    const jwt = await test.step('Se guarda el JWT', async () => {
        return await page.evaluate(() =>
            localStorage.getItem('jwt')
        );
    });
    await test.step('Se crea cuenta por API', async () => {
        await BackendUtils.crearCuentaPorAPI(request, jwt!, 'debit', '3000');
    });
    await test.step('Se verifica la cuenta creada', async () => {
        const respuestaDeCuentas = await request.get('http://localhost:6007/api/accounts', {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });

        const cuentas = await respuestaDeCuentas.json();
        const ultimosCuatroDigitos = cuentas[0].last4;
        console.log(ultimosCuatroDigitos);
        await page.reload();
        await expect(dashboardPage.elementosListaTransferencia.first()).toContainText(ultimosCuatroDigitos);
    });
});

test('CUENTAS-03 - API Registro usuario, creación cuenta y eliminación de cuenta', async ({ page, request }) => {
    const usuarioNuevo = await test.step('Se crea usuario por API', async () => {
        return await BackendUtils.crearUsuarioPorAPI(request, testData.usuarioValido, true);
    });
    await test.step('Se inicia sesión', async () => {
        await loginPage.visitarPaginaLogin();
        await loginPage.completarYHacerClickBotonLogin(usuarioNuevo);
        await expect(dashboardPage.dashBoardTitle).toBeVisible();
    });
    const jwt = await test.step('Se guarda el JWT', async () => {
        return await page.evaluate(() =>
            localStorage.getItem('jwt')
        );
    });
    await test.step('Se crea cuenta por API', async () => {
        await BackendUtils.crearCuentaPorAPI(request, jwt!, 'debit', '3000');
    });
    const datosCuenta = await test.step('Se verifica la cuenta creada', async () => {
        const respuestaDeCuentas = await request.get('http://localhost:6007/api/accounts', {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });
        const cuentas = await respuestaDeCuentas.json();
        const ultimosCuatroDigitos = cuentas[0].last4;
        const idCuenta = cuentas[0]._id
        await page.reload();
        await expect(dashboardPage.elementosListaTransferencia.first()).toContainText(ultimosCuatroDigitos);
        return { idCuenta, ultimosCuatroDigitos };
    });
    // 
    await test.step('Se elimina la cuenta por API', async () => {
        await BackendUtils.eliminarCuentaPorAPI(request, datosCuenta.idCuenta, jwt!);
        await page.reload();
        await expect(dashboardPage.elementosListaTransferencia.first()).toContainText(datosCuenta.ultimosCuatroDigitos);
    });
});