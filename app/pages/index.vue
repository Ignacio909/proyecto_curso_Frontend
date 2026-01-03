<script setup>
  definePageMeta({
    layout: 'minimal',
    auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/home' }
  })
  
  const { signIn } = useAuth()
  const { addToast } = useToast()
  const config = useRuntimeConfig()
  
  const formData = ref({
    correo: '',
    contrasena: ''
  })
  
  const isSubmitting = ref(false)
  const showPassword = ref(false)
  
  const handleLogin = async () => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    
    try {
      // 1. Pre-check: Validar credenciales directamente para obtener el mensaje de error exacto
      try {
        await $fetch(`${config.public.apiBase}/autenticacionRoutes/login`, {
          method: 'POST',
          body: { 
            correo: formData.value.correo, 
            contrasena: formData.value.contrasena 
          }
        })
      } catch (err) {
        const msg = err.data?.message || 'Credenciales inválidas'
        addToast({ title: 'Error de acceso', description: msg, type: 'error' })
        isSubmitting.value = false
        return // Detenemos el proceso si el pre-check falla
      }
  
      // 2. Si pasa el pre-check, iniciamos sesión con NuxtAuth
      const result = await signIn(
        { correo: formData.value.correo, contrasena: formData.value.contrasena },
        { redirect: false }
      )
  
      if (result?.error) {
        addToast({ title: 'Error', description: 'No se pudo iniciar sesión', type: 'error' })
      } else {
        navigateTo('/home')
      }
    } catch (err) {
      addToast({ title: 'Error', description: 'Error de conexión con el servidor', type: 'error' })
    } finally {
      isSubmitting.value = false
    }
  }
  </script>
  
  <template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        
        <div class="bg-primary p-8 text-center relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          
          <div class="inline-flex p-3 bg-white rounded-full shadow-lg mb-4 relative z-10">
            <img src="/logo WEB CAIBH.webp" alt="Logo CAIBH" class="h-16 w-16 object-contain" />
          </div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight relative z-10">Bienvenido</h1>
          <p class="text-blue-50 text-sm mt-2 opacity-90 relative z-10 font-medium">
            Accede al Sistema de Gestión Integral
          </p>
        </div>
  
        <form @submit.prevent="handleLogin" class="p-8 space-y-6">
          
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Correo Electrónico</label>
            <div class="relative group">
              <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input
                v-model="formData.correo"
                type="email"
                required
                placeholder="correo@ejemplo.com"
                class="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-gray-900"
              />
            </div>
          </div>
  
          <div class="space-y-2">
            <div class="flex justify-between items-center ml-1">
              <label class="text-sm font-bold text-gray-700 uppercase tracking-wider">Contraseña</label>
              <a href="#" class="text-xs font-bold text-primary hover:text-black transition-colors">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="relative group">
              <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                v-model="formData.contrasena"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-gray-900"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary"
              >
                <span class="text-xl">{{ showPassword ? '🙈' : '👁️' }}</span>
              </button>
            </div>
          </div>
  
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-green-1 hover:bg-green-1/90 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-1/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            <template v-if="isSubmitting">
              <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verificando...</span>
            </template>
            <template v-else>
              <span>Iniciar Sesión</span>
              <span class="text-xl">→</span>
            </template>
          </button>
        </form>
  
        <div class="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p class="text-sm text-gray-600 font-medium">
            ¿Aún no tienes una cuenta? 
            <NuxtLink to="/pacientes/add" class="text-primary font-extrabold hover:text-black transition-colors ml-1">
              Regístrate aquí
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </template>