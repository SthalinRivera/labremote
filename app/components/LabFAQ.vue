<!-- components/LabFAQ.vue -->
<script setup lang="ts">
const faqItems = [
  {
    id: 1,
    question: '¿Qué es el laboratorio remoto IoT?',
    answer: 'Es una plataforma educativa que permite acceder y programar dispositivos IoT reales (Jetson Nano, Arduino, ESP32) de forma remota a través de internet. No necesitas tener el hardware físicamente.',
    category: 'general'
  },
  {
    id: 2,
    question: '¿Cómo funciona el Jetson Nano como servidor principal?',
    answer: 'El Jetson Nano (4GB) actúa como servidor central y nodo principal. Procesa las peticiones, gestiona las conexiones y coordina todos los dispositivos del laboratorio. Está configurado automáticamente con todas las conexiones necesarias.',
    category: 'general'
  },
  {
    id: 3,
    question: '¿Qué dispositivos puedo utilizar?',
    answer: 'Puedes trabajar con: \n• NVIDIA Jetson Nano (servidor principal)\n• Arduino R3\n• ESP32\n• Cámara en tiempo real\n• Sensores y actuadores conectados a estos dispositivos',
    category: 'general'
  },
  // Nueva pregunta 1
  {
    id: 9,
    question: '¿Hay límite de tiempo por sesión?',
    answer: 'Cada sesión tiene una duración máxima de 2 horas continuas para garantizar el acceso equitativo. Puedes volver a hacer cola inmediatamente después de finalizar tu sesión.',
    category: 'general'
  },
  {
    id: 4,
    question: '¿Qué tipo de proyectos puedo desarrollar?',
    answer: 'Proyectos de visión artificial, control de motores, lectura de sensores, automatización, IoT, robótica, procesamiento de imágenes con IA, y más.',
    category: 'hardware'
  },
  {
    id: 5,
    question: '¿Puedo ver lo que está pasando en tiempo real?',
    answer: '¡Sí! Contamos con una cámara en vivo que te permite visualizar los dispositivos y experimentos en tiempo real. Puedes ver cómo tus programas interactúan con el hardware.',
    category: 'hardware'
  },
  {
    id: 6,
    question: '¿Necesito instalar algún software?',
    answer: 'No necesitas instalar nada. Todo funciona a través del navegador web. Solo necesitas una conexión a internet y tu cuenta de acceso.',
    category: 'hardware'
  },
  // Nueva pregunta 2
  {
    id: 10,
    question: '¿Puedo compartir mi sesión con otros compañeros?',
    answer: 'Las sesiones son individuales, pero puedes invitar a observar tu trabajo mediante el enlace de vista compartida. Para trabajos colaborativos, contacta con tu instructor.',
    category: 'hardware'
  },
  {
    id: 7,
    question: '¿La configuración de conexiones es automática?',
    answer: 'Correcto. Todas las conexiones entre el Jetson Nano, Arduino y ESP32 están preconfiguradas y automatizadas. Solo te enfocas en tu código y proyecto.',
    category: 'acceso'
  },
  {
    id: 8,
    question: '¿Puedo acceder desde cualquier lugar?',
    answer: 'Sí, el laboratorio es completamente remoto. Puedes acceder desde cualquier lugar con conexión a internet, 24/7.',
    category: 'acceso'
  },
  // Nueva pregunta 3
  {
    id: 11,
    question: '¿Qué sucede si pierdo la conexión a internet durante una práctica?',
    answer: 'El sistema guarda automáticamente tu progreso cada 5 minutos. Al reconectarte, podrás retomar tu trabajo desde el último guardado. Si la desconexión supera los 10 minutos, tu sesión se liberará para otros usuarios.',
    category: 'acceso'
  }
]

// Agrupar por categoría
const categories = {
  general: faqItems.filter(item => item.category === 'general'),
  hardware: faqItems.filter(item => item.category === 'hardware'),
  acceso: faqItems.filter(item => item.category === 'acceso')
}

const activeCategory = ref('general')
const openItems = ref<number[]>([])

const toggleItem = (id: number) => {
  const index = openItems.value.indexOf(id)
  if (index === -1) {
    openItems.value.push(id)
  } else {
    openItems.value.splice(index, 1)
  }
}
</script>

<template>
  <div class=" mx-auto py-10 px-4">
    <!-- Header (legible y proporcionado) -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
        <UIcon name="i-lucide-message-circle-question" class="w-4 h-4 text-blue-600" />
        <span class="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">FAQ</span>
      </div>
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Preguntas Frecuentes
      </h2>
      <p class="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
        Todo lo que necesitas saber sobre el laboratorio remoto IoT
      </p>
    </div>

    <!-- Categorías (botones normales) -->
    <div class="flex flex-wrap justify-center gap-2 mb-8">
      <UButton
        :color="activeCategory === 'general' ? 'primary' : 'gray'"
        :variant="activeCategory === 'general' ? 'solid' : 'ghost'"
        size="md"
        @click="activeCategory = 'general'"
      >
        <template #leading>
          <UIcon name="i-lucide-info" class="w-4 h-4" />
        </template>
        General
      </UButton>
      <UButton
        :color="activeCategory === 'hardware' ? 'primary' : 'gray'"
        :variant="activeCategory === 'hardware' ? 'solid' : 'ghost'"
        size="md"
        @click="activeCategory = 'hardware'"
      >
        <template #leading>
          <UIcon name="i-lucide-microchip" class="w-4 h-4" />
        </template>
        Hardware
      </UButton>
      <UButton
        :color="activeCategory === 'acceso' ? 'primary' : 'gray'"
        :variant="activeCategory === 'acceso' ? 'solid' : 'ghost'"
        size="md"
        @click="activeCategory = 'acceso'"
      >
        <template #leading>
          <UIcon name="i-lucide-key" class="w-4 h-4" />
        </template>
        Acceso y Conexión
      </UButton>
    </div>

    <!-- Lista de preguntas (acordeón) -->
    <div class="space-y-3">
      <UCard
        v-for="item in categories[activeCategory as keyof typeof categories]"
        :key="item.id"
        :ui="{ body: { padding: 'p-4' } }"
        class="cursor-pointer transition-all duration-200 hover:shadow-md"
        :class="{ 'ring-1 ring-primary-500 dark:ring-primary-400': openItems.includes(item.id) }"
        @click="toggleItem(item.id)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <!-- Pregunta: tamaño normal (text-base) -->
            <h3 class="text-base font-semibold text-gray-900 dark:text-white leading-tight">
              {{ item.question }}
            </h3>
            <!-- Respuesta: tamaño normal (text-sm) y aparece sin alterar el padding -->
            <div v-show="openItems.includes(item.id)" class="mt-3">
              <p class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {{ item.answer }}
              </p>
            </div>
          </div>
          <UIcon
            :name="openItems.includes(item.id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 transition-transform"
          />
        </div>
      </UCard>
    </div>

    <!-- Bloque de ayuda adicional (compacto pero legible) -->
    <div class="text-center mt-10 p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
      <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
        ¿No encontraste lo que buscabas?
      </p>
      <UButton to="/dashboard/feedback-support" color="primary" variant="outline" size="md">
        <template #leading>
          <UIcon name="i-lucide-headphones" class="w-4 h-4" />
        </template>
        Contactar soporte
      </UButton>
    </div>
  </div>
</template>