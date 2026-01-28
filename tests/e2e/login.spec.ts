import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    // NOTE: These tests require a test user to exist in the database:
    // Email: paciente@ejemplo.com
    // Password: password123
    // This user should NOT have 2FA enabled for the success test to work correctly.

    test('should login successfully with valid credentials', async ({ page }) => {
        // 1. Navegar a la página de login
        await page.goto('/');

        // 2. Llenar el formulario
        // Usamos selectores robustos (placeholder en este caso, o name si existiera)
        await page.fill('input[type="email"]', 'daniel@gmail.com');
        await page.fill('input[type="password"]', 'daniel.03');

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

        // Wait for the API request to complete (regardless of success/failure)
        const responsePromise = page.waitForResponse(response =>
            response.url().includes('/autenticacionRoutes/login')
        );

        await page.click('button[type="submit"]');

        // Wait for the error response
        await responsePromise;

        // Wait for the toast to appear and verify it contains error styling
        // ToastContainer renders error toasts with bg-red-600 class
        const errorToast = page.locator('.bg-red-600');
        await expect(errorToast).toBeVisible({ timeout: 5000 });
    });

});
