<script setup>
// TODO: Cuando tengan autenticación, obtener el pacienteId del usuario autenticado
const { currentUser } = useAuth()

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Cargar especialistas
const { data: specialists, pending: loadingSpecialists } = await useFetch(`${apiBase}/especialistas`)

// Formulario
const formData = ref({
  especialistaId: '',
  fecha: '',
  hora: ''
})

const notification = ref({ show: false, message: '', type: '' })
const availableHours = ref([])
const loadingHours = ref(false)

// Horarios disponibles
const allHours = [
  { value: '08:00:00', label: '8:00 AM - 9:00 AM' },
  { value: '09:00:00', label: '9:00 AM - 10:00 AM' },
  { value: '10:00:00', label: '10:00 AM - 11:00 AM' },
  { value: '13:00:00', label: '1:00 PM - 2:00 PM' },
  { value: '14:00:00', label: '2:00 PM - 3:00 PM' },
  { value: '15:00:00', label: '3:00 PM - 4:00 PM' },
  { value: '16:00:00', label: '4:00 PM - 5:00 PM' }
]

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Calcular rango de fechas (2 meses desde hoy, solo lunes a viernes)
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const today = new Date()
  const twoMonthsLater = new Date(today.setMonth(today.getMonth() + 2))
  return twoMonthsLater.toISOString().split('T')[0]
})

// Validar que la fecha sea lunes a viernes
const validateWeekday = (date) => {
  // Usar la fecha local para evitar problemas de zona horaria
  const [year, month, day] = date.split('-').map(Number)
  const localDate = new Date(year, month - 1, day) // mes es 0-indexed
  const dayOfWeek = localDate.getDay()
  return dayOfWeek >= 1 && dayOfWeek <= 5 // 1 = Lunes, 5 = Viernes
}

// Cuando cambian fecha o especialista, cargar horas disponibles
watch([() => formData.value.fecha, () => formData.value.especialistaId], async ([newFecha, newEspecialistaId]) => {
  // Validar que la fecha sea de lunes a viernes
  if (newFecha && !validateWeekday(newFecha)) {
    showNotification('Solo puedes agendar citas de lunes a viernes', 'error')
    formData.value.fecha = ''
    availableHours.value = []
    return
  }
  
  if (newFecha && newEspecialistaId) {
    await loadAvailableHours(newFecha, newEspecialistaId)
  } else {
    availableHours.value = []
  }
})

const loadAvailableHours = async (fecha, especialistaId) => {
  try {
    loadingHours.value = true
    
    // Obtener todas las citas del especialista para esa fecha
    const { data: allCitas } = await useFetch(`${apiBase}/citas`)
    
    // Filtrar citas reservadas para ese especialista y fecha
    const reservedHours = allCitas.value
      ?.filter(cita => cita.especialistaId === especialistaId && cita.fecha === fecha)
      .map(cita => cita.hora) || []
    
    // Filtrar horas disponibles
    availableHours.value = allHours.filter(hour => !reservedHours.includes(hour.value))
    
  } catch (err) {
    console.error('Error cargando horas disponibles:', err)
    availableHours.value = allHours
  } finally {
    loadingHours.value = false
  }
}

const handleSubmit = async () => {
  try {
    // Validaciones
    if (!formData.value.especialistaId || !formData.value.fecha || !formData.value.hora) {
      showNotification('Por favor completa todos los campos requeridos', 'error')
      return
    }
    
    if (!validateWeekday(formData.value.fecha)) {
      showNotification('Solo puedes agendar citas de lunes a viernes', 'error')
      return
    }
    
    // TODO: Cuando tengan auth, usar el pacienteId real del usuario autenticado
    // Por ahora uso un ID de ejemplo (debes reemplazarlo)
    const pacienteId = currentUser.value.id // Esto vendrá del sistema de auth
    
    await $fetch(`${apiBase}/citas`, {
      method: 'POST',
      body: {
        fecha: formData.value.fecha,
        hora: formData.value.hora,
        pacienteId: pacienteId,
        especialistaId: formData.value.especialistaId,
        estado: 'pendiente'
      }
    })
    
    showNotification('Cita agendada exitosamente')
    
    // Limpiar formulario
    formData.value = {
      especialistaId: '',
      fecha: '',
      hora: ''
    }
    availableHours.value = []
    
    // Redirigir a Mis Citas después de 2 segundos
    setTimeout(() => {
      navigateTo('/citas/mis-citas')
    }, 2000)
    
  } catch (err) {
    console.error('Error al agendar cita:', err)
    showNotification('Error al agendar la cita', 'error')
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-3xl">
    <!-- Botón Volver -->
    <div class="mb-6">
      <Button 
        label="Volver" 
        variant="green-2"
        to="/home"
        size="sm"
      />
    </div>

    <!-- Título -->
    <div class="bg-primary text-white rounded-t-lg p-6 text-center">
      <h1 class="text-3xl font-bold">Agendar Cita</h1>
    </div>

    <!-- Notificación -->
    <div 
      v-if="notification.show" 
      :class="[
        'mb-4 rounded-md p-4 text-white',
        notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
      ]"
    >
      {{ notification.message }}
    </div>

    <!-- Formulario -->
    <div class="bg-white rounded-b-lg border-2 border-primary p-8 shadow-lg">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        
        <!-- Seleccionar Especialista -->
        <div>
          <label class="block text-xl font-semibold mb-3">Seleccionar un Especialista:</label>
          <select
            v-model="formData.especialistaId"
            required
            class="w-full rounded-md border-2 border-gray-300 bg-gray-100 px-4 py-3 text-lg focus:outline-none focus:border-primary"
          >
            <option value="" disabled>Seleccione un especialista</option>
            <option 
              v-for="specialist in specialists" 
              :key="specialist.id"
              :value="specialist.id"
            >
              {{ specialist.especialidad }} - {{ specialist.persona?.usuario }}
            </option>
          </select>
        </div>

        <!-- Seleccionar Fecha -->
        <div>
          <label class="block text-xl font-semibold mb-3">Elegir Fecha:</label>
          <input
            v-model="formData.fecha"
            type="date"
            :min="minDate"
            :max="maxDate"
            required
            class="w-full rounded-md border-2 border-gray-300 px-4 py-3 text-lg focus:outline-none focus:border-primary"
          />
          <p class="text-sm text-gray-600 mt-2">* Solo se permiten citas de lunes a viernes</p>
        </div>

        <!-- Seleccionar Hora -->
        <div>
          <label class="block text-xl font-semibold mb-3">Elegir Hora:</label>
          <select
            v-model="formData.hora"
            required
            :disabled="!formData.fecha || !formData.especialistaId || loadingHours"
            class="w-full rounded-md border-2 border-gray-300 bg-gray-100 px-4 py-3 text-lg focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              {{ loadingHours ? 'Cargando horarios...' : 'Seleccione una hora' }}
            </option>
            <option 
              v-for="hour in availableHours" 
              :key="hour.value"
              :value="hour.value"
            >
              {{ hour.label }}
            </option>
          </select>
          <p v-if="availableHours.length === 0 && formData.fecha && formData.especialistaId && !loadingHours" class="text-sm text-red-600 mt-2">
            No hay horarios disponibles para esta fecha
          </p>
        </div>

        <!-- Botón Agendar -->
        <div class="flex justify-center pt-4">
          <Button 
            label="Agendar" 
            variant="green-1"
            size="lg"
            type="submit"
          />
        </div>
      </form>
    </div>
  </section>
</template>
