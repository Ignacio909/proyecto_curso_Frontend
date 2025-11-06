<script setup>
// Modal genérico para confirmar eliminación
const props = defineProps({
  specialist: {
    type: Object,
    default: null
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  itemType: {
    type: String,
    default: 'registro'
  }
})

const emit = defineEmits(['close', 'confirm'])

const handleConfirm = () => {
  emit('confirm', props.specialist)
}

const handleClose = () => {
  emit('close')
}

// Obtener nombre para mostrar
const displayName = computed(() => {
  return props.specialist?.persona?.usuario || props.specialist?.usuario || 'este registro'
})
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
      <h2 class="text-2xl font-bold mb-4 text-red-600">Confirmar Eliminación</h2>
      
      <p class="text-lg mb-6">
        ¿Está seguro que desea eliminar {{ itemType }} 
        <strong>{{ displayName }}</strong>?
      </p>
      
      <p class="text-sm text-gray-600 mb-6">
        Esta acción no se puede deshacer.
      </p>

      <div class="flex gap-4 justify-end">
        <button
          @click="handleClose"
          class="rounded-md bg-gray-400 px-6 py-2 text-white hover:bg-gray-500 transition"
        >
          Cancelar
        </button>
        <button
          @click="handleConfirm"
          class="rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>
