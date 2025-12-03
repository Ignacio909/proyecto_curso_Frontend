<script setup>
const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-6 py-4 rounded-lg shadow-lg text-white font-semibold flex items-center gap-3 min-w-[300px] transform transition-all duration-300',
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        ]"
      >
        <!-- Iconos simples -->
        <span v-if="toast.type === 'success'" class="text-xl">✓</span>
        <span v-else class="text-xl">✕</span>
        
        <p class="flex-1">{{ toast.message }}</p>
        
        <button 
          @click="removeToast(toast.id)"
          class="text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
