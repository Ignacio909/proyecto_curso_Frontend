<script setup>
definePageMeta({
  layout: 'default',
  auth: true
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { token } = useAuth()

// Usar useFetch para cargar datos (GET) - SSR
const { data: specialists, pending, error, refresh } = await useFetch(`${apiBase}/especialistas`, {
  key: 'specialists-list',
  headers: {
    Authorization: token.value
  }
})

// Estados para modales
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAddModal = ref(false)
const selectedSpecialist = ref(null)

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
    key: 'especialidad', 
    label: 'Especialidad' 
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
  { key: 'especialidad', label: 'Especialidad', type: 'text', required: true }
]

// Configuración de campos para modal de editar
const editFields = [
  { key: 'usuario', label: 'Usuario', type: 'text', required: true },
  { key: 'correo', label: 'Correo', type: 'email', required: true },
  { key: 'especialidad', label: 'Especialidad', type: 'text', required: true },
  { key: 'contrasena', label: 'Nueva Contraseña (opcional)', type: 'password', required: false, placeholder: 'Dejar vacío para no cambiar' }
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
const handleEdit = (specialist) => {
  selectedSpecialist.value = {
    id: specialist.id,
    usuario: specialist.persona?.usuario,
    correo: specialist.persona?.correo,
    especialidad: specialist.especialidad,
    contrasena: ''
  }
  showEditModal.value = true
}

const handleDelete = (specialist) => {
  selectedSpecialist.value = specialist
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
      especialidad: formData.especialidad
    }
    
    // Solo incluir contraseña si se proporcionó
    if (formData.contrasena) {
      payload.contrasena = formData.contrasena
    }

    await $fetch(`${apiBase}/especialistas/${selectedSpecialist.value.id}`, {
      method: 'PUT',
      headers: { Authorization: token.value },
      body: payload
    })
    
    showEditModal.value = false
    await refresh()
    showNotification('Especialista actualizado exitosamente')
  } catch (err) {
    console.error('Error al actualizar especialista:', err)
    showNotification('Error al actualizar especialista', 'error')
  }
}

const confirmDelete = async () => {
  try {
    await $fetch(`${apiBase}/especialistas/${selectedSpecialist.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: token.value }
    })
    
    showDeleteModal.value = false
    await refresh()
    showNotification('Especialista eliminado exitosamente')
  } catch (err) {
    console.error('Error al eliminar especialista:', err)
    showNotification('Error al eliminar especialista', 'error')
  }
}

const saveAdd = async (formData) => {
  try {
    await $fetch(`${apiBase}/especialistas`, {
      method: 'POST',
      headers: { Authorization: token.value },
      body: {
        usuario: formData.usuario,
        correo: formData.correo,
        especialidad: formData.especialidad,
        contrasena: formData.contrasena
      }
    })
    
    showAddModal.value = false
    await refresh()
    showNotification('Especialista agregado exitosamente')
  } catch (err) {
    console.error('Error al agregar especialista:', err)
    showNotification('Error al agregar especialista', 'error')
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
      
      <h1 class="text-3xl font-bold text-primary">Gestionar Especialistas</h1>
      
      <Button 
        label="Agregar Especialista" 
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
      <p class="text-xl text-gray-600">Cargando especialistas...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-xl text-red-600">Error al cargar especialistas: {{ error.message }}</p>
    </div>

    <!-- Table (usando componente genérico) -->
    <div v-else>
      <DataTable 
        :items="specialists || []"
        :columns="tableColumns"
        emptyMessage="No hay especialistas registrados"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Modales (usando componentes genéricos) -->
    <FormModal
      :isOpen="showEditModal"
      title="Editar Especialista"
      :fields="editFields"
      :initialData="selectedSpecialist"
      submitLabel="Guardar Cambios"
      @close="showEditModal = false"
      @submit="saveEdit"
    />

    <FormModal
      :isOpen="showAddModal"
      title="Agregar Nuevo Especialista"
      :fields="addFields"
      submitLabel="Agregar Especialista"
      @close="showAddModal = false"
      @submit="saveAdd"
    />

    <DeleteConfirmModal
      :isOpen="showDeleteModal"
      :specialist="selectedSpecialist"
      itemType="al especialista"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </section>
</template>
