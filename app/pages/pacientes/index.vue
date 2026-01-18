<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})

useSeoMeta({
  title: 'Gestión de Pacientes - Administración',
  description: 'Administra el registro de pacientes y sus datos personales.',
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { data: currentUser, token } = useAuth()

// Usar useFetch para cargar datos (GET) - SSR
const { data: patients, pending, error, refresh } = await useFetch(`${apiBase}/pacientes`, {
  key: 'patients-list',
  headers: {
    Authorization: token.value
  }
})

// Estados para modales
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAddModal = ref(false)
const selectedPatient = ref(null)

// Configuración de columnas para la tabla
const tableColumns = [
  { 
    key: 'id', 
    label: 'ID', 
    format: (val) => val?.substring(0, 8) + '...'
  },
  { 
    key: 'persona.usuario', 
    label: 'Usuario' 
  },
  { 
    key: 'persona.correo', 
    label: 'Correo' 
  },
  { 
    key: 'telefono', 
    label: 'Teléfono' 
  },
  { 
    key: 'carnetIdentidad', 
    label: 'Carnet de Identidad' 
  },
  { 
    key: 'persona.imagen', 
    label: 'Imagen',
    type: 'image'
  }
]

// Configuración de campos para modal de agregar
const addFields = [
  { key: 'usuario', label: 'Usuario', type: 'text', required: true },
  { key: 'correo', label: 'Correo', type: 'email', required: true },
  { key: 'contrasena', label: 'Contraseña', type: 'password', required: true },
  { key: 'telefono', label: 'Teléfono', type: 'tel', required: true },
  { key: 'carnetIdentidad', label: 'Carnet de Identidad', type: 'text', required: true }
]

// Configuración de campos para modal de editar
const editFields = [
  { key: 'usuario', label: 'Usuario', type: 'text', required: true },
  { key: 'correo', label: 'Correo', type: 'email', required: true },
  { key: 'contrasena', label: 'Nueva Contraseña (opcional)', type: 'password', required: false, placeholder: 'Dejar vacío para no cambiar' },
  { key: 'telefono', label: 'Teléfono', type: 'tel', required: true },
  { key: 'carnetIdentidad', label: 'Carnet de Identidad', type: 'text', required: true }
]

// Mensajes de notificación
const notification = ref({ show: false, message: '', type: '' })

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Handlers para modales
const handleEdit = (patient) => {
  selectedPatient.value = {
    id: patient.id,
    usuario: patient.persona?.usuario,
    correo: patient.persona?.correo,
    telefono: patient.telefono,
    carnetIdentidad: patient.carnetIdentidad,
    contrasena: ''
  }
  showEditModal.value = true
}

const handleDelete = (patient) => {
  selectedPatient.value = patient
  showDeleteModal.value = true
}

const handleAdd = () => {
  showAddModal.value = true
}

// Acciones con $fetch (POST, PUT, DELETE)
const saveEdit = async (formData) => {
  try {
    const payload = {
      usuario: formData.usuario,
      correo: formData.correo,
      telefono: formData.telefono,
      carnetIdentidad: formData.carnetIdentidad
    }
    
    // Solo incluir contraseña si se proporcionó
    if (formData.contrasena) {
      payload.contrasena = formData.contrasena
    }

    await $fetch(`${apiBase}/pacientes/${selectedPatient.value.id}`, {
      method: 'PUT',
      headers: { Authorization: token.value },
      body: payload
    })
    
    showEditModal.value = false
    await refresh()
    showNotification('Paciente actualizado exitosamente')
  } catch (err) {
    console.error('Error al actualizar paciente:', err)
    showNotification('Error al actualizar paciente', 'error')
  }
}

const confirmDelete = async () => {
  try {
    await $fetch(`${apiBase}/pacientes/${selectedPatient.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: token.value }
    })
    
    showDeleteModal.value = false
    await refresh()
    showNotification('Paciente eliminado exitosamente')
  } catch (err) {
    console.error('Error al eliminar paciente:', err)
    showNotification('Error al eliminar paciente', 'error')
  }
}

const saveAdd = async (formData) => {
  try {
    await $fetch(`${apiBase}/pacientes`, {
      method: 'POST',
      headers: { Authorization: token.value },
      body: {
        usuario: formData.usuario,
        correo: formData.correo,
        contrasena: formData.contrasena,
        telefono: formData.telefono,
        carnetIdentidad: formData.carnetIdentidad
      }
    })
    
    showAddModal.value = false
    await refresh()
    showNotification('Paciente agregado exitosamente')
  } catch (err) {
    console.error('Error al agregar paciente:', err)
    showNotification('Error al agregar paciente', 'error')
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-7xl">
    <!-- Header con botones -->
    <div class="mb-6 flex items-center justify-between">
      <Button 
        label="Volver" 
        variant="green-2"
        to="/admin"
        size="sm"
      />
      
      <h1 class="text-3xl font-bold text-primary">Gestionar Pacientes</h1>
      
      <Button 
        label="Agregar Paciente" 
        variant="green-1"
        size="md"
        :onClick="handleAdd"
      />
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

    <!-- Loading state -->
    <div v-if="pending" class="text-center py-12">
      <p class="text-xl text-gray-600">Cargando pacientes...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-xl text-red-600">Error al cargar pacientes: {{ error.message }}</p>
    </div>

    <!-- Table (usando componente genérico) -->
    <div v-else>
      <DataTable 
        :items="patients || []"
        :columns="tableColumns"
        emptyMessage="No hay pacientes registrados"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Modales (usando componente genérico) -->
    <FormModal
      :isOpen="showEditModal"
      title="Editar Paciente"
      :fields="editFields"
      :initialData="selectedPatient"
      submitLabel="Guardar Cambios"
      @close="showEditModal = false"
      @submit="saveEdit"
    />

    <FormModal
      :isOpen="showAddModal"
      title="Agregar Nuevo Paciente"
      :fields="addFields"
      submitLabel="Agregar Paciente"
      @close="showAddModal = false"
      @submit="saveAdd"
    />

    <DeleteConfirmModal
      :isOpen="showDeleteModal"
      :specialist="selectedPatient"
      itemType="al paciente"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </section>
</template>
