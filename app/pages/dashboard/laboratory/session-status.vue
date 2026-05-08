<!-- pages/dashboard/session-status.vue -->
<script setup lang="ts">
definePageMeta({
    layout: 'dashboard',
    roles: ['student']
})

const lab = useLabStore()
const toast = useToast()
const router = useRouter()

// Formatear tiempo restante
const formatTimeLeft = computed(() => {
    if (!lab.timeLeft && lab.timeLeft !== 0) return 'Sin sesión activa'
    
    const minutes = Math.floor(lab.timeLeft! / 60)
    const seconds = lab.timeLeft! % 60
    
    if (minutes > 0) {
        return `${minutes} minuto${minutes !== 1 ? 's' : ''} y ${seconds} segundo${seconds !== 1 ? 's' : ''}`
    }
    return `${seconds} segundo${seconds !== 1 ? 's' : ''}`
})

// Progreso del tiempo (asumiendo sesión de 30 minutos = 1800 segundos)
const timeProgress = computed(() => {
    if (!lab.timeLeft) return 0
    const totalTime = 1800 // 30 minutos en segundos
    return (lab.timeLeft / totalTime) * 100
})

// Color según tiempo restante
const timeColor = computed(() => {
    if (!lab.timeLeft) return 'gray'
    if (lab.timeLeft < 300) return 'error' // menos de 5 minutos
    if (lab.timeLeft < 900) return 'warning' // menos de 15 minutos
    return 'success'
})

// Acciones
const extendSession = async () => {
    try {
        await $fetch('/api/session/extend', { method: 'POST' })
        await lab.load()
        toast.add({
            title: '✅ Sesión extendida',
            description: 'Se han añadido 10 minutos a tu sesión',
            color: 'success'
        })
    } catch (error) {
        toast.add({
            title: '❌ No se pudo extender',
            description: 'Solo puedes extender una vez por sesión',
            color: 'error'
        })
    }
}

const endSession = async () => {
    const confirmed = confirm('¿Estás seguro de que quieres terminar la sesión?')
    if (confirmed) {
        await lab.end()
        toast.add({
            title: '⏰ Sesión finalizada',
            description: 'Tu sesión ha terminado correctamente',
            color: 'info'
        })
        router.push('/dashboard/student/queue')
    }
}
</script>

<template>

        <UDashboardPanel id="dashboard">
        <template #header>
            <UDashboardNavbar title="Dashboard - Estado de la Sesión" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                  
                        <UColorModeButton />
                
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>

    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">Estado de Sesión</h1>
            <p class="text-gray-500 dark:text-gray-400">
                Información detallada de tu sesión activa en el laboratorio
            </p>
        </div>

        <!-- Sin sesión activa -->
        <div v-if="!lab.hasAccess" class="text-center py-12">
            <div class="mb-6">
                <div class="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <UIcon name="i-lucide-clock" class="w-12 h-12 text-gray-400" />
                </div>
                <h2 class="text-2xl font-semibold mb-2">Sin sesión activa</h2>
                <p class="text-gray-500 mb-6">
                    No tienes una sesión activa en el laboratorio en este momento.
                </p>
                <div class="flex gap-3 justify-center">
                    <UButton to="/dashboard/student/queue" color="primary" size="lg">
                        <template #leading>
                            <UIcon name="i-lucide-clock" />
                        </template>
                        Ir a la cola
                    </UButton>
                    <UButton to="/dashboard/laboratory/schematic" color="neutral" variant="outline" size="lg">
                        <template #leading>
                            <UIcon name="i-lucide-eye" />
                        </template>
                        Ver esquema (solo lectura)
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Con sesión activa -->
        <div v-else class="space-y-6">
            <!-- Tarjeta principal de tiempo -->
            <UCard>
                <div class="text-center">
                    <!-- Reloj animado -->
                    <div class="mb-4">
                        <div class="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-lg animate-pulse">
                            <UIcon name="i-lucide-hourglass" class="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <!-- Tiempo restante -->
                    <h2 class="text-4xl font-bold mb-2">
                        {{ formatTimeLeft }}
                    </h2>
                    <p class="text-gray-500 mb-4">
                        de tiempo restante
                    </p>

                    <!-- Barra de progreso -->
                    <div class="max-w-md mx-auto mb-6">
                        <div class="flex justify-between text-sm mb-1">
                            <span>Progreso</span>
                            <span :class="`text-${timeColor}-500`">
                                {{ Math.round(100 - timeProgress) }}% completado
                            </span>
                        </div>
                        <UProgress 
                            :value="timeProgress" 
                            :color="timeColor"
                            size="lg"
                            class="h-3 rounded-full"
                        />
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex flex-wrap gap-3 justify-center">
                        <UButton 
                            color="primary" 
                            variant="solid" 
                            size="lg"
                            @click="extendSession"
                            :disabled="lab.timeLeft && lab.timeLeft > 1500"
                        >
                            <template #leading>
                                <UIcon name="i-lucide-plus-circle" />
                            </template>
                            Extender 10 minutos
                        </UButton>
                        <UButton 
                            color="error" 
                            variant="outline" 
                            size="lg"
                            @click="endSession"
                        >
                            <template #leading>
                                <UIcon name="i-lucide-log-out" />
                            </template>
                            Terminar sesión
                        </UButton>
                    </div>
                </div>
            </UCard>

          


        </div>
    </div>
      </template>
    </UDashboardPanel>
</template>

<style scoped>
@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
}

.animate-pulse {
    animation: pulse 2s ease-in-out infinite;
}
</style>