<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})

// Datos de sesión
const { data: currentUser } = useAuth()
const isAdmin = computed(() => currentUser.value?.rol === 'admin')

// Formulario reactivo
const formData = ref({
  usuario: currentUser.value?.usuario || '',
  correo: currentUser.value?.correo || '',
  contrasenaAnterior: '',
  contrasenaNueva: ''
})

const notification = ref({ show: false, message: '', type: '' })

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Mostrar imagen de perfil
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const displayImage = computed(() => {
  const img = currentUser.value?.imagen
  if (!img) return null
  if (/^https?:\/\//i.test(img)) return img
  const normalized = img.startsWith('public/') ? img.replace(/^public\//, '') : img
  return `${apiBase}${normalized.startsWith('/') ? '' : '/'}${normalized}`
})

const handleSave = async () => {
  try {
    // TODO: Cuando tengan autenticación, aquí irá la llamada al API
    // Por ahora solo muestra un mensaje
    console.log('Datos a guardar:', formData.value)
    showNotification('Perfil actualizado exitosamente')
  } catch (err) {
    console.error('Error al actualizar perfil:', err)
    showNotification('Error al actualizar perfil', 'error')
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-5xl">
    <!-- Botón Volver -->
    <div class="mb-4">
      <Button 
        label="Volver" 
        variant="green-2"
        to="/admin"
        size="sm"
      />
    </div>

    <!-- Título -->
    <h1 class="text-3xl font-bold text-primary text-center mb-6">
      Mi Perfil (Administrador)
    </h1>

    <!-- Notificación -->
    <div 
      v-if="notification.show" 
      :class="[
        'mb-4 rounded-md p-4 text-white',
        notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
      ]"
    >
      {{ notification.message }}
    </div>

    <div class="flex flex-col items-center gap-3 py-6">
      <div 
        class="h-28 w-28 rounded-full bg-primary/20 ring-4 ring-primary/30 overflow-hidden"
      >
        <img v-if="displayImage" :src="displayImage" alt="Perfil" class="h-full w-full object-cover" />
      </div>
      <Button 
        label="Cambiar Imagen" 
        variant="green-2"
        size="sm"
      />
    </div>

    <div class="rounded-md border border-black/50 p-6">
      <form @submit.prevent="handleSave" class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Solo campos básicos para admin -->
        <div>
          <label class="mb-2 block text-xl">Nombre Usuario:</label>
          <input 
            v-model="formData.usuario"
            type="text" 
            required
            class="w-full rounded-md border-2 border-black px-4 py-3 focus:outline-none focus:border-primary" 
          />
        </div>
        
        <div>
          <label class="mb-2 block text-xl">Correo:</label>
          <input 
            v-model="formData.correo"
            type="email" 
            required
            class="w-full rounded-md border-2 border-black px-4 py-3 focus:outline-none focus:border-primary" 
          />
        </div>

        <div>
          <label class="mb-2 block text-xl">Contraseña Anterior:</label>
          <input 
            v-model="formData.contrasenaAnterior"
            type="password" 
            placeholder="Dejar vacío para no cambiar"
            class="w-full rounded-md border-2 border-black px-4 py-3 focus:outline-none focus:border-primary" 
          />
        </div>
        
        <div>
          <label class="mb-2 block text-xl">Contraseña Nueva:</label>
          <input 
            v-model="formData.contrasenaNueva"
            type="password" 
            placeholder="Dejar vacío para no cambiar"
            class="w-full rounded-md border-2 border-black px-4 py-3 focus:outline-none focus:border-primary" 
          />
        </div>

        <div class="md:col-span-2 flex justify-center pt-2">
          <Button 
            label="Guardar Cambios" 
            variant="green-1"
            size="lg"
            type="submit"
          />
        </div>
      </form>
    </div>
  </section>
</template>
