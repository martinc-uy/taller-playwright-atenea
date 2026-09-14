import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/registerPage';
import testData from '../data/testData.json';

let registerPage: RegisterPage;

test.beforeEach(async ({ page }) => {
  registerPage = new RegisterPage(page);
  await registerPage.visitarPaginaRegistro();
});

test('TC-1 Verificación de elementos visuales de la página de registro', async ({ page }) => {
  await expect(registerPage.firstNameInput).toBeVisible();
  await expect(registerPage.lastNameInput).toBeVisible();
  await expect(registerPage.emailInput).toBeVisible();
  await expect(registerPage.passwordInput).toBeVisible();
  await expect(registerPage.loginButton).toBeVisible();
});

test('TC-2 Verificar que el botón de registro esté deshabilitado por defecto', async ({ page }) =>{
  await expect(registerPage.registerButton).toBeDisabled();
});

test('TC-3 Verificar que el botón de registro se habilita al completar los campos obligatorios', async ({ page }) => {
  await registerPage.completarFormularioRegistro(testData.usuarioValido);
  await expect(registerPage.registerButton).toBeEnabled();
});

test('TC-4 Verificar redireccionamiento a página de login al hacer click en el botón de inicio de sesión', async ({ page }) => {
  await registerPage.hacerClickBotonLogin();
  await expect(page).toHaveURL('http://localhost:3000/login')
});

test ('TC-5 Verificar registro exitoso con datos válidos', async ({ page }) => {
  test.step('Completar el formulario de registro con datos válidos', async() => {
  const email = (testData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (testData.usuarioValido.email.split('@')[1]);
  testData.usuarioValido.email = email;
  await registerPage.completarYHacerClickBotonRegistro(testData.usuarioValido);
  });
  await expect(page.getByText('Registro exitoso!')).toBeVisible();
  /* await expect(page.getByRole('alert').filter({ hasText: 'Registro exitoso!' })).toBeVisible();
      esto lo vi yo con Claude
  */
});

test('TC-6 Verificar que un usuario no pueda registrarse con un email ya existente', async ({ page }) => {
  const email = (testData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (testData.usuarioValido.email.split('@')[1]);
  testData.usuarioValido.email = email;
  await registerPage.completarYHacerClickBotonRegistro(testData.usuarioValido);
  await expect(page.getByText('Registro exitoso!')).toBeVisible();
  await registerPage.visitarPaginaRegistro();
  await registerPage.completarYHacerClickBotonRegistro(testData.usuarioValido);
  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(page.getByText('Registro exitoso!')).not.toBeVisible();
});