import { test, expect, request } from '@playwright/test';
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

test ('TC-8 Verificar registro exitoso con datos válidos verificando respuesta de la API', async ({ page }) => {
  test.step('Completar el formulario de registro con datos válidos', async() => {
    const email = (testData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (testData.usuarioValido.email.split('@')[1]);
    testData.usuarioValido.email = email;
    await registerPage.completarFormularioRegistro(testData.usuarioValido);
  });

  // Vamos a verificar que la API http://localhost:6007/api/auth/signup de tipo POST responde con un status code 201
  const responsePromise = page.waitForResponse('http://localhost:6007/api/auth/signup');
  await registerPage.hacerClickBotonRegistro();
  const response = await responsePromise;
  const responseBody = await response.json();

  expect(response.status()).toBe(201);
  expect(responseBody).toHaveProperty('token');
  expect(typeof responseBody.token).toBe('string');
  expect(responseBody).toHaveProperty('user');
  expect(responseBody.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: testData.usuarioValido.nombre,
    lastName: testData.usuarioValido.apellido,
    email: testData.usuarioValido.email,
  }));
  await expect(page.getByText('Registro exitoso!')).toBeVisible();
});

test ('TC-9 Generar signup desde la API', async ({ page, request }) => {
  const email = (testData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (testData.usuarioValido.email.split('@')[1]);
  const response = await request.post('http://localhost:6007/api/auth/signup', {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    data: {
      firstName: testData.usuarioValido.nombre,
      lastName: testData.usuarioValido.apellido,
      email: email,
      password: testData.usuarioValido.contraseña,
    }
  });
  const responseBody = await response.json();
  expect(response.status()).toBe(201);
  expect(responseBody).toHaveProperty('token');
  expect(typeof responseBody.token).toBe('string');
  expect(responseBody).toHaveProperty('user');
  expect(responseBody.user).toEqual(expect.objectContaining({
    id: expect.any(String),
    firstName: testData.usuarioValido.nombre,
    lastName: testData.usuarioValido.apellido,
    email: email,
  }));
});

test ('TC-10 Verificar comportamiento del front ante un error 409 en el registro', async ({ page }) => {
  const email = (testData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (testData.usuarioValido.email.split('@')[1]);
  testData.usuarioValido.email = email;
  // Interceptar la solicitud del registro y devolver un error 409
  await page.route('**/api/auth/signup', route => {
    route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Email already in use' }),
    });
  });

  // Llenar el formulario. La navegación se hace en el beforeEach
  await registerPage.completarYHacerClickBotonRegistro(testData.usuarioValido);
  // Verificar que se muestra un mensaje de error
    await expect(page.getByText('Email already in use')).toBeVisible();
});