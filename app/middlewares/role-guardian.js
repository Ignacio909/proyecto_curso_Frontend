// middleware/role-guard.js
export default defineNuxtRouteMiddleware((to, from) => {
    // Obtenemos la sesión desde Nuxt Auth
    const { data, status } = useAuth()

    // 1. Si no está autenticado, redirigir al login
    // (Aunque Nuxt Auth suele manejar esto, es mejor ser explícitos)
    if (status.value !== 'authenticated') {
        return navigateTo('/')
    }

    // 2. Leer los roles permitidos desde la página
    const allowedRoles = to.meta.roles || []

    // 3. Si la página no tiene definidos roles, permitimos el paso
    if (allowedRoles.length === 0) return

    // 4. Verificar el rol del usuario
    // Accedemos a data.value.rol (el campo que configuramos en tu backend)
    const userRole = data.value?.rol

    if (!allowedRoles.includes(userRole)) {
        console.warn(`Acceso denegado para el rol: ${userRole} a la ruta: ${to.path}`)
        return navigateTo('/home') // Redirigir a una página segura
    }
})