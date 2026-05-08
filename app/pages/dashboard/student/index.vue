<template>

    <UDashboardPanel id="dashboard">
         <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    <div class=" flex items-center justify-center p-4">
        
        <div class="max-w-7xl w-full">
            
            <!-- Logo y bienvenida -->
            <div class="text-center mb-12">
                <div class="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span class="text-white font-bold text-3xl">L</span>
                </div>
                <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    ¡Bienvenido, {{ user?.name || 'Estudiante' }}!
                </h1>
                <p class="text-gray-600 dark:text-gray-300">
                    ¿Qué deseas hacer hoy?
                </p>
            </div>

            <!-- Tarjetas de opciones -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- Opción 1: Hacer Cola / Laboratorio -->
                <UCard 
                    class="cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 text-center"
                    @click="goToLab"
                >
                    <div class="py-8">
                        <div class="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UIcon name="i-heroicons-beaker" class="w-10 h-10 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            Laboratorio
                        </h2>
                        <p class="text-gray-500 dark:text-gray-400">
                            Hacer cola y usar el laboratorio remoto
                        </p>
                        <UBadge class="mt-4" color="primary" variant="soft">
                            Comenzar ahora
                        </UBadge>
                    </div>
                </UCard>

                <!-- Opción 2: Perfil y Métricas -->
                <UCard 
                    class="cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 text-center"
                    @click="goToProfile"
                >
                    <div class="py-8">
                        <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UIcon name="i-heroicons-user" class="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            Mi Perfil
                        </h2>
                        <p class="text-gray-500 dark:text-gray-400">
                            Ver mis datos y estadísticas de uso
                        </p>
                        <UBadge class="mt-4" color="green" variant="soft">
                            Ver métricas
                        </UBadge>
                    </div>
                </UCard>

            </div>

            <!-- Footer -->
            <div class="text-center mt-12">
                <p class="text-sm text-gray-500">
                    ¿Necesitas ayuda? Contacta a tu instructor
                </p>
            </div>

        </div>
    </div>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRouter } from '#app'

definePageMeta({
    layout: 'dashboard', // Layout sin header ni sidebar
    middleware: ['auth', 'role'],
    roles: ['student']
})

const router = useRouter()
const { user } = useAuth()

// Ir a la página del laboratorio (cola/sesión)
const goToLab = () => {
    router.push('/student/queue') // o la ruta donde está tu código actual
}

// Ir a perfil y métricas
const goToProfile = () => {
    router.push('/student/profile')
}
</script>

<style scoped>
/* Animación de entrada */
.grid > div {
    animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>