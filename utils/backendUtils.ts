import { APIRequestContext, expect } from '@playwright/test';

export class BackendUtils {

  static async crearUsuarioPorAPI(request: APIRequestContext, usuario: any, esNuevo: boolean = true) {
    let email: string;

    if (esNuevo) {
      email = (usuario.email.split('@')[0]) + Date.now().toString() + '@' + usuario.email.split('@')[1];
    } else {
      email = usuario.email;
    }

    const response = await request.post('http://localhost:6007/api/auth/signup', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      data: {
        firstName: usuario.nombre,
        lastName: usuario.apellido,
        email: email,
        password: usuario.contraseña,
      }
    });
    if (esNuevo) {
      expect(response.status()).toBe(201);
    } else {
      expect([201, 409]).toContain(response.status());
    }
    return { email: email, contraseña: usuario.contraseña, usuarioCreado: response.status() === 201 };
  }

  static async crearCuentaPorAPI(request: APIRequestContext, jwt: string, tipoDeCuenta: string, montoInicial: string) {
    const response = await request.post('http://localhost:6007/api/accounts', {
      headers: {
        'Authorization': `Bearer ${jwt}`
      },
      data: {
        type: tipoDeCuenta,
        initialAmount: montoInicial,
      }
    });
    expect(response.status()).toBe(201);
  }

  static async eliminarCuentaPorAPI(request: APIRequestContext, idCuenta: string, jwt: string) {
    const response = await request.delete(`http://localhost:6007/api/accounts/${idCuenta}`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      },
    });
    expect(response.status()).toBe(200);
  }
}