<script setup>
definePageMeta({ layout: 'default',
                 auth: true }
)
// TODO: Cuando implementen el login, este composable traerá los datos reales del usuario autenticado
const { data } = useAuth()
const isAdmin = computed(() => data.value?.rol === 'admin')
const isPaciente = computed(() => data.value?.rol === 'paciente')
const isEspecialista = computed(() => data.value?.rol === 'especialista')

// Formulario reactivo
const formData = ref({
  usuario: data.value?.usuario || '',
  correo: data.value?.correo || '',
  contrasenaAnterior: '',
  contrasenaNueva: '',
  // Campos específicos por rol
  telefono: data.value?.telefono || '',
  carnetIdentidad: data.value?.carnetIdentidad || '',
  especialidad: data.value?.especialidad || ''
})




const { addToast } = useToast()

// Determinar qué ruta de retorno según el rol
const backRoute = computed(() => {
  if (isAdmin.value) return '/admin'
  return '/home'
})

const handleSave = async () => {
  try {
    // TODO: Cuando tengan autenticación, aquí irá la llamada al API
    // Por ahora solo muestra un mensaje
    console.log('Datos a guardar:', formData.value)
    addToast('Perfil actualizado exitosamente')
  } catch (err) {
    console.error('Error al actualizar perfil:', err)
    addToast('Error al actualizar perfil', 'error')
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
        :to="backRoute"
        size="sm"
      />
    </div>

    <!-- Título dinámico según rol -->
    <h1 class="text-3xl font-bold text-primary text-center mb-6">
      Mi Perfil 
      <span v-if="isAdmin" class="text-2xl">(Administrador)</span>
      <span v-else-if="isPaciente" class="text-2xl">(Paciente)</span>
      <span v-else-if="isEspecialista" class="text-2xl">(Especialista)</span>
    </h1>



    <div class="flex flex-col items-center gap-3 py-6">
      <div 
        v-if="data?.imagen"
        class="h-28 w-28 rounded-full bg-primary/20 ring-4 ring-primary/30 overflow-hidden"
      >
        <img :src="data?.imagen" alt="Perfil" class="h-full w-full object-cover" />
      </div>
      <div v-else class="h-28 w-28 rounded-full bg-primary/20 ring-4 ring-primary/30" />
      <Button 
        label="Cambiar Imagen" 
        variant="green-2"
        size="sm"
      />
    </div>

    <div class="rounded-md border border-black/50 p-6">
      <form @submit.prevent="handleSave" class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Campos comunes para todos -->
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

        <!-- Campos específicos para PACIENTE -->
        <template v-if="isPaciente">
          <div>
            <label class="mb-2 block text-xl">Teléfono:</label>
            <input 
              v-model="formData.telefono"
              type="tel" 
              required
              class="w-full rounded-md border-2 border-black px-4 py-3 focus:outline-none focus:border-primary" 
            />
          </div>
          
          <div>
            <label class="mb-2 block text-xl">Carnet de Identidad:</label>
            <input 
              v-model="formData.carnetIdentidad"
              type="text" 
              required
              class="w-full rounded-md border-2 border-black px-4 py-3 focus:outline-none focus:border-primary" 
            />
          </div>
        </template>

        <!-- Campos específicos para ESPECIALISTA -->
        <template v-if="isEspecialista">
          <div class="md:col-span-2">
            <label class="mb-2 block text-xl">Especialidad:</label>
            <input 
              v-model="formData.especialidad"
              type="text" 
              required
              class="w-full rounded-md border-2 border-black px-4 py-3 focus:outline-none focus:border-primary" 
            />
          </div>
        </template>

        <!-- Admin no tiene campos adicionales -->

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
