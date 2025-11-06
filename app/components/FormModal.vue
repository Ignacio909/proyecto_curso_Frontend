<script setup>
// Modal genérico para formularios (Add/Edit)
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  fields: {
    type: Array,
    required: true
    // Ejemplo: [{ key: 'usuario', label: 'Usuario', type: 'text', required: true }]
  },
  initialData: {
    type: Object,
    default: null
  },
  submitLabel: {
    type: String,
    default: 'Guardar'
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({})

// Inicializar formData cuando se abre el modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    formData.value = {}
    props.fields.forEach(field => {
      if (props.initialData && field.key in props.initialData) {
        formData.value[field.key] = props.initialData[field.key]
      } else {
        formData.value[field.key] = ''
      }
    })
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('submit', { ...formData.value })
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-6 text-primary">{{ title }}</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-for="field in fields" :key="field.key">
          <label class="block text-lg mb-2">{{ field.label }}:</label>
          
          <!-- Select -->
          <select
            v-if="field.type === 'select'"
            v-model="formData[field.key]"
            :required="field.required"
            class="w-full rounded-md border-2 border-black px-4 py-3 focus:outline-none focus:border-primary"
          >
            <option value="">Seleccione una opción</option>
            <option v-for="option in field.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.key]"
            :required="field.required"
            :placeholder="field.placeholder"
            rows="3"
            class="w-full rounded-md border-2 border-black px-4 py-3 focus:outline-none focus:border-primary"
          />

          <!-- Input normal -->
          <input
            v-else
            v-model="formData[field.key]"
            :type="field.type || 'text'"
            :required="field.required"
            :placeholder="field.placeholder"
            class="w-full rounded-md border-2 border-black px-4 py-3 focus:outline-none focus:border-primary"
          />
        </div>

        <div class="flex gap-4 justify-end pt-4">
          <button
            type="button"
            @click="handleClose"
            class="rounded-md bg-gray-400 px-6 py-2 text-white hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-md bg-green-1 px-6 py-2 text-white hover:bg-green-2 transition"
          >
            {{ submitLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
