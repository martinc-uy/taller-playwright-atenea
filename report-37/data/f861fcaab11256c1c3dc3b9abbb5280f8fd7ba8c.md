# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cuentas.spec.ts >> CUENTAS-01 - UI: Registrar usuario, login, creación dos cuentas, eliminación una
- Location: tests/cuentas.spec.ts:24:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('combobox', { name: 'Selecciona cuenta' })
    - locator resolved to <div tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="delete-select-label" class="MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input css-w76bbz-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input">…</div>
  - attempting click action
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - banner [ref=e4]:
        - link [ref=e5]:
          - /url: /
          - img [ref=e6]
          - heading [level=6] [ref=e8]: ATENEA BANK
        - button [ref=e9] [cursor=pointer]: Cerrar sesión
      - generic [ref=e11]:
        - heading [level=4] [ref=e12]: Tablero Principal
        - generic [ref=e13]:
          - heading [level=6] [ref=e14]: Saldo total
          - heading [level=3] [ref=e15]: $3,200.00
        - generic [ref=e16]:
          - generic [ref=e17]:
            - button [ref=e18] [cursor=pointer]: Congelar
            - heading [level=6] [ref=e21]: $3000.00
            - heading [level=6] [ref=e22]: •••• 7047
            - paragraph [ref=e23]: Débito
          - generic [ref=e24]:
            - button [ref=e25] [cursor=pointer]: Congelar
            - heading [level=6] [ref=e28]: $200.00
            - heading [level=6] [ref=e29]: •••• 8833
            - paragraph [ref=e30]: Ahorros
          - generic [ref=e31] [cursor=pointer]:
            - generic [ref=e33]: +
            - paragraph [ref=e34]: Agregar cuenta
        - generic [ref=e35]:
          - button [ref=e36] [cursor=pointer]: Eliminar
          - button [ref=e37] [cursor=pointer]: Agregar fondos
          - button [ref=e38] [cursor=pointer]: Enviar
        - generic [ref=e39]:
          - heading [level=5] [ref=e40]: Lista de transacciones
          - generic [ref=e41]:
            - heading [level=6] [ref=e42]: 30/9/2026
            - generic [ref=e43]:
              - paragraph [ref=e44]: Cuenta activada 8833
              - paragraph [ref=e45]: + 200.00
            - generic [ref=e46]:
              - paragraph [ref=e47]: Cuenta activada 7047
              - paragraph [ref=e48]: + 3000.00
    - alert [ref=e52]:
      - generic [ref=e53]:
        - img [ref=e54]
        - text: ¡Cuenta creada exitosamente!
  - dialog "Eliminar cuenta" [ref=e58]:
    - heading "Eliminar cuenta" [level=2] [ref=e59]
    - generic [ref=e61]:
      - generic: Selecciona cuenta
      - generic [ref=e62]:
        - combobox "Selecciona cuenta" [ref=e63] [cursor=pointer]
        - textbox
        - img
        - group:
          - generic: Selecciona cuenta
    - generic [ref=e64]:
      - button "Cancelar" [ref=e65] [cursor=pointer]
      - button "Eliminar" [disabled]
```

# Test source

```ts
  1  | import {Page, Locator} from '@playwright/test';
  2  | 
  3  | export class ModalEliminarCuenta {
  4  |     readonly page: Page;
  5  |     readonly seleccionarCuentaDropdown: Locator;
  6  |     readonly botonCancelar: Locator;
  7  |     readonly botonEliminar: Locator; 
  8  |     
  9  |     constructor(page: Page){
  10 |         this.page = page;
  11 |         this.seleccionarCuentaDropdown = page.getByRole('combobox', { name: 'Selecciona cuenta' });
  12 |         this.botonCancelar = page.getByRole('button', { name: 'Cancelar' });
  13 |         this.botonEliminar = page.getByRole('button', { name: 'Eliminar' });
  14 |     }
  15 | 
  16 |     async seleccionarCuentaABorrar(cuenta: string) {
> 17 |         await this.seleccionarCuentaDropdown.click();
     |                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
  18 |         await this.page.getByRole('option', { name: cuenta }).click();
  19 |     }
  20 | }
```