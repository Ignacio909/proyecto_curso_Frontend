<script setup>
// Componente genérico de tabla reutilizable
const props = defineProps({
  // Datos a mostrar
  items: {
    type: Array,
    required: true
  },
  // Configuración de columnas
  columns: {
    type: Array,
    required: true
    // Ejemplo: [{ key: 'id', label: 'ID', format: (val) => val.substring(0, 8) }]
  },
  // Texto cuando no hay datos
  emptyMessage: {
    type: String,
    default: 'No hay datos registrados'
  }
})

const emit = defineEmits(['edit', 'delete'])

const handleEdit = (item) => {
  emit('edit', item)
}

const handleDelete = (item) => {
  emit('delete', item)
}

// Función para obtener valor anidado (ej: 'persona.usuario')
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}
</script>

<template>
  <div class="overflow-x-auto rounded-md border border-black/50">
    <table class="w-full text-left">
      <thead class="bg-primary text-white">
        <tr>
          <th 
            v-for="column in columns" 
            :key="column.key"
            class="px-6 py-4 text-lg font-semibold"
            :class="column.align === 'center' ? 'text-center' : ''"
          >
            {{ column.label }}
          </th>
          <th class="px-6 py-4 text-lg font-semibold text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="item in items" 
          :key="item.id"
          class="border-b border-black/20 hover:bg-gray-50 transition"
        >
          <td 
            v-for="column in columns" 
            :key="column.key"
            class="px-6 py-4"
            :class="column.align === 'center' ? 'text-center' : ''"
          >
            <!-- Si es imagen -->
            <div v-if="column.type === 'image'">
              <img 
                v-if="getNestedValue(item, column.key)" 
                :src="getNestedValue(item, column.key)" 
                alt="Profile" 
                class="h-10 w-10 rounded-full object-cover"
              />
              <span v-else class="text-gray-400">Sin imagen</span>
            </div>
            <!-- Si tiene formato personalizado -->
            <span v-else-if="column.format">
              {{ column.format(getNestedValue(item, column.key), item) }}
            </span>
            <!-- Valor normal -->
            <span v-else>
              {{ getNestedValue(item, column.key) || 'N/A' }}
            </span>
          </td>
          <td class="px-6 py-4">
            <div class="flex gap-3 justify-center">
              <button 
                @click="handleEdit(item)"
                class="rounded-md bg-primary px-4 py-2 text-white text-sm hover:bg-primary/90 transition"
              >
                Editar
              </button>
              <button 
                @click="handleDelete(item)"
                class="rounded-md bg-red-600 px-4 py-2 text-white text-sm hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td :colspan="columns.length + 1" class="px-6 py-8 text-center text-gray-500">
            {{ emptyMessage }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
