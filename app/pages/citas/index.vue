<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})

useSeoMeta({
  title: 'Gestión de Citas - Administración',
  description: 'Visualiza y administra todas las citas médicas del sistema.',
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { token } = useAuth()

// 1. Cargar Datos (SSR)
const { data: citas, pending, error, refresh } = await useFetch(`${apiBase}/citas`, {
  key: 'admin-citas-list',
  headers: {
    Authorization: token.value
  }
})

// 2. Estados para Modales y Notificaciones
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedCita = ref(null)
const notification = ref({ show: false, message: '', type: '' })

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => { notification.value.show = false }, 3000)
}

// 3. Configuración de Columnas (Omitiendo ID como solicitaste)
const tableColumns = [
  { 
    key: 'fecha', 
    label: 'Fecha',
    format: (val) => new Date(val).toLocaleDateString()
  },
  { 
    key: 'hora', 
    label: 'Hora' 
  },
  { 
    key: 'paciente.persona.usuario', 
    label: 'Paciente',
    // Fallback por si la relación viene anidada diferente
    format: (val, item) => item.paciente?.persona?.usuario || 'N/A'
  },
  { 
    key: 'especialista.persona.usuario', 
    label: 'Especialista',
    format: (val, item) => item.especialista?.persona?.usuario || 'N/A'
  },
  { 
    key: 'estado', 
    label: 'Estado',
    // Podrías añadir lógica de colores aquí si tu DataTable lo soporta
  }
]

// 4. Configuración de campos para edición (Solo estado y fecha/hora)
const editFields = [
  { key: 'fecha', label: 'Fecha', type: 'date', required: true },
  { key: 'hora', label: 'Hora', type: 'time', required: true },
  { 
    key: 'estado', 
    label: 'Estado', 
    type: 'select', 
    required: true,
    options: [
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'completada', label: 'Completada' },
      { value: 'cancelada', label: 'Cancelada' }
    ]
  }
]

// 5. Handlers de Acciones
const handleEdit = (cita) => {
  selectedCita.value = {
    id: cita.id,
    fecha: cita.fecha,
    hora: cita.hora,
    estado: cita.estado,
    pacienteId: cita.pacienteId,
    especialistaId: cita.especialistaId
  }
  showEditModal.value = true
}

const handleDelete = (cita) => {
  selectedCita.value = cita
  showDeleteModal.value = true
}

const saveEdit = async (formData) => {
  try {
    await $fetch(`${apiBase}/citas/${selectedCita.value.id}`, {
      method: 'PUT',
      headers: { Authorization: token.value },
      body: formData
    })
    showEditModal.value = false
    await refresh()
    showNotification('Cita actualizada correctamente')
  } catch (err) {
    showNotification('Error al actualizar la cita', 'error')
  }
}

const confirmDelete = async () => {
  try {
    await $fetch(`${apiBase}/citas/${selectedCita.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: token.value }
    })
    showDeleteModal.value = false
    await refresh()
    showNotification('Cita eliminada exitosamente')
  } catch (err) {
    showNotification('Error al eliminar la cita', 'error')
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-7xl">
    <div class="mb-6 flex items-center justify-between">
      <Button 
        label="Volver" 
        variant="green-2"
        to="/admin"
        size="sm"
      />
      
      <h1 class="text-3xl font-bold text-primary">Gestión Global de Citas</h1>
      
      <div class="w-32"></div>
    </div>

    <div 
      v-if="notification.show" 
      :class="[
        'mb-4 rounded-md p-4 text-white transition-all',
        notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
      ]"
    >
      {{ notification.message }}
    </div>

    <div v-if="pending" class="text-center py-12">
      <p class="text-xl text-gray-600 italic">Obteniendo agenda del sistema...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <div class="bg-red-50 border border-red-200 p-6 rounded-lg inline-block">
        <p class="text-red-600 font-semibold">Error de conexión con el servidor</p>
        <p class="text-sm text-red-500">{{ error.message }}</p>
        <Button label="Reintentar" variant="green-1" class="mt-4" @click="refresh" />
      </div>
    </div>

    <div v-else>
      <DataTable 
        :items="citas || []"
        :columns="tableColumns"
        emptyMessage="No se han encontrado citas registradas en el sistema."
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <FormModal
      :isOpen="showEditModal"
      title="Re-programar o Cambiar Estado"
      :fields="editFields"
      :initialData="selectedCita"
      submitLabel="Actualizar Cita"
      @close="showEditModal = false"
      @submit="saveEdit"
    />

    <DeleteConfirmModal
        :isOpen="showDeleteModal"
        itemType="la cita del día"
        :itemName="selectedCita?.fecha" 
        :item="selectedCita"
        @confirm="confirmDelete"
        @close="showDeleteModal = false"
    />
  </section>
</template>