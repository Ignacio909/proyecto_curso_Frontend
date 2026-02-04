import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DeleteConfirmModal from '../../app/components/DeleteConfirmModal.vue'

describe('DeleteConfirmModal.vue', () => {
    
    /**
     * TEST 1: Renderizado condicional (v-if)
     */
    it('se muestra solo cuando isOpen es true', async () => {
        const mockItem = { id: 1, name: 'Test' }

        // 1. Montamos con isOpen: false
        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: false,
                item: mockItem
            }
        })

        // VERIFICACIÓN ROBUSTA:
        // Buscamos el div principal (la clase 'fixed' del backdrop)
        // y esperamos que NO exista.
        expect(component.find('.fixed').exists()).toBe(false)
        
        // (Opcional) Si quieres mantener la verificación de HTML exacto:
        // expect(component.html()).toBe('')

        // 2. Cambiamos a true
        await component.setProps({ isOpen: true })
        
        // Ahora SÍ debe existir
        expect(component.find('.fixed').exists()).toBe(true)
        expect(component.text()).toContain('Confirmar Eliminación')
    })

    // TEST 2: Visualización de Props (Nombre y Tipo)
    // NOTA: Ya no probamos si "calcula" el nombre, sino si MUESTRA lo que le enviamos.
    it('muestra el itemType y itemName correctamente', async () => {
        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: true,
                item: { id: 1 },
                itemType: 'paciente',    // <--- Probamos que renderice el tipo
                itemName: 'Juan Perez'   // <--- Probamos que renderice el nombre
            }
        })

        // El texto debería ser: "¿Está seguro que desea eliminar paciente Juan Perez?"
        expect(component.text()).toContain('paciente')
        expect(component.text()).toContain('Juan Perez')
    })

    // TEST 3: Fallback (Valores por defecto)
    it('usa valores por defecto si no se pasan nombres', async () => {
        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: true,
                item: { id: 1 }
                // No pasamos itemType ni itemName
            }
        })

        // El default de itemType es 'este elemento'
        expect(component.text()).toContain('este elemento')
    })

    // TEST 4: Evento Close
    it('emite evento "close" al cancelar', async () => {
        const component = await mountSuspended(DeleteConfirmModal, {
            props: { isOpen: true, item: {} }
        })

        const buttons = component.findAll('button')
        const cancelButton = buttons[0] // El primero es cancelar
        
        await cancelButton.trigger('click')
        
        expect(component.emitted('close')).toBeTruthy()
    })

    // TEST 5: Evento Confirm (CRÍTICO: Que devuelva el item correcto)
    it('emite evento "confirm" devolviendo el item recibido', async () => {
        // ARRANGE: Preparamos un objeto complejo
        const mockItemComplejo = { 
            id: 999, 
            datos: { clave: 'valor' }, 
            rol: 'admin' 
        }

        const component = await mountSuspended(DeleteConfirmModal, {
            props: {
                isOpen: true,
                item: mockItemComplejo // Le pasamos el objeto
            }
        })

        // ACT: Click en eliminar
        const buttons = component.findAll('button')
        const deleteButton = buttons[1] // El segundo es eliminar
        
        await deleteButton.trigger('click')

        // ASSERT
        // 1. Se emitió
        expect(component.emitted('confirm')).toBeTruthy()
        // 2. Lo que devolvió es EXACTAMENTE el objeto que le pasamos
        expect(component.emitted('confirm')![0][0]).toEqual(mockItemComplejo)
    })

    // TEST 6: Backdrop
    it('emite evento "close" al hacer click en el fondo', async () => {
        const component = await mountSuspended(DeleteConfirmModal, {
            props: { isOpen: true }
        })

        const backdrop = component.find('.fixed.inset-0')
        await backdrop.trigger('click.self')

        expect(component.emitted('close')).toBeTruthy()
    })
})