<script setup>
definePageMeta({
  layout: 'minimal'
})

const form = reactive({
  usuario: '',
  telefono: '',
  contrasena: '',
  carnetIdentidad: '',
  correo: ''
})

const pending = ref(false)
const errorMsg = ref('')

const handleRegistro = async () => {
  const config = useRuntimeConfig()
  pending.value = true
  errorMsg.value = ''
  try {
    const fd = new FormData()
    fd.append('usuario', form.usuario)
    fd.append('contrasena', form.contrasena)
    fd.append('correo', form.correo)
    fd.append('telefono', form.telefono)
    fd.append('carnetIdentidad', form.carnetIdentidad)

    await $fetch('/pacientes', {
      baseURL: config.public.apiBase || 'http://localhost:3001',
      method: 'POST',
      body: fd,
      retry: 0,
    })
    // pequeña pausa para evitar "<no response>" en devtools al navegar
    setTimeout(() => navigateTo('/index', { replace: true }), 0)
  } catch (err) {
    const msg = (err && err.data && (err.data.message || err.data.error)) || err?.message
    errorMsg.value = msg || 'No se pudo registrar. Verifica los datos e inténtalo nuevamente.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="py-12">
    <!-- Botón de login en esquina superior izquierda -->
    <Button 
      label="Iniciar Sesión" 
      variant="green-2"
      position="top-left"
      to="/"
    />

    <section class="mx-auto w-full max-w-xl pt-8">
      <div class="rounded-t-lg bg-primary px-4 py-5 text-center text-white">
        <h1 class="text-2xl font-bold">Registrarse</h1>
      </div>

      <div class="-mt-px rounded-b-lg border border-black/50 p-6 shadow-lg bg-white">
        <form @submit.prevent="handleRegistro" class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-lg">Nombre Usuario:</label>
            <input v-model="form.usuario" required type="text" class="w-full rounded-md border-2 border-black px-3 py-2 focus:outline-none" />
          </div>
          <div>
            <label class="mb-1 block text-lg">Número de teléfono:</label>
            <input v-model="form.telefono" required type="tel" class="w-full rounded-md border-2 border-black px-3 py-2 focus:outline-none" />
          </div>

          <div>
            <label class="mb-1 block text-lg">Contraseña:</label>
            <input v-model="form.contrasena" required type="password" class="w-full rounded-md border-2 border-black px-3 py-2 focus:outline-none" />
          </div>
          <div>
            <label class="mb-1 block text-lg">Carnet de Identidad:</label>
            <input v-model="form.carnetIdentidad" required type="text" class="w-full rounded-md border-2 border-black px-3 py-2 focus:outline-none" />
          </div>

          <div class="md:col-span-2">
            <label class="mb-1 block text-lg">Correo:</label>
            <input v-model="form.correo" required type="email" class="w-full rounded-md border-2 border-black px-3 py-2 focus:outline-none" />
          </div>

          <div class="md:col-span-2 text-center text-red-600" v-if="errorMsg">
            {{ errorMsg }}
          </div>

          <div class="md:col-span-2 flex justify-center pt-2">
            <Button 
              :disabled="pending"
              type="submit"
              :label="pending ? 'Registrando…' : 'Registrarse'" 
              variant="green-1"
              size="lg"
            />
          </div>
        </form>
      </div>
    </section>
  </div>
</template>


