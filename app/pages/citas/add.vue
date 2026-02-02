<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})
// TODO: Cuando tengan autenticación, obtener el pacienteId del usuario autenticado
const { data: currentUser, token } = useAuth()

useSeoMeta({
  title: 'Agendar Nueva Cita - CAIBH',
  description: 'Reserva tu cita médica con nuestros especialistas.',
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Cargar especialistas - hacerlo reactivo al token
const { data: specialists, pending: loadingSpecialists } = await useFetch(`${apiBase}/especialistas`, {
  key: 'especialistas-list',
  watch: [token],
  headers: computed(() => ({
    Authorization: token.value || '' }))
})

// Formulario
const formData = ref({
  especialistaId: '',
  fecha: '',
  hora: ''
})

// ... imports
const { addToast } = useToast()

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
    addToast('Solo puedes agendar citas de lunes a viernes', 'error')
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

const availableHours = ref([])
const loadingHours = ref(false)
const allHours = [
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' }
]

const loadAvailableHours = async (fecha, especialistaId) => {
  try {
    loadingHours.value = true
    
    // Obtener todas las citas del especialista para esa fecha
    const { data: allCitas } = await useFetch(`${apiBase}/citas/especialista/${especialistaId}`, {
      headers: {
        Authorization: token.value || ''
      }
    })
    
    // Filtrar citas reservadas para ese especialista y fecha
    const reservedHours = allCitas.value
      ?.filter(cita => cita.fecha === fecha)
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

// Estilos base para inputs y selects (Reemplaza al CSS con @apply)
const baseInputClass = "w-full rounded-xl border-2 border-gray-200 bg-white py-3.5 pr-10 pl-12 text-gray-700 text-base transition-all duration-200 ease-in-out font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none hover:border-gray-300 placeholder:text-gray-400"

const handleSubmit = async () => {
  try {
    // Validaciones
    if (!formData.value.especialistaId || !formData.value.fecha || !formData.value.hora) {
      addToast('Por favor completa todos los campos requeridos', 'error')
      return
    }
    
    if (!validateWeekday(formData.value.fecha)) {
      addToast('Solo puedes agendar citas de lunes a viernes', 'error')
      return
    }
    
    
    const pacienteId = currentUser.value?.paciente?.id // Esto vendrá del sistema de auth
    
    await $fetch(`${apiBase}/citas`, {
      method: 'POST',
      headers: {
        Authorization: token.value || ''
      },
      body: {
        fecha: formData.value.fecha,
        hora: formData.value.hora,
        pacienteId: pacienteId,
        especialistaId: formData.value.especialistaId,
        estado: 'pendiente'
      }
    })
    
    addToast('Cita agendada exitosamente')
    
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
    addToast('Error al agendar la cita: ' + (err.message || 'Desconocido'), 'error')
  }
}


</script>

<template>
  <section class="mx-auto w-full max-w-4xl px-4 py-8">
    <header class="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Reservar Nueva Cita</h1>
        <p class="text-gray-600 mt-2 font-medium">Completa los pasos para agendar tu consulta médica.</p>
      </div>
      <Button 
        label="Volver al historial" 
        variant="green-1"
        to="/citas/mis-citas"
        size="sm"
        class="self-start md:self-auto"
      />
    </header>

    <main class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300">
      <div class="p-8 md:p-12">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          
          <div class="space-y-3">
            <label for="especialista-select" class="block text-sm font-bold text-gray-800 ml-1">
              1. ¿Con quién deseas atenderte?
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <select
                id="especialista-select"
                v-model="formData.especialistaId"
                required
                :class="[baseInputClass, 'custom-select-arrow']"
              >
                <option value="" disabled selected>Selecciona un especialista de la lista</option>
                <option 
                  v-for="specialist in specialists" 
                  :key="specialist.id"
                  :value="specialist.id"
                >
                  {{ specialist.especialidad }} — Dr(a). {{ specialist.persona?.usuario }}
                </option>
              </select>
            </div>
          </div>

          <div class="space-y-3">
            <label for="fecha-input" class="block text-sm font-bold text-gray-800 ml-1">
              2. Elige la fecha
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="fecha-input"
                v-model="formData.fecha"
                type="date"
                :min="minDate"
                :max="maxDate"
                required
                :class="baseInputClass"
                aria-describedby="fecha-helper"
              />
            </div>
            <p id="fecha-helper" class="text-xs font-semibold text-blue-700 mt-2 ml-1 flex items-center gap-1">
              <span class="text-lg" aria-hidden="true">ⓘ</span> Atención disponible de Lunes a Viernes
            </p>
          </div>

          <div class="space-y-3">
            <label for="hora-select" class="block text-sm font-bold text-gray-800 ml-1">
              3. Elige el horario
            </label>
            <div class="relative group">
               <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary" :class="{'opacity-50': !formData.fecha || !formData.especialistaId || loadingHours}" aria-hidden="true">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
              </div>
              <select
                id="hora-select"
                v-model="formData.hora"
                required
                :disabled="!formData.fecha || !formData.especialistaId || loadingHours"
                :class="[baseInputClass, 'custom-select-arrow disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed']"
              >
                <option value="" disabled selected>
                  {{ loadingHours ? 'Verificando disponibilidad...' : 'Selecciona una hora disponible' }}
                </option>
                <option 
                  v-for="hour in availableHours" 
                  :key="hour.value"
                  :value="hour.value"
                >
                  {{ hour.label }}
                </option>
              </select>
            </div>
            
            <div aria-live="polite">
              <p v-if="availableHours.length === 0 && formData.fecha && formData.especialistaId && !loadingHours" class="text-sm font-bold text-red-700 mt-2 ml-1">
                 ✕ Lo sentimos, no hay horarios disponibles para esta fecha.
              </p>
              <p v-else-if="availableHours.length > 0 && !formData.hora" class="text-sm font-bold text-emerald-700 mt-2 ml-1">
                 ✓ ¡Hay {{ availableHours.length }} horarios disponibles!
              </p>
            </div>
          </div>

          <div class="pt-8">
            <Button 
              label="Confirmar Cita" 
              variant="green-1"
              size="lg"
              type="submit"
              class="w-full md:w-auto md:px-12 shadow-lg"
            />
            <p class="text-sm text-gray-600 mt-4">Al confirmar, tu cita quedará en estado "Pendiente".</p>
          </div>
        </form>
      </div>
    </main>
  </section>
</template>

<style scoped>
/* Solo mantenemos la personalización de la flecha del select usando CSS estándar.
   Al no usar @apply, no tendrás warnings ni líneas amarillas. */

.custom-select-arrow {
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.5em 1.5em;
  /* Flecha Gris (SVG codificado) */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3e%3c/svg%3e");
}

.custom-select-arrow:focus {
  /* Flecha Azul (Primary) al hacer focus */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%232d6a7f' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3e%3c/svg%3e");
}
</style>