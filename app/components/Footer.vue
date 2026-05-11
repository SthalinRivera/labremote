<!-- components/Footer.vue -->
<template>
    <footer class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div class="container mx-auto px-4 py-6">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                <!-- Descripción de LABREMOTE -->
                <div class="text-center md:text-left">
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        © 2026 LABREMOTE — Laboratorio remoto IoT para educación y experimentación.
                        <span class="hidden sm:inline">Accede a dispositivos reales desde cualquier lugar.</span>
                    </p>
                </div>
                
                <!-- Estado del sistema y versión -->
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span>Sistema operativo</span>
                    </div>
                    <UBadge color="gray" variant="subtle" size="sm" class="text-xs">
                        <UIcon name="i-lucide-cpu" class="w-3 h-3 mr-1" />
                        v1.0.0
                    </UBadge>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
// Puedes añadir props si necesitas dinamismo
const props = defineProps<{
    version?: string
    showStatus?: boolean
}>()

const currentYear = computed(() => new Date().getFullYear())
const appVersion = props.version || '1.0.0'
</script>

<style scoped>
@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(1.2);
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>