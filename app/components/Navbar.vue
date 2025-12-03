<script setup>
const { data, status, signOut } = useAuth()
const role = computed(() => data.value?.rol)
const onSignOut = async () => { try { await signOut(); navigateTo('/') } catch (e) {} }
</script>

<template>
  <header class="bg-primary text-white">
    <nav class="container mx-auto flex items-center px-6 py-4">
      <!-- Logo y nombre a la izquierda -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <img 
          src="/logo WEB CAIBH.webp" 
          alt="Logo CAIBH" 
          class="h-10 w-10 object-contain"
        />
        <NuxtLink to="/home" class="text-base font-semibold whitespace-nowrap">
          Centro Atencion Integral para el Bienestar Humano
        </NuxtLink>
      </div>

      <!-- Patient menu centrado -->
      <ul v-if="role === 'paciente'" class="flex items-center gap-8 text-lg flex-1 justify-center">
        <li><NuxtLink to="/perfil" class="hover:underline">Mi Perfil</NuxtLink></li>
        <li><NuxtLink to="/citas/mis-citas" class="hover:underline">Mis Citas</NuxtLink></li>
        <li><NuxtLink to="/citas/add" class="hover:underline">Agendar Cita</NuxtLink></li>
        <li><NuxtLink to="/sobre-nosotros" class="hover:underline">Sobre Nosotros</NuxtLink></li>
      </ul>
      <ul v-else-if="role === 'especialista'" class="flex items-center gap-8 text-lg flex-1 justify-center">
        <li><NuxtLink to="/perfil" class="hover:underline">Mi Perfil</NuxtLink></li>
        <li><NuxtLink to="/pacientes" class="hover:underline">Pacientes</NuxtLink></li>
        <li><NuxtLink to="/citas/mis-citas" class="hover:underline">Mis Citas</NuxtLink></li>
      </ul>
      <ul v-else-if="role === 'admin'" class="flex items-center gap-8 text-lg flex-1 justify-center">
        <li><NuxtLink to="/admin" class="hover:underline">Administración</NuxtLink></li>
      </ul>
      <div v-else class="flex-1" />

      <!-- Botón a la derecha -->
      <div class="flex-shrink-0">
        <Button v-if="status === 'authenticated'"
          label="Cerrar Sesión" 
          variant="green-1"
          :onClick="onSignOut"
          size="sm"
        />
        <Button v-else
          label="Iniciar Sesión" 
          variant="green-1"
          to="/"
          size="sm"
        />
      </div>
    </nav>
  </header>
</template>
