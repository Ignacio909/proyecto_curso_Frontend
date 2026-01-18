<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})

const { data: currentUser, token } = useAuth()
const { addToast } = useToast()

useSeoMeta({
  title: 'Citas de Hoy - Especialista',
  description: 'Revisa y gestiona tus pacientes programados para el día de hoy.',
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const especialistaId = computed(() => currentUser.value?.especialista?.id)

// Cargar citas
const { data: citas, pending, refresh } = await useFetch(
  () => especialistaId.value ? `${apiBase}/citas/especialista/${especialistaId.value}` : null,
  {
    immediate: !!especialistaId.value,
    watch: [especialistaId],
    headers: {
      Authorization: token.value || ''
    }
  }
)

// Filtrar citas de HOY y ordenarlas por hora
const citasHoy = computed(() => {
  if (!citas.value) return []
  
  const today = new Date().toISOString().split('T')[0]
  
  return citas.value
    .filter(c => c.fecha === today && c.estado === 'pendiente')
    .sort((a, b) => {
      // Ordenar por hora (HH:mm:ss)
      return a.hora.localeCompare(b.hora)
    })
})

// hoy.vue - Actualiza handleAttend
const handleAttend = async (cita) => {
  try {
    // 1. Verificar si el paciente tiene historia clínica
    // Suponemos que tienes un endpoint que busca historia por pacienteId
    const historia = await $fetch(`${apiBase}/historias-clinicas/paciente/${cita.pacienteId}`, {
       headers: { Authorization: token.value }
    });

    if (!historia) {
      // Caso A: No tiene historia
      addToast({ 
        title: 'Paciente sin Historia', 
        description: 'Redirigiendo para crear la historia clínica base.', 
        type: 'info' 
      });
      // Navegamos pasando el ID del paciente para que 'add.vue' lo reconozca
      await navigateTo(`/historias-clinicas/add?pacienteId=${cita.pacienteId}`);
    } else {
      // Caso B: Ya tiene historia
      // Lo enviamos a la vista de atención (que diseñaremos abajo)
      await navigateTo(`/atencion/${historia.id}?citaId=${cita.id}`);
    }
  } catch (err) {
    // Si el error es 404 (no encontrado), también redirigimos a crear
    if (err.status === 404) {
      await navigateTo(`/historias-clinicas/add?pacienteId=${cita.pacienteId}`);
    } else {
      addToast({ title: 'Error', description: 'No se pudo verificar el historial', type: 'error' });
    }
  }
}

// Formatear hora
const formatTime = (timeString) => {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}
</script>

<template>
  <section class="mx-auto w-full max-w-6xl px-4 py-8">
    <h1 class="text-3xl font-bold text-primary mb-8">Citas del Día</h1>

    <div v-if="pending" class="text-center py-12">
      <p class="text-xl text-gray-600">Cargando citas...</p>
    </div>

    <div v-else-if="citasHoy.length === 0" class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <p class="text-xl text-gray-500">No tienes citas pendientes para hoy.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="cita in citasHoy" 
        :key="cita.id"
        class="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
            {{ formatTime(cita.hora) }}
          </div>
          <span class="text-sm text-gray-500">#{{ cita.id.slice(0, 8) }}</span>
        </div>

        <div class="mb-4">
          <h3 class="text-xl font-bold text-gray-800 mb-1">
            {{ cita.paciente?.persona?.usuario || 'Paciente Desconocido' }}
          </h3>
          <p class="text-gray-600">{{ cita.paciente?.persona?.correo }}</p>
          <p class="text-gray-600 mt-2 text-sm">
            <span class="font-semibold">Teléfono:</span> {{ cita.paciente?.persona?.telefono || 'N/A' }}
          </p>
        </div>

        <div class="mt-auto pt-4 border-t border-gray-100">
          <Button 
            label="Atender Paciente" 
            variant="green-1"
            class="w-full"
            @click="handleAttend(cita)"
          />
        </div>
      </div>
    </div>
  </section>
</template>
