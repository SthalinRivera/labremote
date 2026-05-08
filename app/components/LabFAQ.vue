<!-- components/LabFAQ.vue -->
<script setup lang="ts">
const faqItems = [
    {
        id: 1,
        question: '¿Qué es el laboratorio remoto IoT?',
        answer: 'Es una plataforma educativa que permite acceder y programar dispositivos IoT reales (Jetson Nano, Arduino, ESP32) de forma remota a través de internet. No necesitas tener el hardware físicamente.'
    },
    {
        id: 2,
        question: '¿Cómo funciona el Jetson Nano como servidor principal?',
        answer: 'El Jetson Nano (4GB) actúa como servidor central y nodo principal. Procesa las peticiones, gestiona las conexiones y coordina todos los dispositivos del laboratorio. Está configurado automáticamente con todas las conexiones necesarias.'
    },
    {
        id: 3,
        question: '¿Qué dispositivos puedo utilizar?',
        answer: 'Puedes trabajar con: \n• NVIDIA Jetson Nano (servidor principal)\n• Arduino R3\n• ESP32\n• Cámara en tiempo real\n• Sensores y actuadores conectados a estos dispositivos'
    },
    {
        id: 4,
        question: '¿Qué tipo de proyectos puedo desarrollar?',
        answer: 'Proyectos de visión artificial, control de motores, lectura de sensores, automatización, IoT, robótica, procesamiento de imágenes con IA, y más.'
    },
    {
        id: 5,
        question: '¿Puedo ver lo que está pasando en tiempo real?',
        answer: '¡Sí! Contamos con una cámara en vivo que te permite visualizar los dispositivos y experimentos en tiempo real. Puedes ver cómo tus programas interactúan con el hardware.'
    },
    {
        id: 6,
        question: '¿Necesito instalar algún software?',
        answer: 'No necesitas instalar nada. Todo funciona a través del navegador web. Solo necesitas una conexión a internet y tu cuenta de acceso.'
    },
    {
        id: 7,
        question: '¿La configuración de conexiones es automática?',
        answer: 'Correcto. Todas las conexiones entre el Jetson Nano, Arduino y ESP32 están preconfiguradas y automatizadas. Solo te enfocas en tu código y proyecto.'
    },
    {
        id: 8,
        question: '¿Puedo acceder desde cualquier lugar?',
        answer: 'Sí, el laboratorio es completamente remoto. Puedes acceder desde cualquier lugar con conexión a internet, 24/7.'
    }
]

// Categorizar preguntas
const categories = {
    general: faqItems.slice(0, 3),
    hardware: faqItems.slice(3, 6),
    acceso: faqItems.slice(6, 8)
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
    <div class="max-w-7xl mx-auto py-12 px-4">
        <!-- Header -->
        <div class="text-center mb-12">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <UIcon name="i-lucide-message-circle-question" class="w-4 h-4 text-blue-600" />
                <span class="text-sm font-medium text-blue-600 dark:text-blue-400">FAQ</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Preguntas Frecuentes
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Todo lo que necesitas saber sobre el laboratorio remoto IoT
            </p>
        </div>

        <!-- Categorías -->
        <div class="flex flex-wrap justify-center gap-2 mb-8">
            <UButton
                :color="activeCategory === 'general' ? 'primary' : 'gray'"
                :variant="activeCategory === 'general' ? 'solid' : 'ghost'"
                @click="activeCategory = 'general'"
            >
                <template #leading>
                    <UIcon name="i-lucide-info" />
                </template>
                General
            </UButton>
            <UButton
                :color="activeCategory === 'hardware' ? 'primary' : 'gray'"
                :variant="activeCategory === 'hardware' ? 'solid' : 'ghost'"
                @click="activeCategory = 'hardware'"
            >
                <template #leading>
                    <UIcon name="i-lucide-microchip" />
                </template>
                Hardware
            </UButton>
            <UButton
                :color="activeCategory === 'acceso' ? 'primary' : 'gray'"
                :variant="activeCategory === 'acceso' ? 'solid' : 'ghost'"
                @click="activeCategory = 'acceso'"
            >
                <template #leading>
                    <UIcon name="i-lucide-key" />
                </template>
                Acceso y Conexión
            </UButton>
        </div>

        <!-- Preguntas -->
        <div class="space-y-3">
            <UCard 
                v-for="item in categories[activeCategory as keyof typeof categories]" 
                :key="item.id"
                class="cursor-pointer transition-all duration-200 hover:shadow-md"
                :class="{ 'ring-2 ring-blue-500': openItems.includes(item.id) }"
                @click="toggleItem(item.id)"
            >
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                            {{ item.question }}
                        </h3>
                        <div v-show="openItems.includes(item.id)" class="mt-3">
                            <div class="prose prose-sm dark:prose-invert max-w-none">
                                <p class="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                    {{ item.answer }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <UIcon 
                        :name="openItems.includes(item.id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                        class="w-5 h-5 text-gray-400 flex-shrink-0 mt-1"
                    />
                </div>
            </UCard>
        </div>

        <!-- Botón de ayuda adicional -->
        <div class="text-center mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl">
            <p class="text-gray-700 dark:text-gray-300 mb-4">
                ¿No encontraste lo que buscabas?
            </p>
            <UButton to="/support" color="primary" variant="outline" size="lg">
                <template #leading>
                    <UIcon name="i-lucide-headphones" />
                </template>
                Contactar soporte
            </UButton>
        </div>
    </div>
</template>