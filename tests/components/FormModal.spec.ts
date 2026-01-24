import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FormModal from '../../app/components/FormModal.vue'

/**
 * ====================================================================
 * PRUEBA UNITARIA: FormModal.vue
 * ====================================================================
 * 
 * NUEVOS CONCEPTOS:
 * 1. Testing de Formularios: Simular escritura en inputs (`setValue`)
 * 2. Testing de Submit: Simular envío de formulario (`trigger('submit')`)
 * 3. Testing de Ciclo de Vida: Verificar carga inicial de datos (`watch`)
 */

describe('FormModal.vue', () => {
    // Configuración común de campos para los tests
    const mockFields = [
        { key: 'nombre', label: 'Nombre', type: 'text', required: true },
        { key: 'edad', label: 'Edad', type: 'number', required: false }
    ]

    /**
     * TEST 1: Renderizado de campos
     * OBJETIVO: Verificar que se crean los inputs correctos según la prop `fields`
     */
    it('renderiza los campos definidos en la prop fields', async () => {
        const component = await mountSuspended(FormModal, {
            props: {
                isOpen: true,
                title: 'Nuevo Usuario',
                fields: mockFields
            }
        })

        // Verificar que hay 2 inputs (nombre y edad)
        const inputs = component.findAll('input')
        expect(inputs).toHaveLength(2)

        // Verificar etiquetas
        expect(component.text()).toContain('Nombre:')
        expect(component.text()).toContain('Edad:')
    })

    /**
     * TEST 2: Carga de datos iniciales (Edición)
     * OBJETIVO: Verificar que el formulario se llena si pasamos `initialData`
     */
    it('carga los datos iniciales al abrirse', async () => {
        const mockData = {
            nombre: 'Juan Perez',
            edad: 30
        }

        const component = await mountSuspended(FormModal, {
            props: {
                isOpen: true,
                title: 'Editar Usuario',
                fields: mockFields,
                initialData: mockData
            }
        })

        // Verificar que los inputs tienen los valores
        const inputs = component.findAll('input')

        // Input nombre (índice 0)
        expect(inputs[0]!.element.value).toBe('Juan Perez')

        // Input edad (índice 1)
        expect(inputs[1]!.element.value).toBe('30')
    })

    /**
     * TEST 3: Interacción y Submit
     * OBJETIVO: Simular que el usuario escribe y guarda
     * CLAVE: Usamos `setValue` para escribir en los inputs
     */
    it('emite evento "submit" con los datos del formulario', async () => {
        const component = await mountSuspended(FormModal, {
            props: {
                isOpen: true,
                title: 'Nuevo Usuario',
                fields: mockFields
            }
        })

        // 1. Buscar inputs
        const inputs = component.findAll('input')
        const inputNombre = inputs[0]!
        const inputEdad = inputs[1]!

        // 2. Simular escritura del usuario
        await inputNombre.setValue('Maria Gomez')
        await inputEdad.setValue('25')

        // 3. Simular envío del formulario
        const form = component.find('form')
        await form.trigger('submit')

        // 4. Verificar emisión
        expect(component.emitted('submit')).toBeTruthy()

        // Verificar payload (datos enviados)
        const submittedData = component.emitted('submit')![0]![0]
        expect(submittedData).toEqual({
            nombre: 'Maria Gomez',
            edad: '25' // Nota: los inputs HTML siempre devuelven strings por defecto
        })
    })

    /**
     * TEST 4: Limpieza de formulario
     * OBJETIVO: Verificar que al abrirse sin datos, el formulario está vacío
     * (incluso si antes tenía datos, al reabrirse debe limpiarse)
     */
    it('inicia con formulario vacío si no hay initialData', async () => {
        const component = await mountSuspended(FormModal, {
            props: {
                isOpen: true,
                title: 'Crear',
                fields: mockFields
            }
        })

        const inputs = component.findAll('input')
        expect(inputs[0]!.element.value).toBe('')
        expect(inputs[1]!.element.value).toBe('')
    })
})
