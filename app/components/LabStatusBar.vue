<template>
    <!-- Barra flotante -->
    <div 
        v-if="lab.session || lab.queue"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 
               bg-white dark:bg-gray-900 
               shadow-lg rounded-full border border-gray-200 dark:border-gray-700
               px-5 py-2.5 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
    >
        <div class="flex items-center gap-4">
            
            <!-- Estado con badge -->
            <div class="flex items-center gap-2">
                <UBadge 
                    v-if="lab.session" 
                    color="success" 
                    variant="solid" 
                    class="gap-1.5 px-2.5 py-1"
                >
                    <UIcon name="i-heroicons-play-circle" class="w-4 h-4" />
                    <span>Laboratorio Activo</span>
                </UBadge>

                <UBadge 
                v-else-if="lab.queue" 
                    color="warning" 
                    variant="solid" 
                    class="gap-1.5 px-2.5 py-1"
                >
                    <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                    <span>En cola (#{{ lab.queue.position }})</span>
                </UBadge>
            </div>

            <!-- Separador -->
            <div class="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

            <!-- Tiempo restante (más visible) -->
            <div v-if="lab.session" class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                    <span class="text-xs font-medium">Tiempo restante:</span>
                </div>
                <div class="font-mono text-xl font-bold text-green-600 dark:text-green-400 tracking-wider">
                    {{ formatTime(lab.timeLeft) }}
                </div>
            </div>

            <!-- Mensaje de cola -->
            <div v-else-if="lab.queue" class="text-sm text-gray-600 dark:text-gray-400">
                Esperando turno...
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const lab = useLabStore()

const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* Animación de entrada */
div[class*="fixed"] {
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translate(-50%, 20px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

/* Efecto hover */
div[class*="fixed"]:hover {
    transform: translate(-50%, -2px);
    transition: transform 0.2s ease;
}
</style>