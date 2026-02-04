<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})

const { data: currentUser, token } = useAuth()

useSeoMeta({
  title: 'Mis Citas - Historial',
  description: 'Consulta tu historial de citas y próximos turnos.',
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const pacienteId = computed(() => currentUser.value?.paciente?.id)
const { data: allCitas, pending, error, refresh } = await useFetch(
  () => pacienteId.value ? `${apiBase}/citas/paciente/${pacienteId.value}` : null,
  {
    immediate: !!pacienteId.value,
    watch: [pacienteId],
    headers: {
      Authorization: token.value || ''
    }
  }
)

const activeFilter = ref('recientes')
const { addToast } = useToast()

const userCitas = computed(() => allCitas.value || [])

// Lógica de filtrado (mantenida según tu original)
const filteredCitas = computed(() => {
  const today = new Date()
  const oneWeekFromNow = new Date(today)
  oneWeekFromNow.setDate(today.getDate() + 7)
  
  switch (activeFilter.value) {
    case 'recientes':
      return userCitas.value.filter(cita => {
        const citaDate = new Date(cita.fecha)
        return citaDate >= today && citaDate <= oneWeekFromNow
      })
    case 'pendientes':
      return userCitas.value.filter(cita => cita.estado === 'pendiente')
    case 'completadas':
      return userCitas.value.filter(cita => cita.estado === 'completada')
    case 'canceladas':
      return userCitas.value.filter(cita => cita.estado === 'cancelada')
    default:
      return userCitas.value
  }
})

// CÓDIGO CORREGIDO (SOLUCIÓN)
const formatDate = (dateString) => {
  if (!dateString) return ''
  // 1. Dividimos el string "2026-02-05" manualmente
  const [year, month, day] = dateString.split('-').map(Number)
  
  // 2. Creamos la fecha usando el constructor local (año, mes-1, dia)
  // Nota: En JS los meses van de 0 a 11, por eso restamos 1 al mes
  const localDate = new Date(year, month - 1, day)
  
  return localDate.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  })
}

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

// Clases dinámicas para los estados
const getStatusClasses = (estado) => {
  switch (estado.toLowerCase()) {
    // Usamos tonos 800 para el texto para asegurar contraste AA (4.5:1)
    case 'pendiente': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'completada': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'cancelada': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const handleDelete = async (citaId) => {
  if (!confirm('¿Está seguro que desea eliminar esta cita?')) return
  try {
    await $fetch(`${apiBase}/citas/${citaId}`, {
      method: 'DELETE',
      headers: { Authorization: token.value || '' }
    })
    await refresh()
    addToast('Cita eliminada exitosamente')
  } catch (err) {
    addToast('Error al eliminar la cita', 'error')
  }
}

const handleReschedule = (cita) => navigateTo('/citas/add')
</script>

<template>
  <section class="mx-auto w-full max-w-6xl px-4 py-8">
    <header class="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Mi Historial Médico</h1>
        <p class="text-gray-600">Gestiona tus próximas consultas y revisa tu actividad.</p>
      </div>
      <div class="flex gap-3">
        <Button label="Volver" variant="green-1" to="/home" size="sm" />
        <Button label="Nueva Cita +" variant="green-1" to="/citas/add" size="md" />
      </div>
    </header>

    <nav class="mb-10 flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl w-fit mx-auto" aria-label="Filtros de citas">
      <button
        v-for="filter in ['recientes', 'pendientes', 'completadas', 'canceladas']"
        :key="filter"
        @click="activeFilter = filter"
        :aria-current="activeFilter === filter ? 'page' : undefined"
        :class="[
          'px-5 py-2 rounded-lg font-medium capitalize transition-all duration-200',
          activeFilter === filter 
            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
        ]"
      >
        {{ filter }}
      </button>
    </nav>

    <div v-if="pending" class="flex flex-col items-center justify-center py-20" aria-live="polite">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p class="text-gray-700 font-medium">Buscando tus citas...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl text-center" role="alert">
      <p class="font-bold">Hubo un problema al cargar la información.</p>
      <p class="text-sm opacity-90">{{ error.message }}</p>
    </div>

    <div v-else>
      <h2 class="sr-only">Listado de citas filtradas</h2>
      
      <div v-if="filteredCitas.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article 
          v-for="cita in filteredCitas" 
          :key="cita.id"
          class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <div class="h-2 w-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
          
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <span 
                :class="[
                  'text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border',
                  getStatusClasses(cita.estado)
                ]"
              >
                {{ cita.estado }}
              </span>
              <h3 class="text-primary font-bold text-lg leading-tight">
                {{ cita.especialista?.especialidad || 'General' }}
              </h3>
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gray-50 rounded-lg text-primary" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-600 font-bold uppercase">Fecha y Hora</p>
                  <p class="text-sm font-semibold text-gray-800">{{ formatDate(cita.fecha) }} • {{ formatTime(cita.hora) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="p-2 bg-gray-50 rounded-lg text-primary" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-600 font-bold uppercase">Especialista</p>
                  <p class="text-sm font-semibold text-gray-800">{{ cita.especialista?.persona?.usuario || 'Por asignar' }}</p>
                </div>
              </div>
            </div>

            <div v-if="cita.estado === 'pendiente'" class="flex gap-2 mt-6 pt-6 border-t border-gray-100">
              <button
                @click="handleDelete(cita.id)"
                class="flex-1 text-xs font-bold text-red-700 hover:bg-red-50 py-2 rounded-lg transition"
                :aria-label="'Cancelar cita de ' + cita.especialista?.especialidad"
              >
                Cancelar
              </button>
              <button
                @click="handleReschedule(cita)"
                class="flex-1 text-xs font-bold text-green-1 bg-green-2/20 hover:bg-green-2/40 py-2 rounded-lg transition"
              >
                Reprogramar
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <div class="text-6xl mb-4" aria-hidden="true">📅</div>
        <h2 class="text-xl font-bold text-gray-800">No hay citas en "{{ activeFilter }}"</h2>
        <p class="text-gray-600 mb-8 px-4">Parece que no tienes actividad programada en esta categoría por ahora.</p>
      </div>
    </div>
  </section>
</template>