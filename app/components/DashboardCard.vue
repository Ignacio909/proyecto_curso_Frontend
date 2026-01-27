<script setup>
defineProps({
  to: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <NuxtLink 
    :to="to"
    class="group block p-8 rounded-xl border-2 border-primary bg-white hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1"
  >
    <div class="flex flex-col items-center text-center gap-3">
      <!-- Icon slot or default icon handling could go here if needed in future -->
      <h2 class="text-2xl font-bold group-hover:text-white text-primary transition-colors">
        {{ title }}
      </h2>
      <p v-if="description" class="text-gray-600 group-hover:text-white/90 text-lg transition-colors">
        {{ description }}
      </p>
    </div>
  </NuxtLink>
</template>
