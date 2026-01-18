<script setup>
    definePageMeta({
        layout: 'default',
        auth: true
    })
    
    const route = useRoute()
    const router = useRouter()
    const config = useRuntimeConfig()
    const { data: currentUser, token } = useAuth()
    const { addToast } = useToast()
    
    // 1. Obtener IDs clave
    const historiaId = route.params.id
    const especialistaId = computed(() => currentUser.value?.especialista?.id)

    // --- NUEVOS ESTADOS ---
    const isDirty = ref(true) // Cambia a false solo cuando se complete la cita
    const completingCita = ref(false)
    const citaId = route.query.citaId // Asumiendo que pasas el citaId por la URL al llegar aquí
    
    // 2. Cargar la Historia Clínica completa (incluyendo registros anteriores)
    const { data: historia, pending, refresh, error } = await useFetch(
      `${config.public.apiBase}/historias-clinicas/${historiaId}`,
      {
        headers: { Authorization: token.value },
        key: `historia-${historiaId}` // Clave única para caché
      }
    )
    
    // Ordenar registros cronológicamente (más reciente primero)
    const registrosOrdenados = computed(() => {
      if (!historia.value?.registrosClinicos) return []
      return [...historia.value.registrosClinicos].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    })
    
    // --- LÓGICA DE NUEVO REGISTRO (MODAL) ---
    const showModal = ref(false)
    const isSubmitting = ref(false)
    
    const form = ref({
      diagnostico: '',
      tratamiento: '',
      observaciones: ''
    })
    
    const handleGuardarRegistro = async () => {
      if (!especialistaId.value) {
        return addToast({ title: 'Error', description: 'No se identificó al especialista', type: 'error' })
      }
    
      isSubmitting.value = true
      try {
        // Estructura según tu modelo registros_clinicos.js
        const payload = {
          historiaClinicaId: historiaId,
          especialistaId: especialistaId.value,
          diagnostico: form.value.diagnostico,
          tratamiento: form.value.tratamiento,
          observaciones: form.value.observaciones
        }
    
        await $fetch(`${config.public.apiBase}/registros-clinicos`, {
          method: 'POST',
          body: payload,
          headers: { Authorization: token.value }
        })
    
        addToast({ title: 'Éxito', description: 'Evolución registrada correctamente', type: 'success' })
        
        // Limpiar y cerrar
        form.value = { diagnostico: '', tratamiento: '', observaciones: '' }
        showModal.value = false
        
        // Recargar datos para ver el nuevo registro en la lista
        refresh()
    
      } catch (err) {
        addToast({ title: 'Error', description: 'No se pudo guardar el registro', type: 'error' })
      } finally {
        isSubmitting.value = false
      }
    }

    // --- ADVERTENCIA AL SALIR ---
    onBeforeRouteLeave((to, from, next) => {
        if (isDirty.value) {
            const answer = window.confirm(
                '¿Estás seguro de que deseas volver? Los datos de la consulta actual no se han guardado permanentemente y la cita seguirá pendiente.'
            )
            if (answer) next()
            else next(false)
        } else {
            next()
        }
})

