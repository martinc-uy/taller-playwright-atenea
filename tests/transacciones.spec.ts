import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashoardPage';
import { ModalEnviarTransferencia } from '../pages/modalEnviarTransferencia';
import testData from '../data/testData.json';
import fs from 'fs/promises';


let dashboardPage: DashboardPage;
let modalEnviarTransferencia: ModalEnviarTransferencia;

const testUsuarioEnvia = test.extend({
   storageState: require.resolve('../playwright/.auth/usuarioEnvia.json')
});

const testUsuarioRecibe = test.extend({
    storageState: require.resolve('../playwright/.auth/usuarioRecibe.json')
});

test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    modalEnviarTransferencia = new ModalEnviarTransferencia(page);
    await dashboardPage.visitarPaginaLogin();
});

testUsuarioEnvia('TC-12 Verificar transacción exitosa', async ({ page }) => {
    await expect(dashboardPage.dashBoardTitle).toBeVisible();
    await dashboardPage.botonEnviarDinero.click();
    await modalEnviarTransferencia.completarYEnviar(testData.usuarioQueRecibeDinero.email, '100');
    await expect(page.getByText('Transferencia enviada a ' + testData.usuarioQueRecibeDinero.email)).toBeVisible();
});

testUsuarioRecibe('TC-13 Verificar que usuario reciba la transferencia', async ({ page }) => {
    await expect(dashboardPage.dashBoardTitle).toBeVisible();
    await expect(page.getByText('Transferencia de').first()).toBeVisible();
});

// Test unificado que envía dinero por API y verifica en la UI
testUsuarioRecibe('TC-14 Verificar transferencia recibida (enviada por API)', async ({ page, request }) => {
    // #1 Preparación para lectura de datos y TOKEN del remitente

    // Leemos el archivo de datos del usuario que envía para obtener su email
    const usuarioEnviaData = require.resolve('../playwright/.auth/usuarioEnvia.data.json');
    const usuarioEnviaContenidoData = await fs.readFile(usuarioEnviaData, 'utf-8');
    const datosDeUsuarioEnvia = JSON.parse(usuarioEnviaContenidoData);
    const emailDeUsuarioEnvia = datosDeUsuarioEnvia.email;
    expect (emailDeUsuarioEnvia, 'El email del usuario que envía no se leyó correctament desde el archivo').toBeDefined();

    // Leemos el archivo de autenticación del remitente para obtener su JWT
    const usuarioEnviaAuth = require.resolve('../playwright/.auth/usuarioEnvia.json');
    const usuarioEnviaContenidoAuth = await fs.readFile(usuarioEnviaAuth, 'utf-8');
    const datosDeUsuarioEnviaAuth = JSON.parse(usuarioEnviaContenidoAuth);
    const jwtDeUsuarioEnvia = datosDeUsuarioEnviaAuth.origins[0]?.localStorage.find((item:any) => item.name === 'jwt');
    expect(jwtDeUsuarioEnvia, 'El JWT del usuario que envía no se leyó correctamente desde el archivo').toBeDefined();
    const jwt = jwtDeUsuarioEnvia.value;

    // #2 Obtener número de cuenta y enviar transferencia via API

    // Primero obtenemos el número de cuenta del remitente para saber el ID de origen
    const respuestaDeCuentas = await request.get('http://localhost:6007/api/accounts', {
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    });
    expect(respuestaDeCuentas.ok(), `La API para obtener números de cuentas falló: ${respuestaDeCuentas.status()}`).toBeTruthy();
    const cuentas = await respuestaDeCuentas.json();
    expect(cuentas.length, 'No se encontraron cuentas para el usuario').toBeGreaterThan(0);
    const idDeCuentaOrigen = cuentas[0]._id; // Tomamos el valor de ID de la primer cuenta de la lista
    const ultimosCuatroDigitos = cuentas[0].last4; // Tomamos el valor de los últimos cuatro dígitos de la cuenta

    const montoAleatorio = Math.floor(Math.random() * 100) + 1; // Monto aleatorio entre 1 y 100
    console.log(`Enviando transferencia de $${montoAleatorio} desde la cuenta ${ultimosCuatroDigitos} del email ${emailDeUsuarioEnvia} a ${testData.usuarioQueRecibeDinero.email}`)

    // Ahora con todos los datos podemos enviar la transferencia de dinero de una cuenta a la otra
    const respuestaDeTransferencia = await request.post('http://localhost:6007/api/transactions/transfer', {
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: {
            fromAccountId: idDeCuentaOrigen,
            toEmail: testData.usuarioQueRecibeDinero.email, // Destinatario fijo
            amount: montoAleatorio,
        }
    });
    expect(respuestaDeTransferencia.ok(), `La API para transferir dinero falló: ${respuestaDeTransferencia.status()}`).toBeTruthy();

    // #3 Comprobar por UI que el monto llegó correctamente al destinatario

    await page.reload(); // Recargamos la página para que se actualicen los datos y se vea la transferencia recibida
    await page.waitForLoadState('networkidle');
    await expect(dashboardPage.dashBoardTitle).toBeVisible();
    // Verificamos que se muestre el email del remitente en la transacción más reciente
    await expect(dashboardPage.elementosListaTransferencia.first()).toContainText(emailDeUsuarioEnvia);
    // Verificamos que se muestre el monto correcto
    // Usamos una expresión regular para buscar el número (ej. 5.00)
    const montoRegex = new RegExp(String(montoAleatorio.toFixed(2)));
    await expect(dashboardPage.elementosListaMontoTransferencia.first()).toContainText(montoRegex);
});