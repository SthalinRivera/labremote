<template>
    <UDashboardPanel id="dashboard">
        <template #header>
            <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                
   <UColorModeButton />
                 
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div class="p-4 md:p-6">
                <UContainer class="max-w-7xl mx-auto">
                    <!-- Banner de bienvenida mejorado -->
                    <UCard
                        class="mb-8 bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 text-white shadow-xl">
                        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <UAvatar :src="user?.avatar" :alt="user?.name" size="xl" class="ring-4 ring-white/20" />
                                <div>
                                    <h1 class="text-2xl md:text-3xl font-bold">
                                        ¡Bienvenido, {{ user?.name || 'Estudiante' }}! 👋
                                    </h1>
                                    <p class="text-primary-100 mt-1">
                                        ¿Qué te gustaría hacer hoy en el laboratorio?
                                    </p>
                                </div>
                            </div>
                            <UBadge color="white" variant="solid" class="bg-white/20 text-white">
                                {{ new Date().toLocaleDateString('es-ES', {
                                    weekday: 'long', day: 'numeric', month:
                                        'long'
                                }) }}
                            </UBadge>
                        </div>
                    </UCard>


                    <!-- Acciones principales con grid mejorado -->
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <UIcon name="i-lucide-rocket" class="size-5" />
                        Acciones rápidas
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <!-- Tarjeta de Laboratorio -->
                        <UCard
                            class="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-500"
                            @click="goToLab">
                            <div class="flex flex-col items-center text-center p-6">
                                <div
                                    class="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all">
                                    <UIcon name="i-lucide-beaker" class="size-12 text-white" />
                                </div>
                                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                    Laboratorio Remoto
                                </h3>
                                <p class="text-gray-500 dark:text-gray-400 mb-4">
                                    Accede a la cola de espera y comienza tus prácticas
                                </p>
                                <div class="flex items-center gap-2">
                                    <UBadge color="primary" variant="soft" size="lg">
                                        <UIcon name="i-lucide-timer" class="size-4 mr-1" />
                                        Tiempo estimado: 30 min
                                    </UBadge>
                                </div>
                                <UButton color="primary" variant="solid" class="mt-6" size="lg">
                                    <UIcon name="i-lucide-play" class="size-4 mr-2" />
                                    Comenzar ahora
                                </UButton>
                            </div>
                        </UCard>

                        <!-- Tarjeta de Perfil -->
                        <UCard
                            class="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 border-transparent hover:border-green-500 dark:hover:border-green-500"
                            @click="goToProfile">
                            <div class="flex flex-col items-center text-center p-6">
                                <div
                                    class="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all">
                                    <UIcon name="i-lucide-user-circle" class="size-12 text-white" />
                                </div>
                                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                    Mi Perfil
                                </h3>
                                <p class="text-gray-500 dark:text-gray-400 mb-4">
                                    Gestiona tus datos, progreso y estadísticas personales
                                </p>
                                <div class="flex items-center gap-2">
                                    <UBadge color="green" variant="soft" size="lg">
                                        <UIcon name="i-lucide-chart-line" class="size-4 mr-1" />
                                        {{ stats.completedSessions }} sesiones
                                    </UBadge>
                                </div>
                                <UButton color="green" variant="solid" class="mt-6" size="lg">
                                    <UIcon name="i-lucide-eye" class="size-4 mr-2" />
                                    Ver mi progreso
                                </UButton>
                            </div>
                        </UCard>
                    </div>

                    <!-- Sección de actividad reciente -->
                    <div class=" gap-6">
                        <!-- Últimas sesiones -->
                       

                        <!-- Recursos y tips -->
                        <UCard>
                            <template #header>
                                <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <UIcon name="i-lucide-lightbulb" class="size-5" />
                                    Tips y recursos
                                </h3>
                            </template>

                            <div class="space-y-4">
                                <UAlert v-for="(tip, index) in tips" :key="index" :title="tip.title"
                                    :description="tip.description" :icon="tip.icon" color="primary" variant="subtle" />
                            </div>

                            <template #footer>
                                <UButton color="neutral" variant="link" size="sm" class="w-full justify-center">
                                    <UIcon name="i-lucide-graduation-cap" class="size-4 mr-1" />
                                    Ver más recursos educativos
                                </UButton>
                            </template>
                        </UCard>
                    </div>

                    <!-- Footer -->
                    <div class="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                            <p>
                                ¿Necesitas ayuda?
                                <ULink href="#" class="text-primary-600 hover:underline">Contacta a tu instructor
                                </ULink>
                            </p>
                            <div class="flex gap-4">
                                <ULink href="#" class="hover:text-gray-700 dark:hover:text-gray-300">Guía de uso
                                </ULink>
                                <ULink href="#" class="hover:text-gray-700 dark:hover:text-gray-300">Soporte técnico
                                </ULink>
                                <ULink href="#" class="hover:text-gray-700 dark:hover:text-gray-300">Políticas del
                                    laboratorio</ULink>
                            </div>
                        </div>
                    </div>
                </UContainer>
            </div>
        </template>


</UDashboardPanel>
</template>

<script setup lang="ts">
import { useRouter } from '#app'

definePageMeta({
    layout: 'dashboard',
    middleware: ['auth', 'role'],
    roles: ['student']
})

const router = useRouter()
const { user } = useAuth()

// Estados
const isNotificationsSlideoverOpen = ref(false)
const loadingStats = ref(true)
const loadingRecent = ref(true)

// Datos simulados (normalmente vendrían de una API)
const stats = ref({
    totalHours: 42,
    completedSessions: 18,
    queuePosition: 3,
    averageGrade: 8.5
})



const unreadNotifications = ref(2)



const tips = [
    { title: 'Optimiza tu tiempo', description: 'Revisa los materiales antes de entrar al laboratorio para aprovechar al máximo tu sesión.', icon: 'i-lucide-hourglass' },
    { title: 'Usa la simulación previa', description: 'Practica con el simulador integrado antes de usar equipos reales.', icon: 'i-lucide-laptop' },
    { title: 'Reportes automáticos', description: 'Tus resultados se guardan automáticamente al finalizar cada práctica.', icon: 'i-lucide-cloud-upload' }
]


// Navegación
const goToLab = () => {
    router.push('/dashboard/student/queue')
}

const goToProfile = () => {
    router.push('/dashboard/student/profile')
}

// Simular carga de datos
onMounted(() => {
    setTimeout(() => {
        loadingStats.value = false
        loadingRecent.value = false
    }, 800)
})
</script>

<style scoped>
/* Animaciones suaves */
.grid>div,
.group {
    animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Mejoras de scroll y transiciones */
:deep(.udashboard-panel) {
    scroll-behavior: smooth;
}
</style>