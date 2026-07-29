import { test, expect } from '@playwright/test';

test('TC-1 Verificación de elementos visuales de la página de registro', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.locator('input[name="firstName"]')).toBeVisible();
  await expect(page.locator('input[name="lastName"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.getByTestId('boton-registrarse')).toBeVisible();
});

test('TC-2 Verificar que el botón de registro esté deshabilitado por defecto', async ({ page }) =>{
  await page.goto('http://localhost:3000/');
  await expect(page.getByTestId('boton-registrarse')).toBeDisabled();
});

test('TC-3 Verificar que el botón de registro se habilita al completar los campos obligatorios', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Martin');
  await page.locator('input[name="lastName"]').fill('Test');
  await page.locator('input[name="email"]').fill('martintest@email.com');
  await page.locator('input[name="password"]').fill('A123456#');
  await expect(page.getByTestId('boton-registrarse')).toBeEnabled();
});

test('TC-4 Verificar redireccionamiento a página de login al hacer click en el botón de inicio de sesión', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByTestId('boton-login-header-signup').click();
  await expect(page).toHaveURL('http://localhost:3000/login')
});

test ('TC-5 Verificar registro exitoso con datos válidos', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Martin');
  await page.locator('input[name="lastName"]').fill('Test');
  await page.locator('input[name="email"]').fill('martinregistro'+Date.now().toString()+'@email.com');
  await page.locator('input[name="password"]').fill('A123456#');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Registro exitoso!')).toBeVisible();
  /* await expect(page.getByRole('alert').filter({ hasText: 'Registro exitoso!' })).toBeVisible();
      esto lo vi yo con Claude
  */
});

test('TC-6 Verificar que un usuario no pueda registrarse con un email ya existente', async ({ page }) => {
  const email = 'martinregistro'+Date.now().toString()+'@email.com';
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Martin');
  await page.locator('input[name="lastName"]').fill('Test');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('A123456#');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Registro exitoso!')).toBeVisible();
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Martin');
  await page.locator('input[name="lastName"]').fill('Test');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('A123456#');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(page.getByText('Registro exitoso!')).not.toBeVisible();
});