import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashoardPage';
import testData from '../data/testData.json'
import { BackendUtils } from '../utils/backendUtils';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;

test.beforeEach(async ({ page })=> {
  loginPage = new LoginPage(page);
  dashboardPage = new DashboardPage(page);
  await loginPage.visitarPaginaLogin();
});

test('TC-7 Verificar inicio de sesión exitoso con credenciales válidas', async ({ page }) => {
  await loginPage.completarYHacerClickBotonLogin(testData.usuarioValido);
  await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible();
  await expect(dashboardPage.dashBoardTitle).toBeVisible();
});

test ('TC-11 Loguearse con un nuevo usuario creado por backend', async ({ page, request }) => {
  const nuevoUsuario = await BackendUtils.crearUsuarioPorAPI(request, testData.usuarioValido);
  const responsePromiseLogin = page.waitForResponse('http://localhost:6007/api/auth/login');
  await loginPage.completarYHacerClickBotonLogin(nuevoUsuario);
  
  const responseLogin = await responsePromiseLogin;
  const responseBodyLoginJson = await responseLogin.json();

  expect(responseLogin.status()).toBe(200);
  expect(responseBodyLoginJson).toHaveProperty('token');
  expect(typeof responseBodyLoginJson.token).toBe('string');
  expect(responseBodyLoginJson).toHaveProperty('user');
  expect(responseBodyLoginJson.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: testData.usuarioValido.nombre,
    lastName: testData.usuarioValido.apellido,
    email: nuevoUsuario.email,
  }));

  await expect(page.getByText('Inicio de sesión exitoso')).toBeVisible();
  await expect(dashboardPage.dashBoardTitle).toBeVisible();
});