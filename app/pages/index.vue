<script setup>
definePageMeta({
  layout: 'minimal'
})

const formData = ref({
  usuario: '',
  contrasena: ''
})

const handleLogin = () => {
  // TODO: Implementar lógica de autenticación cuando tengan el sistema de login
  // Por ahora solo redirige al home
  navigateTo('/home')
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

        <!-- Formulario -->
        <form @submit.prevent="handleLogin" class="p-8 space-y-6">
          <!-- Nombre Usuario -->
          <div>
            <label class="block text-center text-lg font-semibold mb-3 text-gray-700">
              Nombre Usuario:
            </label>
            <input
              v-model="formData.usuario"
              type="text"
              
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
