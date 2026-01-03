<script setup>
definePageMeta({
  auth: true
})

const { data } = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const displayName = computed(() => data.value?.usuario || 'Usuario')
const displayImage = computed(() => {
  const img = data.value?.imagen
  if (!img) return null
  if (/^https?:\/\//i.test(img)) return img
  return `${apiBase}${img.startsWith('/') ? '' : '/'}${img}`
})
</script>

<template>
  <section class="flex flex-col items-center gap-8">
    <div class="flex flex-col items-center gap-3 mt-6">
      <div class="h-28 w-28 rounded-full bg-primary/20 ring-4 ring-primary/30 overflow-hidden">
        <img v-if="displayImage" :src="displayImage" alt="Avatar" class="h-full w-full object-cover" />
      </div>
      <h2 class="text-2xl font-semibold">Hola {{ displayName }}</h2>
    </div>

    <div class="grid w-full grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-2 mt-4">
      <NuxtLink 
        to="/perfil" 
        class="block p-8 rounded-lg border-2 border-primary hover:bg-primary hover:text-white transition-all shadow-md text-center"
      >
        <h2 class="text-2xl font-semibold">Mi Perfil</h2>
      </NuxtLink>
      
      <NuxtLink 
        to="/citas/add"
        class="block p-8 rounded-lg border-2 border-primary hover:bg-primary hover:text-white transition-all shadow-md text-center"
      >
        <h2 class="text-2xl font-semibold">Agendar Cita</h2>
      </NuxtLink>
      
      <NuxtLink 
        to="/citas/mis-citas"
        class="block p-8 rounded-lg border-2 border-primary hover:bg-primary hover:text-white transition-all shadow-md text-center"
      >
        <h2 class="text-2xl font-semibold">Mis Citas</h2>
      </NuxtLink>
      
      <NuxtLink 
        to="/sobre-nosotros"
        class="block p-8 rounded-lg border-2 border-primary hover:bg-primary hover:text-white transition-all shadow-md text-center"
      >
        <h2 class="text-2xl font-semibold">Sobre Nosotros</h2>
      </NuxtLink>
    </div>
  </section>
</template>


