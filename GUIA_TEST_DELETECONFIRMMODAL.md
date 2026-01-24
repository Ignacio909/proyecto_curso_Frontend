# Guía Paso a Paso: Test de DeleteConfirmModal

## 📚 Conceptos Clave

### Patrón AAA
Cada test sigue esta estructura:

```typescript
it('descripción del test', async () => {
  // 1. ARRANGE (Preparar): Crear datos de prueba
  const mockData = { ... }
  
  // 2. ACT (Actuar): Montar componente o disparar evento
  const component = await mountSuspended(...)
  
  // 3. ASSERT (Verificar): Comprobar resultado
  expect(component.text()).toContain('...')
})
```

---

## 🧪 Tests Implementados

### Test 1: Renderizado Condicional
**¿Qué probamos?** Que el modal solo aparece cuando `isOpen=true`

**Concepto importante:** `v-if` = el elemento NO existe en el DOM si es false

```typescript
// Con isOpen=false → No existe en el DOM
expect(component.html()).toBe('<!--v-if-->')

// Con isOpen=true → Aparece el contenido
expect(component.text()).toContain('Confirmar Eliminación')
```

---

### Test 2: Propiedad Computada
**¿Qué probamos?** Que muestra el nombre correcto del especialista

**Estrategia:** Diferentes ENTRADAS (props) → Verificar SALIDA (HTML)

```typescript
const mockSpecialist = {
  persona: { usuario: 'Dr. Martínez' }
}
// Debe aparecer en el mensaje de confirmación
expect(component.text()).toContain('Dr. Martínez')
```

---

### Test 3: Fallback de Datos
**¿Qué probamos?** Que maneja correctamente cuando NO hay nombre

```typescript
const mockSpecialist = { id: '789' } // Sin nombre
expect(component.text()).toContain('este registro')
```

---

### Test 4: Evento "close"
**¿Qué probamos?** Que el botón "Cancelar" emite el evento correcto

**Concepto:** Componentes se comunican mediante eventos emisores (`emit`)

```typescript
await cancelButton.trigger('click')
expect(component.emitted('close')).toBeTruthy()
```

---

### Test 5: Evento "confirm" con Datos
**¿Qué probamos?** Que "Eliminar" emite el evento CON los datos del especialista

**Diferencia con Test 4:** Este evento lleva PAYLOAD (datos)

```typescript
await deleteButton.trigger('click')
expect(component.emitted('confirm')[0][0]).toEqual(mockSpecialist)
//                                  ↑    ↑
//                Primera emisión ──┘    └── Primer argumento
```

---

### Test 6: Click en Backdrop
**¿Qué probamos?** Que hacer click FUERA del modal lo cierra

**Concepto:** `@click.self` = solo si haces click directamente en ese elemento

```typescript
const backdrop = component.find('.fixed.inset-0')
await backdrop.trigger('click.self')
expect(component.emitted('close')).toBeTruthy()
```

---

### Test 7: Mensaje de Advertencia
**¿Qué probamos?** Que SIEMPRE aparece el warning

**Importancia:** Crítico para UX - prevenir eliminaciones accidentales

```typescript
expect(component.text()).toContain('Esta acción no se puede deshacer')
```

---

## 🎯 Lecciones Aprendidas

1. **Renderizado Condicional:** `v-if` → `html()` devuelve `<!--v-if-->` cuando es false
2. **Eventos:** Usar `component.emitted('eventName')` para verificar
3. **Datos en Eventos:** Acceder con `emitted('event')[0][0]`
4. **Buscar Elementos:** `find()` para uno, `findAll()` para múltiples
5. **Cambiar Props:** `await component.setProps({ ... })`
6. **Disparar Eventos:** `await element.trigger('click')`

---

## 🔧 Correcciones de TypeScript

Para evitar advertencias del IDE, aplicamos las siguientes correcciones:

### 1. Non-null Assertions (`!`)
```typescript
// En elementos del DOM que sabemos que existen
const cancelButton = buttons[0]!

// En eventos que sabemos que fueron emitidos
expect(component.emitted('confirm')![0][0]).toEqual(mockSpecialist)
```

### 2. Import con Ruta Relativa
```typescript
// TypeScript no siempre reconoce el alias ~
import DeleteConfirmModal from '../../app/components/DeleteConfirmModal.vue'
```

---

## ✅ Cómo Ejecutar

```bash
npm run test
# o para ejecutar solo este archivo:
npx vitest tests/components/DeleteConfirmModal.spec.ts
```

---

## 📖 Próximos Pasos

Con estos conceptos dominados, puedes probar componentes más complejos como:
- **FormModal.vue:** Testing de formularios con v-model
- **DataTable.vue:** Testing de listas con v-for
