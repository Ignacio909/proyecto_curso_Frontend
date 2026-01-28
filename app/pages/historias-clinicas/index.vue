<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})

const { data:user, token } = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { addToast } = useToast()

// 1. Carga Global
const { data: historias, pending, error, refresh } = await useFetch(`${apiBase}/historias-clinicas`, {
  headers: { Authorization: token.value }
})

// 2. Estados
const expandedRows = ref({})
const loadingRows = ref({})
const showEditModal = ref(false)
const selectedHistoria = ref(null)


// Estados para Registros
const showEditRecordModal = ref(false)
const showDeleteRecordModal = ref(false)
const selectedRecord = ref(null)

// Campos para el FormModal de edición de registros
const recordFields = [
  { key: 'diagnostico', label: 'Diagnóstico', type: 'textarea', required: true },
  { key: 'tratamiento', label: 'Tratamiento', type: 'textarea', required: true },
  { key: 'observaciones', label: 'Observaciones', type: 'textarea' }
]

// 3. Campos para el FormModal (Edición de Historia)
const editFields = [
  { key: 'nombre', label: 'Nombre', type: 'text', required: true },
  { key: 'apellidos', label: 'Apellidos', type: 'text', required: true },
  { key: 'edad', label: 'Edad', type: 'number', required: true },
  { 
    key: 'sexo', 
    label: 'Sexo', 
    type: 'select', 
    options: [
      { value: 'Masculino', label: 'Masculino' },
      { value: 'Femenino', label: 'Femenino' },
      { value: 'Otro', label: 'Otro' }
    ] 
  },
  { key: 'enfermedades', label: 'Enfermedades', type: 'textarea' },
  { key: 'antecedentes', label: 'Antecedentes', type: 'textarea' }
]

const handleEditRecord = (reg) => {
  selectedRecord.value = reg
  showEditRecordModal.value = true
}

const handleDeleteRecordRequest = (reg) => {
  selectedRecord.value = reg
  showDeleteRecordModal.value = true
}

// Guardar cambios del registro
const saveRecordEdit = async (formData) => {
  try {
    await $fetch(`${apiBase}/registros-clinicos/${selectedRecord.value.id}`, {
      method: 'PUT',
      headers: { Authorization: token.value },
      body: formData
    })
    showEditRecordModal.value = false
    addToast({ message: 'Registro actualizado con éxito', type: 'success' })
    // Refrescar solo los registros de esta historia
    const historiaId = selectedRecord.value.historiaClinicaId
    const data = await $fetch(`${apiBase}/registros-clinicos/historia/${historiaId}`, {
        headers: { Authorization: token.value }
    })
    expandedRows.value[historiaId] = data
  } catch (err) {
    addToast({ message: 'No tienes permiso para editar este registro', type: 'error' })
  }
}

// Confirmar eliminación
const confirmDeleteRecord = async () => {
  try {
    const recordId = selectedRecord.value.id
    const historiaId = selectedRecord.value.historiaClinicaId
    
    await $fetch(`${apiBase}/registros-clinicos/${recordId}`, {
      method: 'DELETE',
      headers: { Authorization: token.value }
    })
    
    showDeleteRecordModal.value = false
    // Filtramos localmente para no recargar toda la página
    expandedRows.value[historiaId] = expandedRows.value[historiaId].filter(r => r.id !== recordId)
    addToast({ message: 'Registro eliminado', type: 'success' })
  } catch (err) {
    addToast({ message: 'Error al eliminar el registro', type: 'error' })
  }
}

//  Lógica de Registros 
const toggleRow = async (historiaId) => {
  if (expandedRows.value[historiaId]) {
    delete expandedRows.value[historiaId]
    return
  }

  loadingRows.value[historiaId] = true
  
  try {
    // Si quieres que el "Cargando" sea visible un momento, podrías usar un delay artificial:
    // await new Promise(resolve => setTimeout(resolve, 400)); 
    
    const registros = await $fetch(`${apiBase}/registros-clinicos/historia/${historiaId}`, {
      headers: { Authorization: token.value }
    })
    expandedRows.value[historiaId] = registros
  } catch (err) {
    console.error("Error:", err)
  } finally {
    loadingRows.value[historiaId] = false
  }
}

