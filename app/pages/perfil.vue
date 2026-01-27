<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})

useSeoMeta({
  title: 'Mi Perfil - CAIBH',
  description: 'Gestiona tu información personal, contraseña y seguridad de la cuenta.',
})

const { data, token, signOut } = useAuth()
const { addToast } = useToast()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Roles
const isAdmin = computed(() => data.value?.rol === 'admin')
const isPaciente = computed(() => data.value?.rol === 'paciente')
const isEspecialista = computed(() => data.value?.rol === 'especialista')

// Ruta de retorno
const backRoute = computed(() => isAdmin.value ? '/admin' : '/home')

// Formulario
const formData = ref({
  usuario: data.value?.usuario || '',
  correo: data.value?.correo || '',
  contrasenaAnterior: '',
  contrasenaNueva: '',
  telefono: data.value?.paciente?.telefono || '',
  carnetIdentidad: data.value?.paciente?.carnetIdentidad || '',
  especialidad: data.value?.especialista?.especialidad || ''
})

// Imagen
const selectedImage = ref(null)
const imagePreview = ref(null)
const fileInputRef = ref(null)

const displayImage = computed(() => {
  if (imagePreview.value) return imagePreview.value
  const img = data.value?.imagen
  if (!img) return null
  if (/^https?:\/\//i.test(img)) return img
  const normalized = img.startsWith('public/') ? img.replace(/^public\//, '') : img
  return `${apiBase}${normalized.startsWith('/') ? '' : '/'}${normalized}`
})

const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedImage.value = file
    const reader = new FileReader()
    reader.onload = (e) => imagePreview.value = e.target.result
    reader.readAsDataURL(file)
  }
}

const triggerImageUpload = () => fileInputRef.value?.click()

// 2FA Logic
const qrCodeUrl = ref(null)
const tfaStep = ref('initial') // initial, scanning, active
const tfaToken = ref('')
const is2FAEnabled = ref(false)

// Inicializar estado 2FA
onMounted(() => {
  if (data.value?.twoFactorEnabled) {
    is2FAEnabled.value = true
    tfaStep.value = 'active'
  }
})

const setup2FA = async () => {
  try {
    const response = await $fetch(`${apiBase}/autenticacionRoutes/2fa/generate`, {
      method: 'POST',
      headers: { Authorization: token.value }
    })
    qrCodeUrl.value = response.qrCodeUrl
    tfaStep.value = 'scanning'
  } catch (e) {
    addToast('Error al generar QR', 'error')
  }
}

const confirm2FA = async () => {
  try {
    await $fetch(`${apiBase}/autenticacionRoutes/2fa/verify`, {
      method: 'POST',
      body: { token: tfaToken.value },
      headers: { Authorization: token.value }
    })
    addToast('2FA activado correctamente', 'success')
    is2FAEnabled.value = true
    tfaStep.value = 'active'
    tfaToken.value = ''
    // Actualizar sesión localmente si es posible o forzar recarga
    setTimeout(() => window.location.reload(), 1000)
  } catch (e) {
    addToast('Código incorrecto', 'error')
  }
}
  
const showDisableModal = ref(false)

  // 1. Esta función solo abre el modal (reemplaza a la que tenías antes en el botón)
const requestDisable2FA = () => {
    showDisableModal.value = true
}

const confirmDisable2FA = async () => {
  showDisableModal.value = false // Cerramos modal
  
  try {
    await $fetch(`${apiBase}/autenticacionRoutes/2fa/disable`, {
      method: 'POST',
      headers: { Authorization: token.value }
    })
    addToast('2FA desactivado correctamente', 'success')
    is2FAEnabled.value = false
    tfaStep.value = 'initial'
    // Recarga suave
    setTimeout(() => window.location.reload(), 1000)
  } catch (e) {
    addToast('Error al desactivar 2FA', 'error')
  }
}

