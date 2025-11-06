<script setup>
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <section class="mx-auto w-full max-w-7xl">
    <div class="text-center py-12">
      <h1 class="text-4xl font-bold text-primary mb-8">Panel de Administración</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <NuxtLink 
          to="/pacientes"
          class="block p-8 rounded-lg border-2 border-primary hover:bg-primary hover:text-white transition-all shadow-md"
        >
          <h2 class="text-2xl font-semibold mb-3">Gestionar Pacientes</h2>
          <p class="text-lg">Ver, editar y eliminar pacientes del sistema</p>
        </NuxtLink>

        <NuxtLink 
          to="/especialistas"
          class="block p-8 rounded-lg border-2 border-primary hover:bg-primary hover:text-white transition-all shadow-md"
        >
          <h2 class="text-2xl font-semibold mb-3">Gestionar Especialistas</h2>
          <p class="text-lg">Ver, editar y eliminar especialistas del sistema</p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
