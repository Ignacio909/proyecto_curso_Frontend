<script setup>
definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Inicio - Panel de Control',
  description: 'Acceso rápido a tus citas, perfil y servicios médicos.',
})

const { data } = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const role = computed(() => data.value?.rol)
const displayName = computed(() => data.value?.usuario || 'Usuario')
const displayImage = computed(() => {
  const img = data.value?.imagen
  if (!img) return null
  if (/^https?:\/\//i.test(img)) return img
  return `${apiBase}${img.startsWith('/') ? '' : '/'}${img}`
})

const roleCards = {
  paciente: [
    { title: 'Mi Perfil', to: '/perfil', description: 'Gestiona tu información personal' },
    { title: 'Agendar Cita', to: '/citas/add', description: 'Reserva una nueva cita médica' },
    { title: 'Mis Citas', to: '/citas/mis-citas', description: 'Consulta tu historial de citas' },
    { title: 'Sobre Nosotros', to: '/sobre-nosotros', description: 'Conoce más sobre CAIBH' }
  ],
  especialista: [
    { title: 'Mi Perfil', to: '/perfil', description: 'Gestiona tu información profesional' },
    { title: 'Gestionar Citas', to: '/citas/gestion', description: 'Administra las citas programadas' },
    { title: 'Citas del Día', to: '/citas/hoy', description: 'Revisa tu agenda para hoy' },
    { title: 'Historias Clínicas', to: '/historias-clinicas', description: 'Accede a los expedientes médicos' },
    { title: 'Pacientes', to: '/pacientes', description: 'Directorio de pacientes' }
  ],
  admin: [
    { title: 'Gestionar Pacientes', to: '/pacientes', description: 'Administración de usuarios pacientes' },
    { title: 'Gestionar Especialistas', to: '/especialistas', description: 'Administración de personal médico' },
    { title: 'Gestionar Citas', to: '/citas/gestion', description: 'Supervisión de citas del sistema' },
    { title: 'Mi Perfil', to: '/perfil', description: 'Configuración de cuenta' }
  ]
}

const currentCards = computed(() => {
  const userRole = role.value
  return roleCards[userRole] || []
})
</script>

<template>
  <section class="flex flex-col items-center gap-8 w-full max-w-7xl mx-auto px-4">
    <div class="flex flex-col items-center gap-3 mt-8 mb-4">
      <div class="h-32 w-32 rounded-full bg-primary/10 ring-4 ring-primary/30 overflow-hidden shadow-lg">
        <img v-if="displayImage" :src="displayImage" alt="Avatar" class="h-full w-full object-cover" />
        <div v-else class="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      <h2 class="text-3xl font-bold text-gray-800">Hola, <span class="text-primary">{{ displayName }}</span></h2>
      <p class="text-gray-500 text-lg capitalize" v-if="role">{{ role }}</p>
    </div>

    <div class="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
      <DashboardCard
        v-for="(card, index) in currentCards"
        :key="index"
        :to="card.to"
        :title="card.title"
        :description="card.description"
      />
    </div>
  </section>
</template>