// --- FUNCIÓN PARA FINALIZAR CITA ---
    const finalizarAtencion = async () => {
        console.log("Intentando finalizar cita con ID:", citaId); // <-- AGREGA ESTO
        if (!citaId) {
            return addToast({ title: 'Error', description: 'No se encontró el ID de la cita', type: 'error' })
        }

        completingCita.value = true
        try {
            // Llamada al endpoint para cambiar el estado de la cita
            await $fetch(`${config.public.apiBase}/citas/${citaId}/completar`, {
            method: 'PATCH',
            headers: { Authorization: token.value }
            })
    
            addToast({ title: 'Éxito', description: 'Cita completada y cerrada', type: 'success' })
    
            isDirty.value = false // Desactivamos la alerta de seguridad
            router.push('/citas/hoy') // O la ruta de tu lista de citas (ej: /citas/hoy)
        } catch (error) {
            addToast({ title: 'Error', description: 'No se pudo actualizar el estado de la cita', type: 'error' })
        } finally {
            completingCita.value = false
        }
    }
    
    // Formatear fechas
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit'
      })
    }
    // SEO Dinámico
    useSeoMeta({
      title: () => historia.value ? `Atención: ${historia.value.nombre} ${historia.value.apellidos}` : 'Atención Médica',
      ogTitle: () => historia.value ? `Historia Clínica de ${historia.value.nombre}` : 'Atención Médica',
      description: 'Gestión de consulta y evolución de paciente.',
      ogDescription: 'Consulta médica y registro de evoluciones clínicas.',
    })
    </script>
    
    <template>
      <div class="min-h-screen bg-gray-50 pb-10">
        
        <div v-if="pending" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        
        <div v-else-if="error || !historia" class="max-w-4xl mx-auto mt-10 p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center">
          <h2 class="text-xl font-bold">Error al cargar historia</h2>
          <p>No se pudo encontrar la historia clínica solicitada.</p>
          <Button to="/citas/hoy" label="Volver al Inicio" variant="primary" class="mt-4"/>
        </div>
         
        <div v-else class="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="lg:col-span-1 space-y-6">
            
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="bg-primary p-6 text-white">
                <h1 class="text-2xl font-bold capitalize">{{ historia.nombre }} {{ historia.apellidos }}</h1>
                <p class="opacity-90 text-sm mt-1">
                  {{ historia.edad }} años • {{ historia.sexo }}
                </p>
              </div>
              <div class="p-6 space-y-4">
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase">Raza</label>
                  <p class="font-medium text-gray-800">{{ historia.raza || 'No especificada' }}</p>
                </div>
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase">Dirección</label>
                  <p class="font-medium text-gray-800">{{ historia.direccion || 'No registrada' }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-yellow-50 rounded-2xl shadow-sm border border-yellow-100 p-6">
              <h3 class="text-lg font-bold text-yellow-800 flex items-center gap-2 mb-4">
                ⚠️ Antecedentes y Enfermedades
              </h3>
              
              <div class="space-y-4">
                <div>
                  <span class="text-xs font-bold text-yellow-700 uppercase block mb-1">Enfermedades Base</span>
                  <p class="text-gray-700 bg-white p-3 rounded-lg border border-yellow-200 text-sm">
                    {{ historia.enfermedades || 'Sin enfermedades registradas.' }}
                  </p>
                </div>
                <div>
                  <span class="text-xs font-bold text-yellow-700 uppercase block mb-1">Antecedentes</span>
                  <p class="text-gray-700 bg-white p-3 rounded-lg border border-yellow-200 text-sm">
                    {{ historia.antecedentes || 'Sin antecedentes registrados.' }}
                  </p>
                </div>
              </div>
            </div>
    
            <Button 
              label="Volver a Citas" 
              to="/citas/hoy" 
              variant="green-2" 
              class="w-full"
            />
          </div>
    
          <div class="lg:col-span-2 space-y-6">
            
            <div class="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h2 class="text-xl font-bold text-gray-800">Historia Clínica</h2>
                <p class="text-sm text-gray-500">Historial de evoluciones y consultas.</p>
              </div>
                
                    <div class="flex justify-between items-center mb-8 gap-4 ">
                        <Button 
                            label="+ Nueva Consulta" 
                            variant="green-1" 
                            @click="showModal = true"
                            class="shadow-lg shadow-green-1/20"
                        />

                        <Button 
                            :label="completingCita ? 'Finalizando...' : 'Completar Cita'"
                            variant="green-1"
                            @click="finalizarAtencion"
                            :disabled="completingCita"
                        />
                    </div>
                
            </div>
    
            <div class="space-y-6">
              <div v-if="registrosOrdenados.length === 0" class="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p class="text-gray-400">No hay registros clínicos previos.</p>
              </div>
    
              <div 
                v-for="reg in registrosOrdenados" 
                :key="reg.id"
                class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative pl-8 hover:shadow-md transition-shadow"
              >
                <div class="absolute left-0 top-0 bottom-0 w-2 bg-green-1/20 rounded-l-2xl"></div>
                
                <div class="flex justify-between items-start mb-3">
                  <span class="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    {{ formatDate(reg.createdAt) }}
                  </span>
                  <span class="text-xs text-gray-400">Dr/a. {{ reg.especialista?.persona?.usuario || 'Especialista' }}</span>
                </div>
    
                <div class="space-y-4">
                  <div>
                    <h4 class="text-sm font-bold text-gray-900 uppercase">Diagnóstico</h4>
                    <p class="text-gray-700">{{ reg.diagnostico }}</p>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-if="reg.tratamiento">
                      <h4 class="text-xs font-bold text-gray-500 uppercase">Tratamiento</h4>
                      <p class="text-sm text-gray-600">{{ reg.tratamiento }}</p>
                    </div>
                    <div v-if="reg.observaciones">
                      <h4 class="text-xs font-bold text-gray-500 uppercase">Observaciones</h4>
                      <p class="text-sm text-gray-600 italic">"{{ reg.observaciones }}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    
          </div>
        </div>
    
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div class="bg-primary p-4 flex justify-between items-center text-white">
              <h3 class="font-bold text-lg">Registrar Consulta de Hoy</h3>
              <button @click="showModal = false" class="hover:bg-white/20 rounded-full p-1 transition-colors">✕</button>
            </div>
    
            <form @submit.prevent="handleGuardarRegistro" class="p-6 space-y-4">
              
              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Observaciones (Subjetivo/Objetivo)</label>
                <textarea 
                  v-model="form.observaciones" 
                  rows="3" 
                  class="w-full rounded-xl border-2 border-gray-200 p-3 focus:border-primary focus:outline-none"
                  placeholder="Signos vitales, motivo de consulta, examen físico..."
                ></textarea>
              </div>
    
              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Diagnóstico</label>
                <input 
                  v-model="form.diagnostico" 
                  type="text" 
                  required
                  class="w-full rounded-xl border-2 border-gray-200 p-3 focus:border-primary focus:outline-none"
                  placeholder="Diagnóstico presuntivo o definitivo"
                />
              </div>
    
              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Tratamiento / Plan</label>
                <textarea 
                  v-model="form.tratamiento" 
                  rows="3" 
                  class="w-full rounded-xl border-2 border-gray-200 p-3 focus:border-primary focus:outline-none"
                  placeholder="Medicamentos, estudios solicitados, indicaciones..."
                ></textarea>
              </div>
    
              <div class="pt-4 flex gap-3">
                <button 
                  type="button" 
                  @click="showModal = false"
                  class="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  :disabled="isSubmitting"
                  class="flex-1 px-4 py-3 rounded-xl bg-green-1 text-white font-bold hover:bg-green-1/90 shadow-lg shadow-green-1/30 disabled:opacity-50"
                >
                  {{ isSubmitting ? 'Guardando...' : 'Guardar Consulta' }}
                </button>
              </div>
            </form>
          </div>
        </div>
    
       </div>
    </template>