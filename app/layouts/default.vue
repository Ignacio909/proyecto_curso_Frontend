<script setup>
// No logic needed here anymore, moved to Navbar
</script>

<template>
  <div class="min-h-screen bg-white text-black flex flex-col">
    <Navbar />

    <main class="container mx-auto px-6 py-8 flex-1">
      <NuxtPage />
    </main>

    <footer class="bg-primary text-white mt-auto">
      <div class="container mx-auto px-6 py-4 text-center text-sm">
        2025 Caibh - Todos los derechos reservados
      </div>
    </footer>
  </div>
</template>


