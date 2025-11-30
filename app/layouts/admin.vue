<script setup>
const { signOut } = useAuth()
const onSignOut = async () => { try { await signOut(); navigateTo('/') } catch (e) {} }
</script>

<template>
  <div class="min-h-screen bg-white text-black flex flex-col">
    <header class="bg-primary text-white">
      <nav class="container mx-auto flex items-center px-6 py-4">
        <!-- Logo y nombre a la izquierda -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <img 
            src="/logo WEB CAIBH.webp" 
            alt="Logo CAIBH" 
            class="h-10 w-10 object-contain"
          />
          <NuxtLink to="/admin" class="text-base font-semibold whitespace-nowrap">
            Centro Atencion Integral para el Bienestar Humano
          </NuxtLink>
        </div>

        <!-- Admin menu centrado -->
        <ul class="flex items-center gap-8 text-lg flex-1 justify-center">
          <li><NuxtLink to="/admin/perfil" class="hover:underline">Mi Perfil</NuxtLink></li>
          <li><NuxtLink to="/pacientes" class="hover:underline">Gestionar Pacientes</NuxtLink></li>
          <li><NuxtLink to="/especialistas" class="hover:underline">Gestionar Especialistas</NuxtLink></li>
        </ul>

        <!-- Botón a la derecha -->
        <div class="flex-shrink-0">
          <Button 
            label="Cerrar Sesión" 
            variant="green-1"
            :onClick="onSignOut"
            size="sm"
          />
        </div>
      </nav>
    </header>

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
