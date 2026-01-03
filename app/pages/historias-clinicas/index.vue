<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})

const { data: currentUser, token } = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { addToast } = useToast()

const especialistaId = computed(() => currentUser.value?.id)

// Cargar historias clínicas (pacientes con registros)
const { data: historias, pending, refresh } = await useFetch(
  () => especialistaId.value ? `${apiBase}/historias-clinicas/especialista/${especialistaId.value}` : null,
  {
    immediate: !!especialistaId.value,
    watch: [especialistaId],
    headers: {
      Authorization: token.value || ''
    }
  }
)

const expandedRows = ref({})

const toggleRow = async (historiaId) => {
  // Si ya está expandido, colapsar
  if (expandedRows.value[historiaId]) {
    delete expandedRows.value[historiaId]
    return
  }

  // Si no, cargar detalles y expandir
  try {
    const { data: registros } = await useFetch(`${apiBase}/registros-clinicos/historia/${historiaId}`, {
      headers: {
        Authorization: token.value || ''
      }
    })
    expandedRows.value = { ...expandedRows.value, [historiaId]: registros.value }
  } catch (err) {
    console.error('Error cargando registros:', err)
    addToast('Error al cargar detalles', 'error')
  }
}

const handleDelete = async (id) => {
  if (!confirm('¿Está seguro de eliminar esta historia clínica?')) return

  try {
    await $fetch(`${apiBase}/historias-clinicas/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token.value || ''
      }
    })
    addToast('Historia clínica eliminada')
    refresh()
  } catch (err) {
    console.error('Error eliminando historia:', err)
    addToast('Error al eliminar', 'error')
  }
}

const handleEdit = (id) => {
    addToast('Funcionalidad de editar historia pendiente', 'info')
}
</script>

<template>
  <section class="mx-auto w-full max-w-6xl px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-primary">Historias Clínicas</h1>
      <NuxtLink to="/historias-clinicas/add">
        <Button 
          label="Nueva Historia Clínica" 
          variant="green-1"
          class="cursor-pointer"
          @click="navigateTo('/historias-clinicas/add')"       
        />
      </NuxtLink>
      
    </div>

    <div v-if="pending" class="text-center py-12">
      <p class="text-xl text-gray-600">Cargando historias...</p>
    </div>

    <div v-else-if="!historias || historias.length === 0" class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <p class="text-xl text-gray-500">No hay historias clínicas registradas.</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-primary text-white">
          <tr>
            <th class="p-4 w-10"></th> <!-- Flecha expandir -->
            <th class="p-4 font-semibold">Paciente</th>
            <th class="p-4 font-semibold">Edad/Sexo</th>
            <th class="p-4 font-semibold">Enfermedades</th>
            <th class="p-4 font-semibold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <template v-for="historia in historias" :key="historia.id">
            <!-- Fila Principal -->
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="p-4 text-center cursor-pointer" @click="toggleRow(historia.id)">
                <span 
                  class="inline-block transform transition-transform duration-200 text-gray-500"
                  :class="expandedRows[historia.id] ? 'rotate-90' : ''"
                >
                  ▶
                </span>
              </td>
              <td class="p-4">
                <div class="font-bold">{{ historia.nombre }} {{ historia.apellidos }}</div>
                <div class="text-sm text-gray-500">ID: {{ historia.pacienteId?.slice(0,8) }}</div>
              </td>
              <td class="p-4">
                {{ historia.edad }} años / {{ historia.sexo }}
              </td>
              <td class="p-4 max-w-xs truncate" :title="historia.enfermedades">
                {{ historia.enfermedades || 'Ninguna' }}
              </td>
              <td class="p-4">
                <div class="flex justify-center gap-2">
                  <Button 
                    label="Editar" 
                    variant="green-2"
                    size="sm"
                    @click="handleEdit(historia.id)"
                  />
                  <Button 
                    label="Eliminar" 
                    variant="danger"
                    size="sm"
                    @click="handleDelete(historia.id)"
                  />
                </div>
              </td>
            </tr>

            <!-- Fila Expandida (Registros Clínicos) -->
            <tr v-if="expandedRows[historia.id]" class="bg-gray-50">
              <td colspan="5" class="p-4 pl-12">
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-bold text-lg mb-3 text-gray-700">Registros Clínicos</h3>
                  
                  <div v-if="!expandedRows[historia.id] || expandedRows[historia.id].length === 0" class="py-2 text-gray-500 italic">
                    No hay registros clínicos para esta historia.
                  </div>

                  <div v-else class="space-y-3">
                    <div 
                      v-for="registro in expandedRows[historia.id]" 
                      :key="registro.id"
                      class="bg-white p-3 rounded border border-gray-200 shadow-sm"
                    >
                      <div class="flex justify-between mb-1">
                        <span class="font-semibold text-primary">Fecha: {{ new Date(registro.createdAt).toLocaleDateString() }}</span>
                        <span class="text-xs text-gray-400">{{ registro.id }}</span>
                      </div>
                      <p class="text-gray-700">{{ registro.observaciones }}</p>
                      <div class="mt-2 text-sm text-gray-600">
                        <span class="font-medium">Diagnóstico:</span> {{ registro.diagnostico }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="mt-4">
                    <Button 
                      label="+ Agregar Registro" 
                      variant="outline"
                      size="sm"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>
