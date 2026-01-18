<<script setup>
  // Regla: Solo especialistas y admins pueden crear historias
  definePageMeta({
      layout: 'default',
      auth: true
  })

  useSeoMeta({
    title: 'Nueva Historia Clínica - Especialista',
    description: 'Formulario de creación de historia clínica para pacientes.',
  })

  const { addToast } = useToast()
  const config = useRuntimeConfig()
  const route = useRoute() // <--- NECESARIO para leer la URL
  const { token } = useAuth()
  const pending = ref(false)
  
  // Estado del formulario
  const form = reactive({
      nombre: '',
      apellidos: '',
      edad: null,
      sexo: '',
      raza: '',
      direccion: '',
      enfermedades: '',
      antecedentes: '',
      // Si viene en la URL, lo usamos por defecto
      pacienteId: route.query.pacienteId || '' 
  })
  
  const opcionesSexo = ['masculino', 'femenino', 'otro']
  
  const handleRegistro = async () => {
    if (!form.pacienteId) {
      return addToast({ title: 'Error', description: 'Debe vincular un paciente', type: 'error' })
    }
  
    pending.value = true
  
    try {
      await $fetch(`${config.public.apiBase}/historias-clinicas`, {
        method: 'POST',
        body: form,
        headers: {                  // <--- 2. AGREGAR ESTO
          Authorization: token.value // Enviamos el token para que el backend sepa que somos especialistas
      }
      })
  
      addToast({ 
        title: 'Éxito', 
        description: 'Historia clínica creada correctamente', 
        type: 'success' 
      })
      
      // Al terminar, volvemos a las citas o al detalle de la historia creada
      // Podrías redirigir a `/atencion/${nuevoId}` si el backend devolviera el ID
      navigateTo('/citas/hoy') // O a donde prefieras
  
    } catch (err) {
      addToast({ 
        title: 'Error', 
        description: err.data?.message || 'No se pudo crear la historia', 
        type: 'error' 
      })
    } finally {
      pending.value = false
    }
  }
</script>
  
<template>
<div class="min-h-screen bg-gray-50 py-10 px-4">
  <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    
    <div class="bg-primary p-6 text-white text-center">
      <h1 class="text-2xl font-bold italic">Nueva Historia Clínica</h1>
      <p class="text-blue-50 opacity-90">Complete los datos médicos del paciente</p>
    </div>

    <form @submit.prevent="handleRegistro" class="p-8 space-y-6">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-700 uppercase">Nombre(s)</label>
          <input v-model="form.nombre" required type="text" class="input-field" placeholder="Ej. Juan" />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-700 uppercase">Apellidos</label>
          <input v-model="form.apellidos" required type="text" class="input-field" placeholder="Ej. Pérez" />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-700 uppercase">Edad</label>
          <input v-model.number="form.edad" required type="number" min="0" class="input-field" />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-700 uppercase">Sexo</label>
          <select v-model="form.sexo" required class="input-field">
            <option value="" disabled>Seleccione...</option>
            <option v-for="opcion in opcionesSexo" :key="opcion" :value="opcion">
              {{ opcion.charAt(0).toUpperCase() + opcion.slice(1) }}
            </option>
          </select>
        </div>
      </div>

      <hr class="border-gray-100" />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-700 uppercase">Raza (Opcional)</label>
          <input v-model="form.raza" type="text" class="input-field" />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-700 uppercase flex justify-between">
              <span>Paciente ID (UUID)</span>
              <span v-if="route.query.pacienteId" class="text-green-600 text-[10px] bg-green-50 px-2 rounded-full">Vinculado Automáticamente</span>
          </label>
          <input 
              v-model="form.pacienteId" 
              required 
              type="text" 
              :disabled="!!route.query.pacienteId" 
              :class="{'bg-gray-100 text-gray-500 cursor-not-allowed': !!route.query.pacienteId}"
              class="input-field font-mono text-sm" 
              placeholder="ID del sistema" 
          />
        </div>

        <div class="md:col-span-2 space-y-2">
          <label class="text-xs font-bold text-gray-700 uppercase">Dirección de Residencia</label>
          <input v-model="form.direccion" type="text" class="input-field" />
        </div>
      </div>

      <div class="space-y-6">
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-700 uppercase text-green-1">Enfermedades Actuales</label>
          <textarea v-model="form.enfermedades" rows="3" class="input-field" placeholder="Describa diagnósticos actuales..."></textarea>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-700 uppercase text-green-1">Antecedentes Familiares/Personales</label>
          <textarea v-model="form.antecedentes" rows="3" class="input-field" placeholder="Describa antecedentes..."></textarea>
        </div>
      </div>

      <div class="pt-6">
        <button 
          type="submit" 
          :disabled="pending"
          class="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="pending">Procesando...</span>
          <span v-else>Guardar Historia Clínica</span>
        </button>
      </div>
    </form>
  </div>
</div>
</template>