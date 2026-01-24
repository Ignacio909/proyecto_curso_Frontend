# Pruebas Unitarias en Nuxt (Frontend)

Este proyecto utiliza **Vitest**, **@nuxt/test-utils** y **Happy-DOM** para realizar pruebas unitarias enfocadas en componentes ("Caja Negra").

## Estrategia "Caja Negra"

Nos enfocamos en probar:
1.  **Entrada (Input)**: Props que recibe el componente.
2.  **Salida (Output)**: HTML renderizado, clases CSS aplicadas y eventos emitidos.

No probamos la implementación interna, solo el comportamiento observable.

## Estructura de Archivos

Las pruebas se encuentran en el directorio `tests/`:
- `tests/components/`: Pruebas para componentes `.vue`.

## Cómo ejecutar las pruebas

Para correr todas las pruebas:

```bash
npm run test
# o
npx vitest
```

## Ejemplo: Button.vue

El archivo `tests/components/Button.spec.ts` prueba:
- Que el texto (label) se renderice correctamente.
- Que se apliquen las clases de estilo según la prop `variant`.
- Que se ejecute la función `onClick` cuando se hace clic.

## Patrón AAA

Cada prueba sigue el patrón:
1.  **Arrange (Preparar)**: Configurar props y mocks.
2.  **Act (Actuar)**: Montar el componente (`mountSuspended`) o disparar eventos (`trigger`).
3.  **Assert (Verificar)**: Comprobar el resultado (`expect`).