// Guardar Perfil
const handleSave = async () => {
  try {
    let userId = null
    if (isPaciente.value) userId = data.value?.paciente?.id
    else if (isEspecialista.value) userId = data.value?.especialista?.id
    else userId = data.value?.id

    if (!userId) {
      addToast('Error de identificación de usuario', 'error')
      return
    }

    const uploadData = new FormData()
    uploadData.append('usuario', formData.value.usuario)
    uploadData.append('correo', formData.value.correo)

    if (formData.value.contrasenaAnterior && formData.value.contrasenaNueva) {
      uploadData.append('contrasenaAnterior', formData.value.contrasenaAnterior)
      uploadData.append('contrasena', formData.value.contrasenaNueva)
    }

    if (isPaciente.value) {
      uploadData.append('telefono', formData.value.telefono)
      uploadData.append('carnetIdentidad', formData.value.carnetIdentidad)
    } else if (isEspecialista.value) {
      uploadData.append('especialidad', formData.value.especialidad)
    }

    if (selectedImage.value) {
      uploadData.append('imagen', selectedImage.value)
    }

    let endpoint = ''
    if (isPaciente.value) endpoint = `${apiBase}/pacientes/${userId}`
    else if (isEspecialista.value) endpoint = `${apiBase}/especialistas/${userId}`
    else {
      addToast('Rol no soportado para edición completa', 'warning')
      return
    }

    await $fetch(endpoint, {
      method: 'PUT',
      headers: { Authorization: token.value },
      body: uploadData
    })

    addToast('Perfil actualizado exitosamente')
    selectedImage.value = null
    imagePreview.value = null
    setTimeout(() => window.location.reload(), 1500)
  } catch (err) {
    console.error(err)
    addToast('Error al actualizar perfil', 'error')
  }
}
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <Button 
        label="← Volver" 
        variant="ghost" 
        :to="backRoute"
        class="!text-gray-600 hover:!text-primary hover:!bg-gray-100"
      />
      <h1 class="text-3xl font-bold text-gray-800">Configuración de Cuenta</h1>
      <div class="w-24"></div> <!-- Spacer for centering -->
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Columna Izquierda: Tarjeta de Perfil -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border border-gray-100">
          <div class="relative group cursor-pointer" @click="triggerImageUpload">
            <div class="h-40 w-40 rounded-full ring-4 ring-primary/20 overflow-hidden shadow-md transition-transform group-hover:scale-105">
              <img
                v-if="displayImage"
                :src="displayImage"
                alt="Perfil"
                class="h-full w-full object-cover"
              />
              <div v-else class="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- Overlay de cambio -->
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-white font-medium text-sm">Cambiar Foto</span>
              </div>
            </div>
            <input ref="fileInputRef" type="file" accept="image/*" @change="handleImageSelect" class="hidden" />
          </div>

          <h2 class="mt-4 text-2xl font-bold text-gray-800">{{ formData.usuario }}</h2>
          <p class="text-primary font-medium capitalize">{{ data?.rol }}</p>
          
          <div v-if="selectedImage" class="mt-4 w-full">
            <p class="text-xs text-center text-green-600 mb-2">Nueva imagen seleccionada</p>
          </div>
        </div>

        <!-- Tarjeta de Seguridad (2FA) -->
        <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span class="text-2xl">🛡️</span> Seguridad
          </h3>

          <!-- Estado Inicial (Sin 2FA) -->
          <div v-if="!is2FAEnabled && tfaStep === 'initial'" class="text-center">
            <p class="text-gray-600 mb-6 text-sm">Protege tu cuenta añadiendo una capa extra de seguridad.</p>
            <Button label="Activar 2FA" @click="setup2FA" variant="primary" class="w-full" />
          </div>

          <!-- Escaneo QR -->
          <div v-if="tfaStep === 'scanning'" class="flex flex-col items-center animate-fade-in">
            <p class="text-sm text-gray-600 mb-4 text-center">Escanea con Google Authenticator</p>
            <img :src="qrCodeUrl" alt="QR" class="w-40 h-40 rounded-lg border-2 border-gray-200 mb-4" />
            <input 
              v-model="tfaToken" 
              type="text" 
              placeholder="000 000" 
              maxlength="6"
              class="w-full text-center text-xl tracking-widest font-bold border-2 border-gray-200 rounded-lg py-2 focus:border-primary focus:outline-none mb-3"
            />
            <Button label="Verificar" @click="confirm2FA" variant="green-1" class="w-full mb-2" />
            <button @click="tfaStep = 'initial'" class="text-xs text-gray-500 hover:underline">Cancelar</button>
          </div>

          <!-- Activo -->
          <div v-if="is2FAEnabled" class="text-center animate-fade-in">
            <div class="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              2FA Activado
            </div>
            <Button label="Desactivar 2FA" @click="requestDisable2FA" variant="red" size="sm" class="w-full opacity-80 hover:opacity-100" />
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Formulario de Datos -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 h-full">
          <h3 class="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Información Personal</h3>
          
          <form @submit.prevent="handleSave" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nombre -->
              <div class="space-y-2">
                <label for="usuario" class="text-sm font-semibold text-gray-700">Nombre de Usuario</label>
                <input 
                  id="usuario"
                  v-model="formData.usuario"
                  type="text" 
                  required
                  class="w-full px-4 py-3 rounded-lg border ..."
                />
              </div>

              <!-- Correo -->
              <div class="space-y-2">
                <label for="correo" class="text-sm font-semibold text-gray-700">Correo Electrónico</label>
                <input 
                  id="correo"
                  v-model="formData.correo"
                  type="email" 
                  required
                  class="w-full px-4 py-3 rounded-lg border ..."
                />
              </div>

              <!-- Campos Paciente -->
              <template v-if="isPaciente">
                <div class="space-y-2">
                  <label for="telefono" class="text-sm font-semibold text-gray-700">Teléfono</label>
                  <input 
                    id="telefono"
                    v-model="formData.telefono"
                    type="tel" 
                    required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                <div class="space-y-2">
                  <label for="ci" class="text-sm font-semibold text-gray-700">Carnet de Identidad</label>
                  <input 
                    id="ci"
                    v-model="formData.carnetIdentidad"
                    type="text" 
                    required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </template>

              <!-- Campos Especialista -->
              <template v-if="isEspecialista">
                <div for="especialidad" class="md:col-span-2 space-y-2">
                  <label class="text-sm font-semibold text-gray-700">Especialidad</label>
                  <input 
                    id="especialidad"
                    v-model="formData.especialidad"
                    type="text" 
                    required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </template>
            </div>

            <div class="pt-6 mt-6 border-t border-gray-100">
              <h4 class="text-lg font-semibold text-gray-800 mb-4">Cambiar Contraseña</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label for="contrasenaAnterior"class="text-sm font-semibold text-gray-700">Contraseña Actual</label>
                  <input 
                    id="contrasenaAnterior"
                    v-model="formData.contrasenaAnterior"
                    type="password" 
                    placeholder="••••••••"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                <div class="space-y-2">
                  <label for="contrasenaNueva" class="text-sm font-semibold text-gray-700">Nueva Contraseña</label>
                  <input 
                    id="contrasenaNueva"
                    v-model="formData.contrasenaNueva"
                    type="password" 
                    placeholder="••••••••"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-6">
              <Button 
                label="Guardar Cambios" 
                variant="green-1" 
                size="lg" 
                type="submit"
                class="px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
    <div 
      v-if="showDisableModal" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 id="modal-title" class="text-2xl font-bold mb-4 text-red-700">Desactivar Seguridad</h2>
        
        <p class="text-lg mb-4 text-gray-800">
          ¿Estás seguro de que quieres desactivar la autenticación de dos factores?
        </p>
        
        <p class="text-sm text-gray-600 mb-6 bg-yellow-50 p-3 rounded border border-yellow-200">
          ⚠️ Tu cuenta será menos segura y solo dependerá de tu contraseña para acceder.
        </p>
  
        <div class="flex gap-4 justify-end">
          <button
            @click="showDisableModal = false"
            class="rounded-md bg-gray-200 px-6 py-2 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            @click="confirmDisable2FA"
            class="rounded-md bg-red-600 px-6 py-2 text-white font-medium hover:bg-red-700 transition shadow-lg"
          >
            Sí, Desactivar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
