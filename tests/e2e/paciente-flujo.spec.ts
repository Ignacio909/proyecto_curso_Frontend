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
        email: 'pedrorey@gmail.com', // ¡Asegúrate que este usuario tenga rol 'paciente'!
        password: 'pedro.03'
    };

    test('Paciente puede iniciar sesión...', async ({ page }) => {
        // --- AGREGAR ESTO AL INICIO DEL TEST ---
        // 1. Escuchar errores de consola del navegador
        page.on('console', msg => {
            if (msg.type() === 'error') console.log(`🔴 BROWSER ERROR: "${msg.text()}"`);
            else console.log(`⚪ BROWSER LOG: "${msg.text()}"`);
        });
    
        // 2. Escuchar peticiones de red fallidas (API caída, 404, 500)
        page.on('requestfailed', request => {
            console.log(`❌ RED FALLIDA: ${request.url()} - ${request.failure()?.errorText}`);
        });
        // ---------------------------------------
    
        console.log('PASO 1: Iniciando sesión...');
        await page.goto('/');
        // ESPERA CRÍTICA: Espera a que la red esté inactiva (Nuxt terminó de cargar sus módulos)
        await page.waitForLoadState('networkidle');

        // Opcional: Esperar a que un elemento específico de Vue sea visible
        await expect(page.locator('form')).toBeVisible();

    await page.getByPlaceholder('correo@ejemplo.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
    
    // Clic en botón "Iniciar Sesión"
    const loginPromise = page.waitForResponse(
        res => res.url().includes('/autenticacionRoutes/login'), 
        { timeout: 20000 } // Aumentamos a 20s para modo dev
    ).catch(() => null);
    
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    const response = await loginPromise;

if (response) {
    console.log(`📡 API Status: ${response.status()}`);
    if (response.status() !== 200) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`FALLO API: El servidor respondió con ${response.status()}. Mensaje: ${JSON.stringify(errorData)}`);
    }
} else {
    throw new Error('FALLO RED: La petición al backend nunca salió o se quedó colgada.');
}
    // --- SOLUCIÓN DE DEBUG ROBUSTA ---
    
    // Esperamos a que ocurra ALGUNA de estas 3 cosas:
    // 1. Redirección exitosa (URL cambia)
    // 2. Aparece el input de OTP (Caso 2FA)
    // 3. Aparece un mensaje de error (Credenciales malas)
    
    // --- VALIDACIÓN DE REDIRECCIÓN ---
    console.log('Esperando redirección al Dashboard...');
    
    try {
        // Esperamos explícitamente a que la URL cambie a /home
        // Aumentamos el timeout a 15 segundos porque Nuxt Auth puede ser lento en modo dev
        await page.waitForURL('**/home', { timeout: 15000, waitUntil: 'networkidle' });
        console.log('✓ Login exitoso y redirección confirmada.');
    } catch (e) {
        // Si falla por timeout, investigamos qué hay en pantalla antes de morir
        const currentURL = page.url();
        console.log(`❌ Error: No se llegó a /home. URL actual: ${currentURL}`);
        
        // Verificamos si es que apareció el campo de OTP (2FA)
        if (await page.getByPlaceholder('000000').isVisible()) {
            throw new Error('FALLO: El usuario tiene 2FA activado. Desactívalo en la BD para este test.');
        }
        
        // Verificamos si hay algún mensaje de error visible en el body
        const bodyText = await page.innerText('body');
        if (bodyText.includes('incorrecto') || bodyText.includes('Error')) {
            throw new Error('FALLO: Credenciales rechazadas aunque la API devolvió 200.');
        }

        throw new Error(`FALLO DESCONOCIDO: La URL se quedó en ${currentURL}. Revisa si el componente index.vue realmente llama a signIn().`);
    }

    // Validación final de contenido
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Contenido del Dashboard cargado');
    // =============================================================================
    // 2. NAVEGACIÓN A AGENDAR CITA
    // =============================================================================
    console.log('PASO 2: Navegando a agendar cita...');
    
    // Hacemos clic en la tarjeta del Dashboard que lleva a agendar
    // En home.vue, la tarjeta tiene el título 'Agendar Cita'
    await page.getByRole('link', { name: /Agendar Cita/i }).filter({ hasText: 'Reserva una' }).click();
    
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