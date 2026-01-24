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

## Ejemplos de Tests

### Button.vue
El archivo `tests/components/Button.spec.ts` prueba:
- Que el texto (label) se renderice correctamente.
- Que se apliquen las clases de estilo según la prop `variant`.
- Que se ejecute la función `onClick` cuando se hace clic.

### DeleteConfirmModal.vue
El archivo `tests/components/DeleteConfirmModal.spec.ts` es un ejemplo más completo que cubre:
- **Renderizado condicional**: Verifica que el modal solo aparece cuando `isOpen=true`
- **Propiedades computadas**: Comprueba que muestra el nombre correcto del especialista
- **Eventos simples**: Verifica que emite `close` al hacer click en "Cancelar"
- **Eventos con datos**: Verifica que emite `confirm` con los datos del especialista
- **Interacción con backdrop**: Prueba que hacer click fuera del modal lo cierra

### FormModal.vue
El archivo `tests/components/FormModal.spec.ts` introduce testing de formularios:
- **Inputs**: Simula escritura con `setValue()`
- **Submit**: Simula envío con `trigger('submit')`
- **Carga de Datos**: Verifica que `initialData` rellena los campos correctamente

**Ver guía detallada:** `GUIA_TEST_DELETECONFIRMMODAL.md` para una explicación paso a paso.
