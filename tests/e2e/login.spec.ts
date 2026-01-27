import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {

    test('should login successfully with valid credentials', async ({ page }) => {
        // 1. Navegar a la página de login
        await page.goto('/');

        // 2. Llenar el formulario
        // Usamos selectores robustos (placeholder en este caso, o name si existiera)
        await page.fill('input[type="email"]', 'paciente@ejemplo.com');
        await page.fill('input[type="password"]', 'password123');

        // 3. Hacer clic en el botón de login
        await page.click('button[type="submit"]');

        // 4. Verificar redirección
        // Esperamos que la URL cambie a /home
        await expect(page).toHaveURL(/\/home/);

        // Opcional: Verificar que aparece algún elemento del dashboard
        // await expect(page.locator('h1')).toContainText('Bienvenido');
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/');

        await page.fill('input[type="email"]', 'wrong@email.com');
        await page.fill('input[type="password"]', 'wrongpass');
        await page.click('button[type="submit"]');

        // Verificar que aparece el toast de error
        // Nota: Esto depende de cómo se renderiza el toast en tu app. 
        // Si usas una librería, busca el selector adecuado.
        // Aquí asumimos que aparece un texto "Error" o "Credenciales inválidas"
        await expect(page.locator('body')).toContainText('Error');
    });

});
