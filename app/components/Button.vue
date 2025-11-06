<script setup>
const props = defineProps({
  // Texto del botón
  label: {
    type: String,
    required: true
  },
  // Ruta a la que navega (opcional)
  to: {
    type: String,
    default: null
  },
  // Tipo de botón (button, submit, etc)
  type: {
    type: String,
    default: 'button'
  },
  // Color del botón: 'primary', 'green-1', 'green-2'
  variant: {
    type: String,
    default: 'green-1',
    validator: (value) => ['primary', 'green-1', 'green-2'].includes(value)
  },
  // Tamaño: 'sm', 'md', 'lg'
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // Posición absoluta (opcional)
  position: {
    type: String,
    default: null,
    validator: (value) => !value || ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
  // Función personalizada (opcional)
  onClick: {
    type: Function,
    default: null
  }
})

const handleClick = () => {
  // Si es tipo submit, no hacer nada (dejar que el formulario maneje el submit)
  if (props.type === 'submit') {
    return
  }
  
  if (props.onClick) {
    props.onClick()
  } else if (props.to) {
    navigateTo(props.to)
  }
}

const variantClasses = {
  'primary': 'bg-primary hover:bg-primary/90',
  'green-1': 'bg-green-1 hover:bg-green-2',
  'green-2': 'bg-green-2 hover:bg-green-1'
}

const sizeClasses = {
  'sm': 'px-4 py-2 text-sm',
  'md': 'px-6 py-2 text-base',
  'lg': 'px-8 py-3 text-lg'
}

const positionClasses = {
  'top-left': 'absolute top-4 left-4',
  'top-right': 'absolute top-4 right-4',
  'bottom-left': 'absolute bottom-4 left-4',
  'bottom-right': 'absolute bottom-4 right-4'
}

const classes = [
  'rounded-md',
  'text-white',
  'shadow-sm',
  'transition',
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.position ? positionClasses[props.position] : ''
].filter(Boolean).join(' ')
</script>

<template>
  <button
    :type="type"
    :class="classes"
    @click="handleClick"
  >
    {{ label }}
  </button>
</template>

