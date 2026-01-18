<script setup>
  useSeoMeta({
    title: 'Iniciar Sesión - Proyecto Curso',
    description: 'Accede a tu cuenta para gestionar citas y servicios médicos.',
    ogTitle: 'Iniciar Sesión - CAIBH',
    ogDescription: 'Plataforma de gestión de salud integral.',
    ogImage: '/logo WEB CAIBH.webp',
  })

  definePageMeta({
    layout: 'minimal',
    auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/home' }
  })
  
  const { signIn } = useAuth()
  const { addToast } = useToast()
  const config = useRuntimeConfig()
  const step = ref('login'); // 'login' o 'otp'
  const otpToken = ref('');
  
  const formData = ref({
    correo: '',
    contrasena: ''
  })
  
  const isSubmitting = ref(false)
  const showPassword = ref(false)
  
  const handleLogin = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    // PASO 1: Validar correo y contraseña
    const response = await $fetch(`${config.public.apiBase}/autenticacionRoutes/login`, {
      method: 'POST',
      body: { correo: formData.value.correo, contrasena: formData.value.contrasena }
    });

    // PASO 2: ¿Requiere 2FA?
    if (response.require2FA) {
      step.value = 'otp';
      isSubmitting.value = false;
      addToast({ title: 'Segundo Factor', description: 'Introduce el código de tu App', type: 'info' });
      return;
    }

    // PASO 3: Si no requiere 2FA, entrar directamente con NuxtAuth
    await signIn({ correo: formData.value.correo, contrasena: formData.value.contrasena }, { callbackUrl: '/home' });

  } catch (err) {
    const msg = err.data?.message || 'Error al iniciar sesión';
    addToast({ title: 'Error', description: msg, type: 'error' });
    isSubmitting.value = false;
  }
};

// Función para el segundo paso (Validar el código 6 dígitos)
const handleVerifyOTP = async () => {
  isSubmitting.value = true;
  try {
    // Aquí usamos signIn de NuxtAuth pero apuntando a una ruta que valide el OTP y devuelva el Token
    // O simplemente hacemos un login normal pasando el token 2FA en el body
    await signIn(
      { 
        correo: formData.value.correo, 
        contrasena: formData.value.contrasena,
        twoFactorToken: otpToken.value // Enviamos el código 
      }, 
      { callbackUrl: '/home' }
    );
  } catch (err) {
    addToast({ title: 'Error', description: 'Código incorrecto', type: 'error' });
    isSubmitting.value = false;
  }
};
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
  

  <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
    
    <form v-if="step === 'login'" @submit.prevent="handleLogin" class="p-8 space-y-6 animate-in fade-in duration-300">
      <div class="space-y-2">
        <label class="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Correo Electrónico</label>
        <div class="relative group">
          <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </span>
          <input v-model="formData.correo" type="email" required placeholder="correo@ejemplo.com" class="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-gray-900" />
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
          <input v-model="formData.contrasena" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••" class="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-gray-900" />
          <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary">
            <span class="text-xl">{{ showPassword ? '🙈' : '👁️' }}</span>
          </button>
        </div>
      </div>

      <button type="submit" :disabled="isSubmitting" class="w-full bg-green-1 hover:bg-green-1/90 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-1/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.97]">
        <template v-if="isSubmitting">
          <svg class="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>Verificando...</span>
        </template>
        <template v-else>
          <span>Iniciar Sesión</span>
          <span class="text-xl">→</span>
        </template>
      </button>
    </form>

    <form v-else @submit.prevent="handleVerifyOTP" class="p-8 space-y-6 animate-in slide-in-from-right duration-500">
      <div class="text-center space-y-2 mb-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full text-primary mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 tracking-tight">Verificación de Identidad</h3>
        <p class="text-sm text-gray-500 leading-relaxed px-4">Introduce el código de seguridad de 6 dígitos de tu aplicación de autenticación.</p>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-center block">Código OTP</label>
        <input 
          v-model="otpToken" 
          type="text" 
          maxlength="6" 
          placeholder="000000" 
          required 
          class="w-full text-center text-3xl tracking-[0.4em] font-black py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-primary outline-none transition-all text-gray-900"
        />
      </div>

      <button type="submit" :disabled="isSubmitting" class="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.97]">
        <span v-if="isSubmitting">Validando...</span>
        <span v-else>Verificar y Entrar</span>
      </button>

      <button type="button" @click="step = 'login'" class="w-full text-sm font-bold text-gray-400 hover:text-primary transition-colors">
        ← Volver al inicio de sesión
      </button>
    </form>
  </div>

  
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