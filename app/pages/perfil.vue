<script setup>
definePageMeta({ layout: 'default',
    auth: true }
)
// TODO: Cuando implementen el login, este composable traerá los datos reales del usuario autenticado
const { data, token } = useAuth()
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
  telefono: data.value?.paciente?.telefono || '',
  carnetIdentidad: data.value?.paciente?.carnetIdentidad || '',
  especialidad: data.value?.especialista?.especialidad || ''
})




const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { addToast } = useToast()

// Determinar qué ruta de retorno según el rol
const backRoute = computed(() => {
  if (isAdmin.value) return '/admin'
  return '/home'
})

// Manejo de imagen
const selectedImage = ref(null)
const imagePreview = ref(null)
const fileInputRef = ref(null)

// URL final para mostrar la imagen (preview o la del backend)
const displayImage = computed(() => {
  if (imagePreview.value) return imagePreview.value
  const img = data.value?.imagen
  if (!img) return null
  // Si ya viene absoluta, úsala; si es relativa, prefijar apiBase
  if (/^https?:\/\//i.test(img)) return img
  // Normalizar si viene guardada como 'public/...'
  const normalized = img.startsWith('public/') ? img.replace(/^public\//, '') : img
  return `${apiBase}${normalized.startsWith('/') ? '' : '/'}${normalized}`
})

const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedImage.value = file
    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const triggerImageUpload = () => {
  fileInputRef.value?.click()
}

const handleSave = async () => {
  try {
    // Obtener el ID correcto según el rol
    let userId = null
    if (isPaciente.value) {
      userId = data.value?.paciente?.id
    } else if (isEspecialista.value) {
      userId = data.value?.especialista?.id
    } else {
      userId = data.value?.id // Fallback para admin u otros
    }

    if (!userId) {
      addToast('Error: No se pudo obtener el ID del perfil', 'error')
      return
    }

    // Crear FormData para soportar archivos
    const uploadData = new FormData()
    uploadData.append('usuario', formData.value.usuario)
    uploadData.append('correo', formData.value.correo)

    // Agregar contraseñas solo si se proporcionaron ambas
    if (formData.value.contrasenaAnterior && formData.value.contrasenaNueva) {
      uploadData.append('contrasenaAnterior', formData.value.contrasenaAnterior)
      uploadData.append('contrasena', formData.value.contrasenaNueva)
    }

    // Agregar campos específicos por rol
    if (isPaciente.value) {
      uploadData.append('telefono', formData.value.telefono)
      uploadData.append('carnetIdentidad', formData.value.carnetIdentidad)
    } else if (isEspecialista.value) {
      uploadData.append('especialidad', formData.value.especialidad)
    }

    // Agregar imagen si se seleccionó
    if (selectedImage.value) {
      uploadData.append('imagen', selectedImage.value)
    }

    // Determinar endpoint según rol
    let endpoint = ''
    if (isPaciente.value) {
      endpoint = `${apiBase}/pacientes/${userId}`
    } else if (isEspecialista.value) {
      endpoint = `${apiBase}/especialistas/${userId}`
    } else {
      addToast('Actualización de perfil no implementada para este rol', 'error')
      return
    }

    await $fetch(endpoint, {
      method: 'PUT',
      headers: {
        Authorization: token.value
      },
      body: uploadData
    })

    addToast('Perfil actualizado exitosamente')
    
    // Limpiar imagen seleccionada
    selectedImage.value = null
    imagePreview.value = null
    
    // Recargar sesión para obtener datos actualizados
    setTimeout(() => {
      window.location.reload()
    }, 1500)
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
      <!-- Hidden file input -->
      <input 
        ref="fileInputRef"
        type="file" 
        accept="image/*" 
        @change="handleImageSelect"
        class="hidden"
      />
      
      <!-- Image preview or current image -->
      <div class="h-28 w-28 rounded-full bg-primary/20 ring-4 ring-primary/30 overflow-hidden">
        <img
          v-if="displayImage"
          :src="displayImage"
          alt="Perfil"
          class="h-full w-full object-cover"
        />
      </div>
      
      <Button 
        label="Cambiar Imagen" 
        variant="green-2"
        size="sm"
        :onClick="triggerImageUpload"
      />
      <p v-if="selectedImage" class="text-sm text-green-600">
        Imagen seleccionada: {{ selectedImage.name }}
      </p>
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
