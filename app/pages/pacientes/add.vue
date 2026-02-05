<script setup>
  definePageMeta({
    layout: 'minimal',
    auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/home' }
  })
  
  useSeoMeta({
    title: 'Registro de Pacientes - CAIBH',
    description: 'Crea tu cuenta para acceder a servicios médicos en línea.',
    ogTitle: 'Regístrate en CAIBH',
    ogDescription: 'Únete a nuestra plataforma de salud digital.',
  })
  
  const form = reactive({
    usuario: '',
    telefono: '', // Aquí guardaremos solo los 8 dígitos
    contrasena: '',
    carnetIdentidad: '',
    correo: ''
  })
  
  const pending = ref(false)
  const showPassword = ref(false)
  const { addToast } = useToast()
  
  // --- VALIDACIONES ---
  const validateForm = () => {
    // 1. Validar Teléfono Cuba (8 dígitos después del +53)
    if (!/^\d{8}$/.test(form.telefono)) {
      addToast({ title: 'Error', description: 'El teléfono debe tener 8 dígitos', type: 'error' })
      return false
    }
  
    // 2. Validar Carnet (11 dígitos exactos)
    if (!/^\d{11}$/.test(form.carnetIdentidad)) {
      addToast({ title: 'Error', description: 'El CI debe tener 11 dígitos exactos', type: 'error' })
      return false
    }
  
    // 3. Validar Contraseña Segura (Letras, números y símbolos)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/
    if (!passwordRegex.test(form.contrasena)) {
      addToast({ 
        title: 'Contraseña Débil', 
        description: 'Debe tener min. 8 caracteres, letras, números y un símbolo (@$!%*#?&)', 
        type: 'error' 
      })
      return false
    }
  
    return true
  }
  
  const handleRegistro = async () => {
    if (!validateForm()) return
    
    const config = useRuntimeConfig()
    pending.value = true
    
    try {
      await $fetch('/pacientes', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: {
          usuario: form.usuario,
          contrasena: form.contrasena,
          correo: form.correo,
          // Enviamos el teléfono con el prefijo incluido al servidor
          telefono: `+53${form.telefono}`,
          carnetIdentidad: form.carnetIdentidad
        }
      })
      
      addToast({ title: '¡Éxito!', description: 'Cuenta creada. Ya puedes iniciar sesión.', type: 'success' })
      setTimeout(() => navigateTo('/'), 1500)
    } catch (err) {
      addToast({ title: 'Error', description: err.data?.message || 'Error en el registro', type: 'error' })
    } finally {
      pending.value = false
    }
  }

  const handleNumberInput = (e, field, limit) => {
  const value = e.target.value.replace(/\D/g, '') // Elimina todo lo que no sea número
  form[field] = value.slice(0, limit) // Limita la cantidad de caracteres
}
  </script>
  
  <template>
    
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">

      <Button 
      label="Volver al inicio" 
      to="/" 
      variant="green-1" 
      position="top-left"
    >
      <template #icon>
        <span aria-hidden="true">←</span>
      </template>
    </Button>

      <div class="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        <div class="bg-primary p-6 text-center">
          <h1 class="text-2xl font-extrabold text-white">Crea tu Cuenta</h1>
          <p class="text-blue-50 text-sm">Registro exclusivo para pacientes del CAIBH</p>
        </div>
  
        <form @submit.prevent="handleRegistro" class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="space-y-2">
              <label for="usuario" class="text-xs font-bold text-gray-700 uppercase">Usuario</label>
              <input id="usuario" v-model="form.usuario" required type="text" class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-all" />
            </div>
  
            <div class="space-y-2">
              <label for="telefono" class="text-xs font-bold text-gray-700 uppercase">Teléfono (+53)</label>
              <div class="relative">
                <span aria-hidden="true" class="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold border-r-2 border-gray-200 pr-2">
                  +53
                </span>
                <input 
                  id="telefono"
                  v-model="form.telefono" 
                  required 
                  type="tel" 
                  inputmode="numeric"
                  placeholder="5XXXXXXX"
                  @input="handleNumberInput($event, 'telefono', 8)"
                  class="w-full pl-16 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-all" 
                />
              </div>
            </div>
  
            <div class="space-y-2">
              <label for="ci" class="text-xs font-bold text-gray-700 uppercase">Cédula (11 dígitos)</label>
              <input 
                id="ci"
                v-model="form.carnetIdentidad" 
                required 
                type="text" 
                inputmode="numeric"
                placeholder="Ej. 95010123456"
                @input="handleNumberInput($event, 'carnetIdentidad', 11)"
                class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-all" 
              />
            </div>
  
            <div class="space-y-2">
              <label for="correo" class="text-xs font-bold text-gray-700 uppercase">Correo</label>
              <input id="correo" v-model="form.correo" required type="email" class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-all" />
            </div>
  
            <div class="md:col-span-2 space-y-2">
              <label for="contrasena" class="text-xs font-bold text-gray-700 uppercase">Contraseña Segura</label>
              <div class="relative">
                <input
                  id="contrasena" 
                  v-model="form.contrasena" 
                  :type="showPassword ? 'text' : 'password'" 
                  required 
                  class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-all" 
                />
                <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-4 text-xl">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <p class="text-[10px] text-gray-500 italic">Debe incluir al menos un número y un símbolo.</p>
            </div>
          </div>
  
          <div class="mt-8">
            <Button 
              type="submit"
              :disabled="pending"
              label="Registrarme"
              variant="green-1"
              class="!w-full !py-4 !rounded-xl !text-lg !font-bold"
            />
          </div>
        </form>
      </div>
    </div>
  </template>