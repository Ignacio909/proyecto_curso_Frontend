<script setup>
const { data, status, signOut } = useAuth()
watch(data, (newData) => {
  console.log("Datos recibidos en el Frontend:", newData)
}, { immediate: true })
const role = computed(() => data.value?.rol)
const onSignOut = async () => { 
  try { 
    await signOut({ callbackUrl: '/' })
    // Limpiar cualquier dato en localStorage
    localStorage.clear()
    sessionStorage.clear()
    // Forzar recarga para asegurar que se limpie todo
    window.location.href = '/'
  } catch (e) {
    console.error('Error al cerrar sesión:', e)
    // Aún así intentar limpiar y redirigir
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  } 
}
</script>

<template>
  <header class="bg-primary text-white w-full">
    <nav class="w-full flex items-center justify-between px-4 py-4 md:px-8">
      
      <div class="flex items-center gap-3 flex-shrink-0">
        <img 
          src="/logo WEB CAIBH.webp" 
          alt="Logo CAIBH" 
          class="h-12 w-12 object-contain bg-white rounded-full p-1"
        />
        <NuxtLink to="/home" class="text-base font-semibold hidden lg:block">
          Centro Atencion Integral para el Bienestar Humano
        </NuxtLink>
        <NuxtLink to="/home" class="text-base font-semibold lg:hidden">
          CAIBH
        </NuxtLink>
      </div>

      <div class="flex-1 flex justify-center px-4">
        <ul v-if="role === 'paciente'" class="flex items-center gap-4 xl:gap-8 text-lg whitespace-nowrap">
          <li><NuxtLink to="/perfil" class="hover:text-black transition-colors">Mi Perfil</NuxtLink></li>
          <li><NuxtLink to="/citas/mis-citas" class="hover:text-black transition-colors">Mis Citas</NuxtLink></li>
          <li><NuxtLink to="/citas/add" class="hover:text-black transition-colors">Agendar Cita</NuxtLink></li>
          <li><NuxtLink to="/sobre-nosotros" class="hover:text-black transition-colors">Sobre Nosotros</NuxtLink></li>
        </ul>

        <ul v-else-if="role === 'especialista'" class="flex items-center gap-4 xl:gap-6 text-lg whitespace-nowrap">
          <li><NuxtLink to="/perfil" class="hover:text-black transition-colors">Mi Perfil</NuxtLink></li>
          <li><NuxtLink to="/citas/gestion" class="hover:text-black transition-colors">Citas</NuxtLink></li>
          <li><NuxtLink to="/citas/hoy" class="hover:text-black transition-colors">Citas del Día</NuxtLink></li>
          <li><NuxtLink to="/historias-clinicas" class="hover:text-black transition-colors">Historias Clínicas</NuxtLink></li>
          <li><NuxtLink to="/pacientes" class="hover:text-black transition-colors">Pacientes</NuxtLink></li>
        </ul>

        <ul v-else-if="role === 'admin'" class="flex items-center gap-8 text-lg whitespace-nowrap">
          <li><NuxtLink to="/pacientes" class="hover:text-black transition-colors">Pacientes</NuxtLink></li>
          <li><NuxtLink to="/especialistas" class="hover:text-black transition-colors">Especialistas</NuxtLink></li>
          <li><NuxtLink to="/citas" class="hover:text-black transition-colors">Citas</NuxtLink></li>
          <li><NuxtLink to="/perfil" class="hover:text-black transition-colors">Mi Perfil</NuxtLink></li>
        </ul>
      </div>

      <div class="flex-shrink-0 flex items-center justify-end">
        <Button 
          v-if="data?.rol"
          label="Cerrar Sesión" 
          variant="green-1" 
          size="sm"
          class="!rounded-full !shadow-sm !text-white transition-all active:scale-95"
          @click="onSignOut"
        />
      </div>

    </nav>
  </header>
</template>