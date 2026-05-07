<script setup lang="ts">
import type { User } from '~/types'

definePageMeta({
  layout: "student",
})

const toast = useToast()
const api = useApi()

// 🔹 Obtener usuario del store de autenticación
const { user, initAuth } = useAuth()

// Inicializar auth al montar
onMounted(() => {
  initAuth()
})

// 🔹 Métricas del usuario (/me)
const { data: metricsResponse, status, error, refresh } = useAsyncData(
  'my-metrics',
  () => api('/metrics/me'),
  { 
    default: () => null,
    watch: [user]
  }
)

// Extraer datos
const metrics = computed(() => metricsResponse.value?.data || null)

// Manejar errores
watch(error, (err) => {
  if (err) {
    console.error('Error en petición:', err)
    toast.add({
      title: 'Error',
      description: 'No se pudieron cargar las métricas',
      color: 'error'
    })
  }
})

// Helpers
function formatTime(seconds: number) {
  if (!seconds && seconds !== 0) return '0s'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatDate(dateString: string) {
  if (!dateString) return 'Nunca'
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>

  
      <UDashboardPanel id="dashboard">
         <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
             <UColorModeButton />
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
  <div class="min-h-screen flex items-start justify-center py-8 px-4">
    <div class="w-full max-w-7xl">
      
      <!-- LOADING -->
      <div v-if="status === 'pending' || !user" class="flex justify-center py-12">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto" />
          <p class="mt-2 text-gray-500">Cargando perfil...</p>
        </div>
      </div>

      <!-- CONTENIDO -->
      <div v-else class="space-y-6">
        
        <!-- 👤 PERFIL DE USUARIO -->
        <UCard class="shadow-lg">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <!-- Avatar -->
            <div class="relative">
              <UAvatar 
                :src="user?.avatar_url" 
                :alt="user?.name || user?.email"
                size="xl" 
                :fallback="user?.name?.charAt(0) || user?.email?.charAt(0)"
                class="ring-4 ring-primary-100 dark:ring-primary-900/30"
              />
              <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <!-- Info -->
            <div class="flex-1 text-center md:text-left">
              <h2 class="text-2xl font-bold">{{ user?.name || 'Usuario' }}</h2>
              <p class="text-gray-500">{{ user?.email }}</p>
              <div class="flex justify-center md:justify-start gap-2 mt-2">
                <UBadge :color="user?.role === 'admin' ? 'purple' : 'green'" variant="solid">
                  <UIcon :name="user?.role === 'admin' ? 'i-heroicons-shield-check' : 'i-heroicons-academic-cap'" class="w-4 h-4 mr-1" />
                  {{ user?.role === 'admin' ? 'Administrador' : 'Estudiante' }}
                </UBadge>
              </div>
            </div>

            <!-- Refresh -->
            <UButton 
              v-if="metrics"
              @click="refresh" 
              :loading="status === 'pending'"
              icon="i-heroicons-arrow-path" 
              size="sm" 
              color="gray" 
              variant="ghost"
            />
          </div>
        </UCard>

        <!-- 📊 MÉTRICAS DE USO -->
        <UCard v-if="metrics" class="shadow-lg">
          <template #header>
            <div class="flex flex-col sm:flex-row items-center justify-between gap-2">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-primary-500" />
                Métricas de Uso
              </h3>
              <UBadge color="primary" variant="soft">
                <UIcon name="i-heroicons-calendar" class="w-3 h-3 mr-1" />
                Última actualización: {{ formatDate(metrics.last_login) }}
              </UBadge>
            </div>
          </template>

          <!-- Grid de métricas centrado -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- Sesiones -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center hover:shadow-md transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-primary-500" />
              </div>
              <p class="text-3xl font-bold">{{ metrics.total_sessions || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">sesiones totales</p>
            </div>

            <!-- Tiempo Total -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center hover:shadow-md transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <UIcon name="i-heroicons-hourglass" class="w-6 h-6 text-blue-500" />
              </div>
              <p class="text-3xl font-bold">{{ formatTime(metrics.total_time_seconds) }}</p>
              <p class="text-xs text-gray-500 mt-1">tiempo total</p>
            </div>

            <!-- Promedio por sesión -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center hover:shadow-md transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-green-500" />
              </div>
              <p class="text-3xl font-bold">{{ formatTime(metrics.avg_session_seconds) }}</p>
              <p class="text-xs text-gray-500 mt-1">promedio por sesión</p>
            </div>

            <!-- Cola -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center hover:shadow-md transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <UIcon name="i-heroicons-users" class="w-6 h-6 text-orange-500" />
              </div>
              <p class="text-3xl font-bold">{{ metrics.times_in_queue || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">veces en cola</p>
            </div>

            <!-- Tiempo Activo -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center hover:shadow-md transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <UIcon name="i-heroicons-play" class="w-6 h-6 text-green-500" />
              </div>
              <p class="text-3xl font-bold">{{ formatTime(metrics.total_active_time) }}</p>
              <p class="text-xs text-gray-500 mt-1">tiempo activo</p>
            </div>

            <!-- Tiempo Inactivo -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center hover:shadow-md transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <UIcon name="i-heroicons-pause" class="w-6 h-6 text-yellow-500" />
              </div>
              <p class="text-3xl font-bold">{{ formatTime(metrics.total_idle_time) }}</p>
              <p class="text-xs text-gray-500 mt-1">tiempo inactivo</p>
            </div>

            <!-- Interacciones -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center hover:shadow-md transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <UIcon name="i-heroicons-hand-raised" class="w-6 h-6 text-purple-500" />
              </div>
              <p class="text-3xl font-bold">{{ metrics.total_interactions || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">interacciones</p>
            </div>

            <!-- Último Acceso -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center hover:shadow-md transition-shadow col-span-1 sm:col-span-2 lg:col-span-1">
              <div class="flex items-center justify-center mb-2">
                <UIcon name="i-heroicons-calendar" class="w-6 h-6 text-red-500" />
              </div>
              <p class="text-lg font-bold">{{ formatDate(metrics.last_login) }}</p>
              <p class="text-xs text-gray-500 mt-1">último acceso</p>
            </div>

          </div>
        </UCard>

        <!-- Estado sin métricas -->
        <UCard v-else class="shadow-lg">
          <div class="text-center py-12">
            <UIcon name="i-heroicons-chart-bar-square" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 class="text-lg font-medium mb-2">Sin métricas disponibles</h3>
            <p class="text-gray-500">Comienza a usar la plataforma para ver tus estadísticas de uso</p>
            <UButton to="/dashboard" class="mt-4" color="primary">
              Ir al Dashboard
            </UButton>
          </div>
        </UCard>

      </div>
    </div>
  </div>

   </UDashboardPanel>
</template>

<style scoped>
/* Animación de entrada */
.space-y-6 > * {
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

/* Efecto hover en tarjetas de métricas */
.bg-gray-50:hover {
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
</style>