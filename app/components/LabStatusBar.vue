<template>
    <!-- Componente que se adapta: normal en sidebar o flotante arriba cuando es pequeño -->
    
    <!-- Versión flotante centrada arriba (cuando el sidebar es muy pequeño) -->
    <div 
        v-if="(lab.session || lab.queue) && isSidebarCollapsed"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-50 
               bg-white dark:bg-gray-900 
               shadow-lg rounded-full border border-gray-200 dark:border-gray-700
               px-4 py-2 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
    >
        <div class="flex items-center gap-3">
            <!-- Badge de estado -->
            <UBadge 
                v-if="lab.session" 
                color="success" 
                variant="solid" 
                class="gap-1 px-2 py-1 text-xs"
            >
                <UIcon name="i-heroicons-play-circle" class="w-3.5 h-3.5" />
                <span>Laboratorio Activo</span>
            </UBadge>

            <UBadge 
                v-else-if="lab.queue" 
                color="warning" 
                variant="solid" 
                class="gap-1 px-2 py-1 text-xs"
            >
                <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
                <span>En cola (#{{ lab.queue.position }})</span>
            </UBadge>

            <!-- Separador -->
            <div class="w-px h-5 bg-gray-300 dark:bg-gray-700"></div>

            <!-- Tiempo restante -->
            <div v-if="lab.session" class="flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-green-600" />
                <span class="font-mono text-sm font-bold text-green-600 dark:text-green-400">
                    {{ formatTimeShort(lab.timeLeft) }}
                </span>
            </div>

            <!-- Separador -->
            <div v-if="lab.session" class="w-px h-5 bg-gray-300 dark:bg-gray-700"></div>

            <!-- Ping resumido -->
            <div v-if="lab.session" class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                    <UIcon name="i-heroicons-wifi" class="w-3 h-3 text-green-500" />
                    <span class="text-xs text-gray-600 dark:text-gray-400">32ms</span>
                </div>
            </div>

            <!-- Mensaje de cola resumido -->
            <div v-else-if="lab.queue" class="text-xs text-gray-600 dark:text-gray-400">
                Esperando turno...
            </div>
        </div>
    </div>

    <!-- Versión compacta en sidebar (normal) -->
    <div 
        v-else-if="lab.session || lab.queue"
        class="bg-white dark:bg-gray-900 
               rounded-xl border border-gray-200 dark:border-gray-700
               p-2 w-full min-w-[140px]"
    >
        <div v-if="lab.session" class="flex flex-col gap-1.5">
            <!-- Badge de estado -->
            <UBadge 
                color="success" 
                variant="solid" 
                class="gap-1 px-1.5 py-0.5 text-[10px] w-full justify-center truncate"
                :title="'Laboratorio Activo'"
            >
                <UIcon name="i-heroicons-play-circle" class="w-3 h-3 flex-shrink-0" />
                <span class="truncate">Laboratorio Activo</span>
            </UBadge>
            
            <!-- Título Sesión Activa -->
            <div class="text-center" :title="'Sesión Activa'">
                <span class="text-[10px] font-semibold text-gray-700 dark:text-gray-300 truncate block">
                    Sesión Activa
                </span>
            </div>

            <!-- Tiempo restante -->
            <div class="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-1.5" :title="formatTime(lab.timeLeft)">
                <div class="text-[8px] text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                    Tiempo restante
                </div>
                <div class="font-mono text-sm font-bold text-green-600 dark:text-green-400 truncate">
                    {{ formatTime(lab.timeLeft) }}
                </div>
            </div>

            <!-- Conexión -->
            <div class="flex items-center justify-between text-[10px]" :title="`Conexión: Excelente`">
                <div class="flex items-center gap-1 min-w-0">
                    <UIcon name="i-heroicons-wifi" class="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                    <span class="text-gray-600 dark:text-gray-400 truncate">Conexión</span>
                </div>
                <span class="font-medium text-gray-700 dark:text-gray-300 truncate ml-1">Excelente</span>
            </div>

            <!-- Ping -->
            <div class="flex items-center justify-between text-[10px]" :title="`Ping: 32ms`">
                <div class="flex items-center gap-1 min-w-0">
                    <UIcon name="i-heroicons-server-stack" class="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
                    <span class="text-gray-600 dark:text-gray-400 truncate">Ping</span>
                </div>
                <span class="font-medium text-gray-700 dark:text-gray-300 truncate">32ms</span>
            </div>
        </div>

        <!-- Mensaje de cola -->
        <div v-else-if="lab.queue" class="text-center text-[10px] text-gray-600 dark:text-gray-400 py-1">
            <UBadge 
                color="warning" 
                variant="solid" 
                class="gap-1 px-1.5 py-0.5 text-[10px] w-full justify-center mb-1 truncate"
                :title="`En cola (posición #${lab.queue.position})`"
            >
                <UIcon name="i-heroicons-clock" class="w-3 h-3 flex-shrink-0" />
                <span class="truncate">En cola (#{{ lab.queue.position }})</span>
            </UBadge>
            <span class="block mt-1 truncate" title="Esperando turno...">Esperando turno...</span>
        </div>
    </div>
</template>

<script setup lang="ts">
const lab = useLabStore()
const isSidebarCollapsed = ref(false)

// Detectar el ancho del sidebar
onMounted(() => {
    // Busca el contenedor del sidebar (ajusta el selector según tu layout)
    const sidebar = document.querySelector('.sidebar, [class*="sidebar"], nav:first-child')
    
    if (sidebar) {
        const checkWidth = () => {
            const width = sidebar.clientWidth
            isSidebarCollapsed.value = width < 160
        }
        
        // Check inicial
        checkWidth()
        
        // Observar cambios de tamaño
        const resizeObserver = new ResizeObserver(() => {
            checkWidth()
        })
        
        resizeObserver.observe(sidebar)
        
        // Cleanup
        return () => resizeObserver.disconnect()
    }
})

const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return '0m 0s'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
}

const formatTimeShort = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* Animación para la versión flotante */
.fixed {
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translate(-50%, -20px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}
</style>