// 5. Lógica de Edición
const handleEdit = (historia) => {
  selectedHistoria.value = { ...historia }
  showEditModal.value = true
}

const saveEdit = async (formData) => {
  try {
    await $fetch(`${apiBase}/historias-clinicas/${selectedHistoria.value.id}`, {
      method: 'PUT',
      headers: { Authorization: token.value },
      body: formData
    })
    showEditModal.value = false
    await refresh()
    // Aquí podrías disparar un toast de éxito
  } catch (err) {
    alert("Error al actualizar la historia clínica")
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-7xl p-6">
    <div class="mb-8 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-primary">Control Central de Historias</h1>
      <Button label="Refrescar Lista" variant="green-2" size="sm" @click="refresh" />
    </div>

    <div v-if="pending" class="text-center py-10 italic text-gray-400">Sincronizando expedientes...</div>

    <div class="overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
      <table class="w-full text-left">
        <thead class="bg-primary text-white">
          <tr>
            <th class="px-6 py-4">Paciente</th>
            <th class="px-6 py-4">Información</th>
            <th class="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <template v-for="historia in historias" :key="historia.id">
            <tr class="hover:bg-blue-50/30 transition-colors">
              <td class="px-6 py-4 font-bold text-gray-800">
                {{ historia.nombre }} {{ historia.apellidos }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ historia.edad }} años · {{ historia.sexo }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-3">
                  <button 
                    @click="toggleRow(historia.id)"
                    class="text-sm font-bold text-primary hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4"
                  >
                    {{ expandedRows[historia.id] ? 'Cerrar' : 'Ver registros' }}
                  </button>

                  <Button 
                    label="Editar" 
                    variant="green-1" 
                    size="sm" 
                    @click="handleEdit(historia)"
                  />
                </div>
              </td>
            </tr>

            <tr v-if="expandedRows[historia.id] || loadingRows[historia.id]">
              <td colspan="3" class="bg-gray-50 p-6 border-inner shadow-inner">
                <div v-if="loadingRows[historia.id]" class="flex items-center gap-2 text-primary animate-pulse">
                  <span class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  Cargando cronología médica...
                </div>

                <div v-else class="space-y-4">
                  <div v-if="expandedRows[historia.id].length === 0" class="text-gray-400 italic">
                    No existen registros clínicos vinculados a este paciente.
                  </div>
                  <div 
                    v-for="reg in expandedRows[historia.id]" 
                    :key="reg.id"
                    class="bg-white p-4 rounded-lg border border-gray-200"
                  >
                    <div 
                      v-if="reg.especialistaId === user.id || user.rol === 'admin'" 
                      class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <button @click="handleEditRecord(reg)" class="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase">
                        Editar
                      </button>
                      <button @click="handleDeleteRecordRequest(reg)" class="text-red-600 hover:text-red-800 text-xs font-bold uppercase">
                        Eliminar
                      </button>
                    </div>

                    <p>{{ reg.observaciones }}</p>
                    <div class="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                      <span>{{ new Date(reg.createdAt).toLocaleDateString() }}</span>
                      <span class="text-green-600">Registro Clínico</span>
                    </div>
                    <p class="text-gray-800 font-medium leading-relaxed">{{ reg.observaciones }}</p>
                    <div class="mt-2 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-2 rounded">
                      <p><span class="font-bold">Diagnóstico:</span> {{ reg.diagnostico }}</p>
                      <p><span class="font-bold">Tratamiento:</span> {{ reg.tratamiento }}</p>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <FormModal
      :isOpen="showEditModal"
      title="Editar Historia Clínica"
      :fields="editFields"
      :initialData="selectedHistoria"
      submitLabel="Guardar Cambios"
      @close="showEditModal = false"
      @submit="saveEdit"
    />
    <FormModal
      :isOpen="showEditRecordModal"
      title="Editar Registro Clínico"
      :fields="recordFields"
      :initialData="selectedRecord"
      @close="showEditRecordModal = false"
      @submit="saveRecordEdit"
  />

  <DeleteConfirmModal
    :isOpen="showDeleteRecordModal"
    itemType="el registro clínico"
    :itemName="selectedRecord?.diagnostico"
    :item="selectedRecord"
    @confirm="deleteRecord"
    @close="showDeleteRecordModal = false"
  />
  </section>
</template>