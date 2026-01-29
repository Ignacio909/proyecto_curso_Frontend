import { test, expect } from '@playwright/test';

// Función auxiliar para obtener el próximo día laborable (Lunes-Viernes)
// Esto es necesario porque 'add.vue' valida "validateWeekday"
const getNextWeekday = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Empezamos buscando desde mañana
    
    // Mientras sea Domingo (0) o Sábado (6), sumar un día
    while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
    }
    return date.toISOString().split('T')[0];
};

test.describe('Flujo Crítico: Paciente', () => {
    
    // Datos de prueba (Reemplázalos con un usuario real de tu base de datos o variables de entorno)
    const TEST_USER = {
        email: 'paciente@test.com', // ¡Asegúrate que este usuario tenga rol 'paciente'!
        password: 'password123'
    };

    test('Paciente puede iniciar sesión, agendar cita y cerrar sesión', async ({ page }) => {
        
    // =============================================================================
    // 1. LOGIN
    // =============================================================================
    console.log('PASO 1: Iniciando sesión...');
    await page.goto('/');

    // Llenar formulario de login basado en index.vue
    await page.getByPlaceholder('correo@ejemplo.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
    
    // Clic en botón "Iniciar Sesión"
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // Validación: Esperar redirección a Home
    await expect(page).toHaveURL('/home');
    await expect(page.locator('h2')).toContainText('Hola,'); // Validamos el saludo del home.vue
    console.log('✓ Login exitoso');

    // =============================================================================
    // 2. NAVEGACIÓN A AGENDAR CITA
    // =============================================================================
    console.log('PASO 2: Navegando a agendar cita...');
    
    // Hacemos clic en la tarjeta del Dashboard que lleva a agendar
    // En home.vue, la tarjeta tiene el título 'Agendar Cita'
    await page.getByText('Agendar Cita', { exact: true }).click();
    
    await expect(page).toHaveURL('/citas/add');
    console.log('✓ Página de agendar cargada');

    // =============================================================================
    // 3. LLENADO DEL FORMULARIO DE CITA
    // =============================================================================
    console.log('PASO 3: Completando formulario...');

    // A. Seleccionar Especialista
    // Buscamos el primer select. En add.vue es el de especialistas.
    // Seleccionamos la opción con índice 1 (la primera opción real después del placeholder)
    const especialistaSelect = page.locator('select').first();
    await especialistaSelect.selectOption({ index: 1 });

    // B. Seleccionar Fecha (Lunes a Viernes)
    const fechaValida = getNextWeekday();
    await page.locator('input[type="date"]').fill(fechaValida);
    console.log(`  - Fecha seleccionada: ${fechaValida}`);

    // C. Seleccionar Hora
    // En add.vue, el select de hora está deshabilitado hasta que carga la API
    const horaSelect = page.locator('select').nth(1); // El segundo select
    
    // Esperamos a que se habilite (señal de que la API respondió)
    await expect(horaSelect).not.toBeDisabled({ timeout: 10000 });
    
    // Seleccionamos la primera hora disponible
    await horaSelect.selectOption({ index: 1 });

    // D. Enviar Formulario
    await page.getByRole('button', { name: 'Agendar' }).click();

    // =============================================================================
    // 4. VERIFICACIÓN DE ÉXITO
    // =============================================================================
    console.log('PASO 4: Verificando confirmación...');
    
    // add.vue redirige a '/citas/mis-citas' después de 2000ms
    await expect(page).toHaveURL('/citas/mis-citas', { timeout: 10000 });
    console.log('✓ Cita agendada y redirección exitosa');

    // =============================================================================
    // 5. CIERRE DE SESIÓN
    // =============================================================================
    console.log('PASO 5: Cerrando sesión...');
    
    // El botón está en el Navbar.vue
    await page.getByRole('button', { name: 'Cerrar Sesión' }).click();
    
    // Validamos que regresamos al login (index.vue)
    await expect(page).toHaveURL('/');
    // Validamos que el formulario de login es visible nuevamente
    await expect(page.getByPlaceholder('correo@ejemplo.com')).toBeVisible();
    
    console.log('✓ Ciclo completo finalizado correctamente');
    });
});