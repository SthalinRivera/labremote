<!-- components/dashboard/laboratory/SystemStatus.vue -->
<script setup lang="ts">
interface SystemMetrics {
    cpuJetson: number
    ramRaspberry: number
    fpsCamera: number
    voltageESP32: number
    temperature: number
    activeUsers: number
    maxUsers: number
}

const props = defineProps<{
    metrics: SystemMetrics
    loading?: boolean
}>()

const emit = defineEmits<{
    refresh: []
}>()

const formatPercentage = (value: number) => `${value}%`
const formatVoltage = (value: number) => `${value.toFixed(2)} V`
const formatTemperature = (value: number) => `${value} °C`
const formatFPS = (value: number) => `${value} fps`

// Colores basados en valores
const getCpuColor = (value: number) => {
    if (value < 50) return 'primary'
    if (value < 75) return 'warning'
    return 'error'
}

const getRamColor = (value: number) => {
    if (value < 60) return 'green'
    if (value < 80) return 'warning'
    return 'error'
}

const getTemperatureColor = (value: number) => {
    if (value < 50) return 'success'
    if (value < 70) return 'warning'
    return 'error'
}

// Auto-refresh cada 5 segundos (opcional)
let refreshInterval: NodeJS.Timeout

onMounted(() => {
    if (!props.loading) {
        refreshInterval = setInterval(() => {
            emit('refresh')
        }, 5000)
    }
})

onUnmounted(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
    }
})
</script>

<template>
    <UCard>
        <template #header>
            <div class="flex justify-between items-center">
                <h2 class="font-semibold flex items-center gap-2">
                    <UIcon name="i-lucide-activity" class="w-5 h-5" />
                    Estado del Sistema
                </h2>
                <UButton 
                    v-if="!loading" 
                    size="xs" 
                    variant="ghost" 
                    :ui="{ rounded: 'rounded-full' }"
                    @click="emit('refresh')"
                >
                    <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
                </UButton>
            </div>
        </template>

        <div v-if="loading" class="space-y-3">
            <div v-for="i in 6" :key="i" class="space-y-1">
                <div class="flex justify-between text-sm">
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse" />
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                </div>
                <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
        </div>

        <div v-else class="space-y-3">
            <!-- CPU Jetson Nano -->
            <div class="group">
                <div class="flex justify-between text-sm mb-1">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-cpu" class="w-3.5 h-3.5 text-gray-500" />
                        <span>CPU Jetson Nano</span>
                    </div>
                    <span class="font-mono font-medium">{{ formatPercentage(metrics.cpuJetson) }}</span>
                </div>
                <UProgress 
                    :value="metrics.cpuJetson" 
                    :color="getCpuColor(metrics.cpuJetson)" 
                    size="sm" 
                    class="transition-all duration-300"
                />
            </div>

            <!-- RAM Raspberry -->
            <div class="group">
                <div class="flex justify-between text-sm mb-1">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-memory-stick" class="w-3.5 h-3.5 text-gray-500" />
                        <span>RAM Raspberry</span>
                    </div>
                    <span class="font-mono font-medium">{{ formatPercentage(metrics.ramRaspberry) }}</span>
                </div>
                <UProgress 
                    :value="metrics.ramRaspberry" 
                    :color="getRamColor(metrics.ramRaspberry)" 
                    size="sm" 
                    class="transition-all duration-300"
                />
            </div>

            <!-- FPS Cámara -->
            <div class="flex justify-between text-sm py-1">
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-video" class="w-3.5 h-3.5 text-gray-500" />
                    <span>FPS Cámara</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-mono font-medium">{{ formatFPS(metrics.fpsCamera) }}</span>
                    <UBadge 
                        :color="metrics.fpsCamera >= 30 ? 'green' : 'yellow'" 
                        size="xs" 
                        variant="subtle"
                    >
                        {{ metrics.fpsCamera >= 30 ? 'Óptimo' : 'Bajo' }}
                    </UBadge>
                </div>
            </div>

            <!-- Voltaje ESP32 -->
            <div class="flex justify-between text-sm py-1">
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-zap" class="w-3.5 h-3.5 text-gray-500" />
                    <span>Voltaje ESP32</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-mono font-medium">{{ formatVoltage(metrics.voltageESP32) }}</span>
                    <UBadge 
                        :color="metrics.voltageESP32 >= 3.0 ? 'green' : 'red'" 
                        size="xs" 
                        variant="subtle"
                    >
                        {{ metrics.voltageESP32 >= 3.0 ? 'Normal' : 'Bajo' }}
                    </UBadge>
                </div>
            </div>

            <!-- Temperatura -->
            <div class="flex justify-between text-sm py-1">
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-thermometer" class="w-3.5 h-3.5 text-gray-500" />
                    <span>Temperatura</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-mono font-medium">{{ formatTemperature(metrics.temperature) }}</span>
                    <UBadge 
                        :color="getTemperatureColor(metrics.temperature)" 
                        size="xs" 
                        variant="subtle"
                    >
                        {{ metrics.temperature < 50 ? 'Normal' : metrics.temperature < 70 ? 'Alta' : 'Crítica' }}
                    </UBadge>
                </div>
            </div>

            <!-- Usuarios Activos - Separador visual -->
            <div class="pt-2 mt-1 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-between text-sm">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-users" class="w-3.5 h-3.5 text-gray-500" />
                        <span>Usuarios Activos</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-mono font-medium">
                            {{ metrics.activeUsers }} / {{ metrics.maxUsers }}
                        </span>
                        <UProgress 
                            :value="(metrics.activeUsers / metrics.maxUsers) * 100" 
                            color="primary" 
                            size="sm" 
                            class="w-16"
                        />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="text-xs text-gray-500 flex items-center justify-between">
                <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-clock" class="w-3 h-3" />
                    Última actualización: {{ new Date().toLocaleTimeString() }}
                </span>
                <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-rotate-cw" class="w-3 h-3" />
                    Auto-refresh cada 5s
                </span>
            </div>
        </template>
    </UCard>
</template>