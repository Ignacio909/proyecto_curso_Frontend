<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})

const { currentUser, token } = useAuth()
const { addToast } = useToast()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const especialistaId = computed(() => currentUser.value?.id)

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

// Filtrar solo pendientes (opcional, el usuario dijo "todas las citas pendientes")
const citasPendientes = computed(() => {
  return citas.value?.filter(c => c.estado === 'pendiente') || []
})

// --- Lógica de Modificación ---
const showEditModal = ref(false)
const editForm = ref({
  id: '',
  fecha: '',
  hora: '',
  pacienteId: '', // Necesario para mantener la integridad si el backend lo pide, aunque solo editamos fecha/hora
  especialistaId: ''
})
const availableHours = ref([])
const loadingHours = ref(false)

const allHours = [
  { value: '08:00:00', label: '8:00 AM - 9:00 AM' },
  { value: '09:00:00', label: '9:00 AM - 10:00 AM' },
  { value: '10:00:00', label: '10:00 AM - 11:00 AM' },
  { value: '13:00:00', label: '1:00 PM - 2:00 PM' },
  { value: '14:00:00', label: '2:00 PM - 3:00 PM' },
  { value: '15:00:00', label: '3:00 PM - 4:00 PM' },
  { value: '16:00:00', label: '4:00 PM - 5:00 PM' }
]

// Validar día de semana
const validateWeekday = (date) => {
  const [year, month, day] = date.split('-').map(Number)
  const localDate = new Date(year, month - 1, day)
  const dayOfWeek = localDate.getDay()
  return dayOfWeek >= 1 && dayOfWeek <= 5
}

// Cargar horas disponibles
const loadAvailableHours = async (fecha, especialistaId) => {
  try {
    loadingHours.value = true
    const { data: allCitas } = await useFetch(`${apiBase}/citas`, {
      headers: {
        Authorization: token.value || ''
      }
    })
    
    const reservedHours = allCitas.value
      ?.filter(c => c.especialistaId === especialistaId && c.fecha === fecha && c.id !== editForm.value.id) // Excluir la cita actual
      .map(c => c.hora) || []
    
    availableHours.value = allHours.filter(h => !reservedHours.includes(h.value))
  } catch (err) {
    console.error('Error cargando horas:', err)
    availableHours.value = allHours
  } finally {
    loadingHours.value = false
  }
}

// Watch para cargar horas cuando cambia la fecha en el modal
watch(() => editForm.value.fecha, async (newFecha) => {
  if (newFecha && editForm.value.especialistaId) {
    if (!validateWeekday(newFecha)) {
      addToast('Solo se permiten citas de lunes a viernes', 'error')
      availableHours.value = []
      return
    }
    await loadAvailableHours(newFecha, editForm.value.especialistaId)
  }
})

const openEditModal = (cita) => {
  editForm.value = {
    id: cita.id,
    fecha: cita.fecha,
    hora: cita.hora,
    pacienteId: cita.pacienteId,
    especialistaId: cita.especialistaId
  }
  showEditModal.value = true
  // Cargar horas iniciales para la fecha actual de la cita
  loadAvailableHours(cita.fecha, cita.especialistaId)
}

const handleUpdate = async () => {
  try {
    if (!validateWeekday(editForm.value.fecha)) {
      addToast('Solo se permiten citas de lunes a viernes', 'error')
      return
    }

    await $fetch(`${apiBase}/citas/${editForm.value.id}`, {
      method: 'PUT',
      headers: {
        Authorization: token.value || ''
      },
      body: {
        fecha: editForm.value.fecha,
        hora: editForm.value.hora,
        // Enviamos los IDs para cumplir con validaciones del backend si las hay
        pacienteId: editForm.value.pacienteId,
        especialistaId: editForm.value.especialistaId,
        estado: editForm.value.estado
      }
    })

    addToast('Cita reprogramada exitosamente')
    showEditModal.value = false
    await refresh()
  } catch (err) {
    console.error('Error actualizando cita:', err)
    addToast('Error al reprogramar la cita', 'error')
  }
}

// --- Lógica de Cancelación ---
const handleCancel = async (id) => {
  if (!confirm('¿Está seguro de cancelar esta cita? Esta acción no se puede deshacer.')) return

  try {
    await $fetch(`${apiBase}/citas/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token.value || ''
      }
    })
    addToast('Cita cancelada exitosamente')
    await refresh()
  } catch (err) {
    console.error('Error cancelando cita:', err)
    addToast('Error al cancelar la cita', 'error')
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
    <h1 class="text-3xl font-bold text-primary mb-8">Gestión de Citas</h1>

    <div v-if="pending" class="text-center py-12">
      <p class="text-xl text-gray-600">Cargando citas...</p>
    </div>

    <div v-else-if="citasPendientes.length === 0" class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <p class="text-xl text-gray-500">No tienes citas pendientes.</p>
    </div>

    <div v-else class="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table class="w-full text-left border-collapse">
        <thead class="bg-primary text-white">
          <tr>
            <th class="p-4 font-semibold">Fecha</th>
            <th class="p-4 font-semibold">Hora</th>
            <th class="p-4 font-semibold">Paciente</th>
            <th class="p-4 font-semibold">Estado</th>
            <th class="p-4 font-semibold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="cita in citasPendientes" :key="cita.id" class="hover:bg-gray-50">
            <td class="p-4">{{ cita.fecha }}</td>
            <td class="p-4">{{ formatTime(cita.hora) }}</td>
            <td class="p-4">
              <div class="font-medium">{{ cita.paciente?.persona?.usuario || 'Desconocido' }}</div>
              <div class="text-sm text-gray-500">{{ cita.paciente?.persona?.correo }}</div>
            </td>
            <td class="p-4">
              <span class="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                {{ cita.estado }}
              </span>
            </td>
            <td class="p-4">
              <div class="flex justify-center gap-2">
                <Button 
                  label="Modificar" 
                  variant="green-2"
                  size="sm"
                  @click="openEditModal(cita)"
                />
                <Button 
                  label="Cancelar" 
                  variant="danger"
                  size="sm"
                  @click="handleCancel(cita.id)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Edición -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <h2 class="text-2xl font-bold text-primary mb-6">Reprogramar Cita</h2>
        
        <form @submit.prevent="handleUpdate" class="space-y-4">
          <div>
            <label class="block font-semibold mb-2">Nueva Fecha:</label>
            <input 
              v-model="editForm.fecha"
              type="date"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block font-semibold mb-2">Nueva Hora:</label>
            <select
              v-model="editForm.hora"
              required
              :disabled="loadingHours"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:border-primary disabled:bg-gray-100"
            >
              <option value="" disabled>Seleccione una hora</option>
              <option v-for="h in availableHours" :key="h.value" :value="h.value">
                {{ h.label }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <Button 
              label="Cerrar" 
              variant="outline"
              @click="showEditModal = false"
            />
            <Button 
              label="Guardar Cambios" 
              variant="green-1"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
