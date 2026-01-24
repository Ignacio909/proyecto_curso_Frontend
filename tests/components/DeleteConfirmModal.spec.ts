import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DeleteConfirmModal from '../../app/components/DeleteConfirmModal.vue'

/**
 * ====================================================================
 * PRUEBA UNITARIA: DeleteConfirmModal.vue
 * ====================================================================
 * 
 * ESTRATEGIA "CAJA NEGRA":
 * - No importa cómo está escrito internamente el código
 * - Solo probamos: ENTRADA (Props) → SALIDA (HTML/Eventos)
 * 
 * PATRÓN AAA:
 * - ARRANGE (Preparar): Crear datos de prueba (mocks)
 * - ACT (Actuar): Montar el componente o disparar eventos
 * - ASSERT (Verificar): Comprobar que el resultado es el esperado
 */

describe('DeleteConfirmModal.vue', () => {
    /**
     * ====================================================================
     * TEST 1: Renderizado condicional (v-if)
     * ====================================================================
     * 
     * OBJETIVO: Verificar que el modal se muestra/oculta según la prop `isOpen`
     * 
     * CONCEPTO: En Vue, `v-if` remueve el elemento del DOM completamente.
     *           Si `isOpen=false`, el modal NO debe existir en el HTML.
     */
    it('se muestra solo cuando isOpen es true', async () => {
        // ========== ARRANGE (Preparar) ==========
        // Creamos datos falsos para simular un especialista
        const mockSpecialist = {
            id: '123',
            persona: {
                usuario: 'Dr. García'
            }
        }

        // ========== ACT (Actuar) ==========
        // Montamos el componente con isOpen=false
        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: false,
                specialist: mockSpecialist
            }
        })

        // ========== ASSERT (Verificar) ==========
        // El modal NO debe estar visible en el HTML
        expect(component.html()).toBe('<!--v-if-->')

        // Ahora cambiamos isOpen a true
        await component.setProps({ isOpen: true })

        // Ahora SÍ debe aparecer el texto "Confirmar Eliminación"
        expect(component.text()).toContain('Confirmar Eliminación')
    })

    /**
     * ====================================================================
     * TEST 2: Propiedad computada (displayName)
     * ====================================================================
     * 
     * OBJETIVO: Verificar que el componente muestra el nombre correcto
     * 
     * LÓGICA INTERNA (que NO probamos directamente, pero verificamos su OUTPUT):
     * - Si existe `specialist.persona.usuario` → usa ese nombre
     * - Si no, usa `specialist.usuario`
     * - Si no, usa "este registro"
     * 
     * ESTRATEGIA: Probamos diferentes ENTRADAS (props) y verificamos la SALIDA (HTML)
     */
    it('muestra el nombre del especialista correctamente', async () => {
        // ========== ARRANGE ==========
        const mockSpecialist = {
            id: '456',
            persona: {
                usuario: 'Dr. Martínez'
            }
        }

        // ========== ACT ==========
        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: true,
                specialist: mockSpecialist,
                itemType: 'especialista'
            }
        })

        // ========== ASSERT ==========
        // Debe aparecer el nombre del doctor en el mensaje
        expect(component.text()).toContain('Dr. Martínez')
        expect(component.text()).toContain('especialista')
    })

    /**
     * ====================================================================
     * TEST 3: Caso especial - Sin datos de usuario
     * ====================================================================
     * 
     * OBJETIVO: Verificar el fallback cuando no hay nombre disponible
     */
    it('muestra "este registro" cuando no hay nombre disponible', async () => {
        // ========== ARRANGE ==========
        // Objeto sin nombre
        const mockSpecialist = {
            id: '789'
        }

        // ========== ACT ==========
        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: true,
                specialist: mockSpecialist
            }
        })

        // ========== ASSERT ==========
        expect(component.text()).toContain('este registro')
    })

    /**
     * ====================================================================
     * TEST 4: Evento "close"
     * ====================================================================
     * 
     * OBJETIVO: Verificar que el botón "Cancelar" emite el evento correcto
     * 
     * CONCEPTO: Los componentes en Vue se comunican mediante eventos.
     *           Cuando haces click en "Cancelar", el componente debe
     *           emitir el evento 'close' para que el padre lo cierre.
     */
    it('emite evento "close" cuando se hace click en Cancelar', async () => {
        // ========== ARRANGE ==========
        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: true,
                specialist: { id: '1' }
            }
        })

        // ========== ACT ==========
        // Buscamos el botón "Cancelar" y hacemos click
        // findAll devuelve un array, el primer botón es "Cancelar"
        const buttons = component.findAll('button')
        const cancelButton = buttons[0]!
        await cancelButton.trigger('click')

        // ========== ASSERT ==========
        // Verificamos que se emitió el evento 'close'
        expect(component.emitted('close')).toBeTruthy()
        // Verificamos que se emitió exactamente 1 vez
        expect(component.emitted('close')!).toHaveLength(1)
    })

    /**
     * ====================================================================
     * TEST 5: Evento "confirm" con datos
     * ====================================================================
     * 
     * OBJETIVO: Verificar que el botón "Eliminar" emite el evento correcto
     *           CON los datos del especialista
     * 
     * CONCEPTO: A diferencia de 'close', el evento 'confirm' debe enviar
     *           el objeto del especialista para que el padre sepa QUÉ eliminar.
     */
    it('emite evento "confirm" con datos del especialista cuando se hace click en Eliminar', async () => {
        // ========== ARRANGE ==========
        const mockSpecialist = {
            id: '999',
            persona: {
                usuario: 'Dr. López'
            }
        }

        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: true,
                specialist: mockSpecialist
            }
        })

        // ========== ACT ==========
        // El segundo botón es "Eliminar"
        const buttons = component.findAll('button')
        const deleteButton = buttons[1]!
        await deleteButton.trigger('click')

        // ========== ASSERT ==========
        // Verificamos que se emitió el evento 'confirm'
        expect(component.emitted('confirm')).toBeTruthy()

        // Verificamos que el evento incluye los datos del especialista
        // emitted('confirm')[0] = primera emisión del evento
        // emitted('confirm')[0][0] = primer argumento de esa emisión
        expect(component.emitted('confirm')![0]![0]).toEqual(mockSpecialist)
    })

    /**
     * ====================================================================
     * TEST 6: Click en el backdrop (fondo oscuro)
     * ====================================================================
     * 
     * OBJETIVO: Verificar que hacer click FUERA del modal lo cierra
     * 
     * CONCEPTO: El div con `@click.self` solo reacciona si haces click
     *           directamente en él, NO en sus hijos.
     */
    it('emite evento "close" cuando se hace click en el backdrop', async () => {
        // ========== ARRANGE ==========
        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: true,
                specialist: { id: '1' }
            }
        })

        // ========== ACT ==========
        // El div padre con clase "fixed inset-0" es el backdrop
        const backdrop = component.find('.fixed.inset-0')
        // Usamos trigger con .self para simular el modificador @click.self
        await backdrop.trigger('click.self')

        // ========== ASSERT ==========
        expect(component.emitted('close')).toBeTruthy()
    })

    /**
     * ====================================================================
     * TEST 7: Mensaje de advertencia permanente
     * ====================================================================
     * 
     * OBJETIVO: Verificar que siempre aparece el mensaje de advertencia
     * 
     * IMPORTANCIA: Este texto es crítico para UX - debe estar SIEMPRE presente
     */
    it('muestra el mensaje de advertencia sobre acción irreversible', async () => {
        // ========== ARRANGE + ACT ==========
        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: true,
                specialist: { id: '1' }
            }
        })

        // ========== ASSERT ==========
        expect(component.text()).toContain('Esta acción no se puede deshacer')
    })
})
