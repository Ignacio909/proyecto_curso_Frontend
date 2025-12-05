<script setup>
definePageMeta({
  layout: 'minimal',
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/home' }
})

const { signIn, data, refresh } = useAuth()
const { addToast } = useToast()

const formData = ref({
  correo: '',
  contrasena: ''
})

const isSubmitting = ref(false)
const authError = ref('')

const handleLogin = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  authError.value = ''
  try {
    // 1. Pre-check: Validar credenciales directamente para obtener el mensaje de error exacto
    try {
      await $fetch(`${useRuntimeConfig().public.apiBase}/autenticacionRoutes/login`, {
        method: 'POST',
        body: { correo: formData.value.correo, contrasena: formData.value.contrasena }
      })
    } catch (err) {
      // Si falla, mostramos el mensaje exacto del backend
      if (err.data && err.data.message) {
        throw new Error(err.data.message)
      } else {
        throw err
      }
    }

    // 2. Si pasa el pre-check, iniciamos sesión con next-auth (que no debería fallar)
    const result = await signIn(
      { correo: formData.value.correo, contrasena: formData.value.contrasena },
      { redirect: false }
    )

    if (result?.error) {
      throw new Error(result.error)
    }

    await refresh()
    addToast('Inicio de sesión exitoso', 'success')
    
    const role = data.value?.rol
    if (role === 'admin') {
      await navigateTo('/admin')
    } else {
      await navigateTo('/home')
    }
  } catch (e) {
    authError.value = e.message || 'No fue posible iniciar sesión. Intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Card de Login -->
      <div class="bg-white rounded-lg shadow-xl overflow-hidden">
        <!-- Header -->
        <div class="bg-primary text-white py-6 px-8 text-center">
          <h1 class="text-3xl font-bold">Autenticarse</h1>
        </div>

        <!-- Mensaje de Error -->
        <div v-if="authError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-8 mt-6" role="alert">
          <strong class="font-bold">Error: </strong>
          <span class="block sm:inline">{{ authError }}</span>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleLogin" class="p-8 space-y-6">
          <!-- Correo -->
          <div>
            <label class="block text-center text-lg font-semibold mb-3 text-gray-700">
              Correo:
            </label>
            <input
              v-model="formData.correo"
              type="text"
              placeholder="ejemplo@correo.com"
              class="w-full px-4 py-3 border-2 border-black rounded-md text-lg focus:outline-none focus:border-primary transition"
            />
          </div>

          <!-- Contraseña -->
          <div>
            <label class="block text-center text-lg font-semibold mb-3 text-gray-700">
              Contraseña:
            </label>
            <input
              v-model="formData.contrasena"
              type="password"
              placeholder="********"
              class="w-full px-4 py-3 border-2 border-black rounded-md text-lg focus:outline-none focus:border-primary transition"
            />
          </div>

          <!-- Olvidó contraseña -->
          <div class="text-center">
            <p class="text-gray-600">
              Has olvidado la contraseña? 
              <a href="#" class="text-black font-semibold underline hover:text-primary transition">
                Clic aquí
              </a>
            </p>
          </div>

          <!-- Botón Aceptar -->
          <div class="flex justify-center">
            <button
              type="submit"
              class="bg-green-1 hover:bg-green-2 text-white px-12 py-3 rounded-md text-xl font-semibold transition shadow-md hover:shadow-lg flex items-center gap-3"
            >
              Aceptar
              <span class="text-2xl">→</span>
            </button>
          </div>
        </form>

        <!-- Footer del card -->
        <div class="text-center pb-6 px-8">
          <p class="text-gray-600">
            No tienes cuenta? 
            <NuxtLink to="/registrar" class="text-black font-semibold underline hover:text-primary transition">
              Registrarse
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
