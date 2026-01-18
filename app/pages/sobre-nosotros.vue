<script setup>
definePageMeta({
  auth: false
})

useSeoMeta({
  title: 'Sobre Nosotros - CAIBH',
  description: 'Conoce nuestra misión, visión y valores. Centro de Atención Integral para el Bienestar Humano.',
  ogTitle: 'Sobre Nosotros - CAIBH',
  ogDescription: 'Somos un equipo multidisciplinario comprometido con tu salud mental y bienestar.',
})

useSchemaOrg([
  defineOrganization({
    name: 'CAIBH',
    logo: '/logo WEB CAIBH.webp',
    sameAs: [
      'https://facebook.com/caibh',
      'https://instagram.com/caibh'
    ]
  })
])
</script>

<template>
  <section class="mx-auto w-full max-w-6xl py-8">
    <!-- Botón Volver -->
    <div class="mb-8">
      <Button 
        label="Volver" 
        variant="green-2"
        to="/home"
        size="sm"
      />
    </div>

    <!-- Header -->
    <div class="bg-primary text-white rounded-lg p-8 mb-8 text-center shadow-lg">
      <h1 class="text-4xl font-bold mb-4">Sobre Nosotros</h1>
      <p class="text-xl">Centro de Atención Integral para el Bienestar Humano</p>
    </div>

    <!-- Misión y Visión -->
    <div class="grid md:grid-cols-2 gap-8 mb-8">
      <!-- Misión -->
      <div class="bg-white rounded-lg border-2 border-primary p-6 shadow-md hover:shadow-xl transition">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-green-1 rounded-full flex items-center justify-center">
            <span class="text-2xl text-white">🎯</span>
          </div>
          <h2 class="text-2xl font-bold text-primary">Nuestra Misión</h2>
        </div>
        <p class="text-gray-700 text-lg leading-relaxed">
          Brindar atención integral de calidad en salud mental y bienestar humano, 
          promoviendo el desarrollo personal y la mejora de la calidad de vida de 
          nuestros pacientes mediante servicios especializados y personalizados.
        </p>
      </div>

      <!-- Visión -->
      <div class="bg-white rounded-lg border-2 border-primary p-6 shadow-md hover:shadow-xl transition">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-green-2 rounded-full flex items-center justify-center">
            <span class="text-2xl text-white">👁️</span>
          </div>
          <h2 class="text-2xl font-bold text-primary">Nuestra Visión</h2>
        </div>
        <p class="text-gray-700 text-lg leading-relaxed">
          Ser el centro de referencia en atención integral del bienestar humano, 
          reconocidos por nuestra excelencia profesional, trato humanizado y 
          compromiso con la salud mental de nuestra comunidad.
        </p>
      </div>
    </div>

    <!-- Valores -->
    <div class="bg-white rounded-lg border-2 border-primary p-8 mb-8 shadow-md">
      <h2 class="text-3xl font-bold text-primary mb-6 text-center">Nuestros Valores</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-1 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-3xl text-white">💚</span>
          </div>
          <h3 class="text-xl font-semibold text-primary mb-2">Empatía</h3>
          <p class="text-gray-600">Comprendemos y nos conectamos con las necesidades de cada paciente.</p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-3xl text-white">🔒</span>
          </div>
          <h3 class="text-xl font-semibold text-primary mb-2">Confidencialidad</h3>
          <p class="text-gray-600">Respetamos la privacidad y confidencialidad de toda la información.</p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-green-2 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-3xl text-white">⭐</span>
          </div>
          <h3 class="text-xl font-semibold text-primary mb-2">Excelencia</h3>
          <p class="text-gray-600">Nos esforzamos por ofrecer la más alta calidad en nuestros servicios.</p>
        </div>
      </div>
    </div>

    <!-- Servicios -->
    <div class="bg-white rounded-lg border-2 border-primary p-8 mb-8 shadow-md">
      <h2 class="text-3xl font-bold text-primary mb-6 text-center">Nuestros Servicios</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="flex items-start gap-3">
          <span class="text-green-1 text-2xl">✓</span>
          <div>
            <h4 class="font-semibold text-lg text-primary">Psicología Clínica</h4>
            <p class="text-gray-600">Atención psicológica individualizada para niños, adolescentes y adultos.</p>
          </div>
        </div>
        
        <div class="flex items-start gap-3">
          <span class="text-green-1 text-2xl">✓</span>
          <div>
            <h4 class="font-semibold text-lg text-primary">Psicopedagogía</h4>
            <p class="text-gray-600">Evaluación y tratamiento de dificultades de aprendizaje.</p>
          </div>
        </div>
        
        <div class="flex items-start gap-3">
          <span class="text-green-1 text-2xl">✓</span>
          <div>
            <h4 class="font-semibold text-lg text-primary">Terapia Familiar</h4>
            <p class="text-gray-600">Fortalecimiento de vínculos y resolución de conflictos familiares.</p>
          </div>
        </div>
        
        <div class="flex items-start gap-3">
          <span class="text-green-1 text-2xl">✓</span>
          <div>
            <h4 class="font-semibold text-lg text-primary">Orientación Vocacional</h4>
            <p class="text-gray-600">Acompañamiento en la elección de carrera profesional.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Equipo -->
    <div class="bg-gradient-to-r from-primary to-green-1 text-white rounded-lg p-8 text-center shadow-lg">
      <h2 class="text-3xl font-bold mb-4">Nuestro Equipo</h2>
      <p class="text-lg mb-6">
        Contamos con un equipo multidisciplinario de profesionales altamente calificados 
        y comprometidos con tu bienestar.
      </p>
      <div class="grid md:grid-cols-3 gap-6">
        <div>
          <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-4xl">👨‍⚕️</span>
          </div>
          <h3 class="font-semibold text-xl">Psicólogos</h3>
          <p class="text-sm opacity-90">Especializados en diversas áreas</p>
        </div>
        
        <div>
          <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-4xl">👩‍🏫</span>
          </div>
          <h3 class="font-semibold text-xl">Psicopedagogos</h3>
          <p class="text-sm opacity-90">Expertos en aprendizaje</p>
        </div>
        
        <div>
          <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-4xl">🤝</span>
          </div>
          <h3 class="font-semibold text-xl">Terapeutas</h3>
          <p class="text-sm opacity-90">Enfoque humanizado</p>
        </div>
      </div>
    </div>

    <!-- Contacto -->
    <div class="mt-8 bg-white rounded-lg border-2 border-primary p-8 shadow-md">
      <h2 class="text-3xl font-bold text-primary mb-6 text-center">Contáctanos</h2>
      <div class="grid md:grid-cols-2 gap-6 text-center md:text-left">
        <div class="flex items-center justify-center md:justify-start gap-3">
          <div class="w-12 h-12 bg-green-1 rounded-full flex items-center justify-center">
            <span class="text-2xl text-white">📧</span>
          </div>
          <div>
            <p class="font-semibold text-primary">Email</p>
            <p class="text-gray-600">contacto@caibh.com</p>
          </div>
        </div>
        
        <div class="flex items-center justify-center md:justify-start gap-3">
          <div class="w-12 h-12 bg-green-1 rounded-full flex items-center justify-center">
            <span class="text-2xl text-white">📞</span>
          </div>
          <div>
            <p class="font-semibold text-primary">Teléfono</p>
            <p class="text-gray-600">+591 77123456</p>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-8">
        <Button 
          label="Agendar una Cita" 
          variant="green-1"
          to="/citas/add"
          size="lg"
        />
      </div>
    </div>
  </section>
</template>
