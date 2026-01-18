<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})


// TODO: Cuando tengan autenticación, obtener el pacienteId del usuario autenticado
const { data: currentUser, token } = useAuth()

useSeoMeta({
  title: 'Mis Citas - Historial',
  description: 'Consulta tu historial de citas y próximos turnos.',
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Cargar citas del paciente
// TODO: Usar el ID real del paciente cuando esté disponible en currentUser
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



// Filtro activo
const activeFilter = ref('recientes')

const { addToast } = useToast()

// Filtrar citas del paciente actual
const userCitas = computed(() => {
  if (!allCitas.value) return []
  return allCitas.value
})

// Aplicar filtros
const filteredCitas = computed(() => {
  const today = new Date()
  const oneWeekFromNow = new Date(today)
  oneWeekFromNow.setDate(today.getDate() + 7)
  
  switch (activeFilter.value) {
    case 'recientes':
      // Citas en el rango de 1 semana o menos desde hoy
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

// Agrupar citas por estado
const groupedCitas = computed(() => {
  const groups = {
    recientes: [],
    pendientes: [],
    completadas: [],
    canceladas: []
  }
  
  const today = new Date()
  const oneWeekFromNow = new Date(today)
  oneWeekFromNow.setDate(today.getDate() + 7)
  
  filteredCitas.value.forEach(cita => {
    const citaDate = new Date(cita.fecha)
    
    // Recientes
    if (citaDate >= today && citaDate <= oneWeekFromNow) {
      groups.recientes.push(cita)
    }
    
    // Por estado
    if (cita.estado === 'pendiente') {
      groups.pendientes.push(cita)
    } else if (cita.estado === 'completada') {
      groups.completadas.push(cita)
    } else if (cita.estado === 'cancelada') {
      groups.canceladas.push(cita)
    }
  })
  
  return groups
})

// Formatear fecha
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Formatear hora
const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

// Eliminar cita
const handleDelete = async (citaId) => {
  if (!confirm('¿Está seguro que desea eliminar esta cita?')) return
  
  try {
    await $fetch(`${apiBase}/citas/${citaId}`, {
      method: 'DELETE',
      headers: {
        Authorization: token.value || ''
      }
    })
    
    await refresh()
    addToast('Cita eliminada exitosamente')
  } catch (err) {
    console.error('Error al eliminar cita:', err)
    addToast('Error al eliminar la cita', 'error')
  }
}

// Reprogramar cita (redirigir a agendar)
const handleReschedule = (cita) => {
  // TODO: Podrías pasar los datos de la cita actual para pre-llenar el formulario
  navigateTo('/citas/add')
}
</script>

<template>
  <section class="mx-auto w-full max-w-7xl">
    <!-- Header con Volver y botón Agendar -->
    <div class="mb-6 flex items-center justify-between">
      <Button 
        label="Volver" 
        variant="green-2"
        to="/home"
        size="sm"
      />
      
      <Button 
        label="Agendar Cita +" 
        variant="green-1"
        to="/citas/add"
        size="md"
      />
    </div>

    <!-- Filtros -->
    <div class="mb-6 flex flex-wrap gap-4 justify-center">
      <button
        @click="activeFilter = 'recientes'"
        :class="[
          'px-6 py-3 rounded-lg font-semibold transition-all shadow-md',
          activeFilter === 'recientes' 
            ? 'bg-green-1 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Recientes
      </button>
      
      <button
        @click="activeFilter = 'pendientes'"
        :class="[
          'px-6 py-3 rounded-lg font-semibold transition-all shadow-md',
          activeFilter === 'pendientes' 
            ? 'bg-green-1 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Pendientes
      </button>
      
      <button
        @click="activeFilter = 'completadas'"
        :class="[
          'px-6 py-3 rounded-lg font-semibold transition-all shadow-md',
          activeFilter === 'completadas' 
            ? 'bg-green-1 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Completadas
      </button>
      
      <button
        @click="activeFilter = 'canceladas'"
        :class="[
          'px-6 py-3 rounded-lg font-semibold transition-all shadow-md',
          activeFilter === 'canceladas' 
            ? 'bg-green-1 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Canceladas
      </button>
    </div>



    <!-- Loading -->
    <div v-if="pending" class="text-center py-12">
      <p class="text-xl text-gray-600">Cargando citas...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-xl text-red-600">Error al cargar citas: {{ error.message }}</p>
    </div>

    <!-- Contenido de citas -->
    <div v-else>
      <!-- Mostrar sección según filtro activo -->
      <div v-if="activeFilter === 'recientes' && groupedCitas.recientes.length > 0">
        <h2 class="text-2xl font-bold mb-4 text-primary">Recientes</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            v-for="cita in groupedCitas.recientes" 
            :key="cita.id"
            class="bg-primary text-white rounded-lg overflow-hidden shadow-lg"
          >
            <div class="bg-primary/90 px-4 py-3 border-b-2 border-black">
              <h3 class="text-xl font-bold">{{ cita.especialista?.especialidad || 'N/A' }}</h3>
            </div>
            <div class="p-4 space-y-2">
              <p class="text-lg"><strong>Fecha:</strong> {{ formatDate(cita.fecha) }}</p>
              <p class="text-lg"><strong>Hora:</strong> {{ formatTime(cita.hora) }}</p>
              <p class="text-lg"><strong>Especialista:</strong> {{ cita.especialista?.persona?.usuario || 'N/A' }}</p>
              <p class="text-lg"><strong>Estado:</strong> {{ cita.estado }}</p>
              <div class="flex gap-3 mt-4">
                <button
                  @click="handleDelete(cita.id)"
                  class="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                >
                  Eliminar
                </button>
                <button
                  @click="handleReschedule(cita)"
                  class="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
                >
                  Reprogramar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pendientes -->
      <div v-if="activeFilter === 'pendientes' && groupedCitas.pendientes.length > 0">
        <h2 class="text-2xl font-bold mb-4 text-primary">Pendientes</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            v-for="cita in groupedCitas.pendientes" 
            :key="cita.id"
            class="bg-primary text-white rounded-lg overflow-hidden shadow-lg"
          >
            <div class="bg-primary/90 px-4 py-3 border-b-2 border-black">
              <h3 class="text-xl font-bold">{{ cita.especialista?.especialidad || 'N/A' }}</h3>
            </div>
            <div class="p-4 space-y-2">
              <p class="text-lg"><strong>Fecha:</strong> {{ formatDate(cita.fecha) }}</p>
              <p class="text-lg"><strong>Hora:</strong> {{ formatTime(cita.hora) }}</p>
              <p class="text-lg"><strong>Especialista:</strong> {{ cita.especialista?.persona?.usuario || 'N/A' }}</p>
              <p class="text-lg"><strong>Estado:</strong> {{ cita.estado }}</p>
              <div class="flex gap-3 mt-4">
                <button
                  @click="handleDelete(cita.id)"
                  class="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                >
                  Eliminar
                </button>
                <button
                  @click="handleReschedule(cita)"
                  class="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
                >
                  Reprogramar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completadas -->
      <div v-if="activeFilter === 'completadas' && groupedCitas.completadas.length > 0">
        <h2 class="text-2xl font-bold mb-4 text-primary">Completadas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            v-for="cita in groupedCitas.completadas" 
            :key="cita.id"
            class="bg-primary text-white rounded-lg overflow-hidden shadow-lg"
          >
            <div class="bg-primary/90 px-4 py-3 border-b-2 border-black">
              <h3 class="text-xl font-bold">{{ cita.especialista?.especialidad || 'N/A' }}</h3>
            </div>
            <div class="p-4 space-y-2">
              <p class="text-lg"><strong>Fecha:</strong> {{ formatDate(cita.fecha) }}</p>
              <p class="text-lg"><strong>Hora:</strong> {{ formatTime(cita.hora) }}</p>
              <p class="text-lg"><strong>Especialista:</strong> {{ cita.especialista?.persona?.usuario || 'N/A' }}</p>
              <p class="text-lg"><strong>Estado:</strong> {{ cita.estado }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Canceladas -->
      <div v-if="activeFilter === 'canceladas' && groupedCitas.canceladas.length > 0">
        <h2 class="text-2xl font-bold mb-4 text-primary">Canceladas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            v-for="cita in groupedCitas.canceladas" 
            :key="cita.id"
            class="bg-primary text-white rounded-lg overflow-hidden shadow-lg"
          >
            <div class="bg-primary/90 px-4 py-3 border-b-2 border-black">
              <h3 class="text-xl font-bold">{{ cita.especialista?.especialidad || 'N/A' }}</h3>
            </div>
            <div class="p-4 space-y-2">
              <p class="text-lg"><strong>Fecha:</strong> {{ formatDate(cita.fecha) }}</p>
              <p class="text-lg"><strong>Hora:</strong> {{ formatTime(cita.hora) }}</p>
              <p class="text-lg"><strong>Especialista:</strong> {{ cita.especialista?.persona?.usuario || 'N/A' }}</p>
              <p class="text-lg"><strong>Estado:</strong> {{ cita.estado }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin citas -->
      <div v-if="filteredCitas.length === 0" class="text-center py-12">
        <p class="text-xl text-gray-600">No hay citas {{ activeFilter }} en este momento</p>
        <Button 
          label="Agendar Primera Cita" 
          variant="green-1"
          to="/citas/add"
          size="lg"
          class="mt-6"
        />
      </div>
    </div>
  </section>
</template>
