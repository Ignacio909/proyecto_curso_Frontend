// middleware/solo-especialista.ts
// middleware/solo-especialista.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { data, status } = useAuth()

  // Si el estado es "loading", no hacemos nada y esperamos
  if (status.value === 'loading') return

  // Si no está autenticado, sidebase-auth ya lo mandará al login, 
  // así que aquí solo retornamos.
  if (status.value !== 'authenticated' || !data.value) {
    return
  }

  // Verificamos el rol
  if (data.value.rol !== 'especialista') {
    console.warn("Acceso denegado: No es especialista")
    return navigateTo('/') // Redirigir a donde prefieras
  }
})