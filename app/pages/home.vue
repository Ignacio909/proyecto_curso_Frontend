<script setup>
definePageMeta({
  auth: true
})
</script>

<template>
  <section class="flex flex-col items-center gap-8">
    <div class="flex flex-col items-center gap-3 mt-6">
      <div class="h-28 w-28 rounded-full bg-primary/20 ring-4 ring-primary/30" />
      <h2 class="text-2xl font-semibold">Hola …</h2>
    </div>

    <div class="grid w-full grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-2 mt-4">
      <NuxtLink 
        to="/perfil" 
        class="block p-8 rounded-lg border-2 border-primary hover:bg-primary hover:text-white transition-all shadow-md text-center"
      >
        <h2 class="text-2xl font-semibold">Mi Perfil</h2>
      </NuxtLink>
      
      <NuxtLink 
        to="/citas"
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


