<<script setup>
  // Regla: Solo especialistas y admins pueden crear historias
  definePageMeta({
      layout: 'default',
      auth: true
  })

  useSeoMeta({
    title: 'Nueva Historia Clínica - Especialista',
    description: 'Formulario de creación de historia clínica para pacientes.',
    ogTitle: 'Nueva Historia Clínica',
    ogDescription: 'Gestión eficiente de datos médicos para especialistas.'
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
  <div class="min-h-screen bg-slate-50/50 py-12 px-4">
    <div class="max-w-4xl mx-auto mb-6">
      <NuxtLink to="/citas/hoy" class="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        Regresar al panel
      </NuxtLink>
    </div>

    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
        
        <header class="bg-primary p-8 md:p-10 text-white relative">
          <div class="relative z-10">
            <h1 class="text-3xl font-bold tracking-tight">Nueva Historia Clínica</h1>
            <p class="text-blue-100/80 mt-1 font-medium text-lg">Registro de atención para especialistas</p>
          </div>
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 -translate-y-16 translate-x-16 rounded-full blur-2xl"></div>
        </header>

        <form @submit.prevent="handleRegistro" class="p-8 md:p-12 space-y-12">
          
          <section class="grid grid-cols-1 md:grid-cols-6 gap-x-8 gap-y-6">
            <div class="md:col-span-6 flex items-center gap-3 border-b border-gray-50 pb-4">
              <div class="w-2 h-6 bg-primary rounded-full"></div>
              <h2 class="font-bold text-gray-800 tracking-tight">INFORMACIÓN DEL PACIENTE</h2>
            </div>

            <div class="md:col-span-3 space-y-1.5">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre(s)</label>
              <input v-model="form.nombre" required type="text" :class="inputClass" placeholder="Juan Alberto" />
            </div>

            <div class="md:col-span-3 space-y-1.5">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Apellidos</label>
              <input v-model="form.apellidos" required type="text" :class="inputClass" placeholder="Rodríguez Castro" />
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Edad</label>
              <input v-model.number="form.edad" required type="number" :class="inputClass" />
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Sexo</label>
              <select v-model="form.sexo" required :class="inputClass">
                <option value="" disabled>Seleccionar...</option>
                <option v-for="s in opcionesSexo" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Raza</label>
              <input v-model="form.raza" type="text" :class="inputClass" placeholder="Opcional" />
            </div>
          </section>

          <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-1.5">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                <span>Paciente ID</span>
                <span v-if="route.query.pacienteId" class="text-primary font-bold italic normal-case">Vinculado vía URL</span>
              </label>
              <input v-model="form.pacienteId" required :disabled="!!route.query.pacienteId" :class="[inputClass, 'font-mono text-sm']" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Residencia</label>
              <input v-model="form.direccion" type="text" :class="inputClass" placeholder="Dirección completa" />
            </div>
          </section>

          <section class="space-y-6 bg-gray-50/80 p-6 md:p-8 rounded-2xl border border-gray-100">
            <div class="space-y-2">
              <label class="text-sm font-bold text-green-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Enfermedades Actuales
              </label>
              <textarea v-model="form.enfermedades" rows="3" :class="[inputClass, 'resize-none focus:ring-green-1/10']" placeholder="Escriba aquí los detalles..."></textarea>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-green-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Antecedentes Médicos
              </label>
              <textarea v-model="form.antecedentes" rows="3" :class="[inputClass, 'resize-none focus:ring-green-1/10']" placeholder="Antecedentes familiares o personales..."></textarea>
            </div>
          </section>

          <footer class="flex flex-col md:flex-row gap-4 justify-end items-center border-t border-gray-100 pt-8">
            <Button 
              label="Descartar" 
              variant="green-1" 
              to="/citas/hoy" 
              class="w-full md:w-auto !text-gray-400 hover:!text-red-500"
            />
            <Button 
              type="submit" 
              :label="pending ? 'Guardando...' : 'Guardar Historia'" 
              variant="green-1" 
              size="lg" 
              class="w-full md:w-auto !rounded-xl shadow-lg shadow-primary/20"
              :disabled="pending"
            >
              <template #icon>
                <div v-if="pending" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </template>
            </Button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>