<script setup lang="ts">
import type { User } from '~/types'

definePageMeta({
  layout: "dashboard",
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
  () => api('/api/metrics/me'),
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

// ✅ Formateo mejorado con redondeo
function formatTime(seconds: number) {
  if (!seconds && seconds !== 0) return '0s'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
  
  return parts.join(' ')
}

// ✅ Formateo para promedios (redondeado a 1 decimal)
function formatAvgTime(seconds: number) {
  if (!seconds && seconds !== 0) return '0s'
  
  const minutes = seconds / 60
  const hours = minutes / 60
  
  if (hours >= 1) {
    return `${hours.toFixed(1)}h`
  }
  if (minutes >= 1) {
    return `${minutes.toFixed(1)}m`
  }
  return `${Math.floor(seconds)}s`
}

// ✅ Formateo de minutos:segundos
function formatMinutesSeconds(seconds: number) {
  if (!seconds && seconds !== 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ✅ Formateo de fecha
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

// ✅ Calcular porcentajes para gráficos (si los tuvieras)
const usagePercentage = computed(() => {
  const total = (metrics.value?.total_active_time || 0) + (metrics.value?.total_idle_time || 0)
  if (total === 0) return 50
  return ((metrics.value?.total_active_time || 0) / total) * 100
})

// ✅ Items del menú de acciones
const actionItems = [
    [{
    label: 'Ver mis sesiones',
    icon: 'i-lucide-clock',
    onSelect: () => navigateTo('/dashboard/sessions')
  }, {
    label: 'Descargar reporte',
    icon: 'i-lucide-download',
    onSelect: () => console.log('Descargar')
  }]
]
</script>

<template>
  <UDashboardPanel id="profile">
    <template #header>
      <UDashboardNavbar title="Mi Perfil">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <!-- <UDropdownMenu :items="actionItems" :content="{ align: 'end' }">
            <UButton color="neutral" variant="ghost" icon="i-lucide-more-vertical" />
          </UDropdownMenu>-->
          <UColorModeButton /> 
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="container mx-auto px-4 py-6 max-w-7xl">
        
        <!-- LOADING -->
        <div v-if="status === 'pending' || !user" class="flex justify-center py-20">
          <UCard class="w-full max-w-md text-center">
            <div class="py-8">
              <UIcon name="i-lucide-loader-circle" class="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
              <p class="text-gray-500">Cargando perfil...</p>
            </div>
          </UCard>
        </div>

        <!-- CONTENIDO -->
        <div v-else class="space-y-6">
          
          <!-- 👤 PERFIL DE USUARIO - Versión Nuxt UI mejorada -->
          <UCard>
            <div class="flex flex-col md:flex-row items-center gap-6">
              <!-- Avatar con estado online -->
              <div class="relative">
                <UAvatar 
                  :src="user?.avatar_url" 
                  :alt="user?.name || user?.email"
                  size="xl" 
                  :fallback="user?.name?.charAt(0) || user?.email?.charAt(0)"
                  class="ring-4 ring-primary-100 dark:ring-primary-900/30"
                />
                <UBadge 
                  color="green" 
                  class="absolute bottom-1 right-1 rounded-full p-0.5"
                  :ui="{ rounded: 'rounded-full' }"
                >
                  <UIcon name="i-lucide-circle" class="w-3 h-3 fill-current" />
                </UBadge>
              </div>
              
              <!-- Info del usuario -->
              <div class="flex-1 text-center md:text-left">
                <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <h2 class="text-2xl font-bold">{{ user?.name || 'Usuario' }}</h2>
                  <UBadge 
                    :color="user?.role === 'admin' ? 'purple' : 'green'" 
                    variant="solid"
                  >
                    <UIcon 
                      :name="user?.role === 'admin' ? 'i-lucide-shield-check' : 'i-lucide-graduation-cap'" 
                      class="w-3.5 h-3.5 mr-1" 
                    />
                    {{ user?.role === 'admin' ? 'Administrador' : 'Estudiante' }}
                  </UBadge>
                </div>
                <p class="text-gray-500 flex items-center justify-center md:justify-start gap-1">
                  <UIcon name="i-lucide-mail" class="w-4 h-4" />
                  {{ user?.email }}
                </p>
                <div class="flex items-center justify-center md:justify-start gap-3 mt-3">
                  <span class="text-xs text-gray-400 flex items-center gap-1">
                    <UIcon name="i-lucide-calendar" class="w-3 h-3" />
                    Miembro desde: {{ formatDate(user?.created_at) }}
                  </span>
                </div>
              </div>

              <!-- Botón refresh -->
              <UButton 
                v-if="metrics"
                @click="refresh" 
                :loading="status === 'pending'"
                icon="i-lucide-refresh-cw" 
                size="sm" 
                color="neutral" 
                variant="ghost"
                :ui="{ rounded: 'rounded-full' }"
              />
            </div>
          </UCard>

          <!-- 📊 MÉTRICAS DE USO - Grid mejorada -->
          <UCard v-if="metrics">
            <template #header>
              <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <UIcon name="i-lucide-chart-bar" class="w-5 h-5 text-primary-500" />
                  </div>
                  <h3 class="text-lg font-semibold">Métricas de Uso</h3>
                </div>
                <UBadge color="neutral" variant="subtle" class="gap-1.5">
                  <UIcon name="i-lucide-calendar" class="w-3 h-3" />
                  Último acceso: {{ formatDate(metrics.last_login) }}
                </UBadge>
              </div>
            </template>

            <!-- Grid de métricas -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <!-- Tarjeta: Sesiones Totales -->
              <UCard class="text-center hover:shadow-md transition-all" :ui="{ body: 'py-4' }">
                <div class="flex flex-col items-center">
                  <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-2">
                    <UIcon name="i-lucide-clock" class="w-5 h-5 text-blue-500" />
                  </div>
                  <p class="text-3xl font-bold">{{ metrics.total_sessions || 0 }}</p>
                  <p class="text-xs text-gray-500 mt-1">sesiones totales</p>
                </div>
              </UCard>

              <!-- Tarjeta: Tiempo Total -->
              <UCard class="text-center hover:shadow-md transition-all" :ui="{ body: 'py-4' }">
                <div class="flex flex-col items-center">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                    <UIcon name="i-lucide-hourglass" class="w-5 h-5 text-green-500" />
                  </div>
                  <p class="text-3xl font-bold">{{ formatTime(metrics.total_time_seconds) }}</p>
                  <p class="text-xs text-gray-500 mt-1">tiempo total</p>
                </div>
              </UCard>

              <!-- Tarjeta: Promedio por sesión (redondeado) -->
              <UCard class="text-center hover:shadow-md transition-all" :ui="{ body: 'py-4' }">
                <div class="flex flex-col items-center">
                  <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2">
                    <UIcon name="i-lucide-trending-up" class="w-5 h-5 text-purple-500" />
                  </div>
                  <div class="flex items-baseline gap-1">
                    <p class="text-3xl font-bold">{{ formatAvgTime(metrics.avg_session_seconds) }}</p>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">promedio por sesión</p>
                </div>
              </UCard>

              <!-- Tarjeta: Veces en cola -->
              <UCard class="text-center hover:shadow-md transition-all" :ui="{ body: 'py-4' }">
                <div class="flex flex-col items-center">
                  <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-2">
                    <UIcon name="i-lucide-users" class="w-5 h-5 text-orange-500" />
                  </div>
                  <p class="text-3xl font-bold">{{ metrics.times_in_queue || 0 }}</p>
                  <p class="text-xs text-gray-500 mt-1">veces en cola</p>
                </div>
              </UCard>

              <!-- Tarjeta: Tiempo Activo -->
              <UCard class="text-center hover:shadow-md transition-all" :ui="{ body: 'py-4' }">
                <div class="flex flex-col items-center">
                  <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-2">
                    <UIcon name="i-lucide-play" class="w-5 h-5 text-emerald-500" />
                  </div>
                  <div class="flex items-baseline gap-1">
                    <p class="text-3xl font-bold">{{ formatTime(metrics.total_active_time) }}</p>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">tiempo activo</p>
                </div>
              </UCard>

              <!-- Tarjeta: Tiempo Inactivo -->
              <UCard class="text-center hover:shadow-md transition-all" :ui="{ body: 'py-4' }">
                <div class="flex flex-col items-center">
                  <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-2">
                    <UIcon name="i-lucide-pause" class="w-5 h-5 text-yellow-500" />
                  </div>
                  <p class="text-3xl font-bold">{{ formatTime(metrics.total_idle_time) }}</p>
                  <p class="text-xs text-gray-500 mt-1">tiempo inactivo</p>
                </div>
              </UCard>

              <!-- Tarjeta: Interacciones -->
              <UCard class="text-center hover:shadow-md transition-all" :ui="{ body: 'py-4' }">
                <div class="flex flex-col items-center">
                  <div class="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-2">
                    <UIcon name="i-lucide-mouse-pointer-click" class="w-5 h-5 text-pink-500" />
                  </div>
                  <p class="text-3xl font-bold">{{ metrics.total_interactions || 0 }}</p>
                  <p class="text-xs text-gray-500 mt-1">interacciones</p>
                </div>
              </UCard>

              <!-- Tarjeta: Eficiencia (ratio activo/total) -->
              <UCard class="text-center hover:shadow-md transition-all" :ui="{ body: 'py-4' }">
                <div class="flex flex-col items-center">
                  <div class="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full mb-2">
                    <UIcon name="i-lucide-gauge" class="w-5 h-5 text-cyan-500" />
                  </div>
                  <p class="text-3xl font-bold">{{ Math.round(usagePercentage) }}%</p>
                  <UProgress 
                    :value="usagePercentage" 
                    color="cyan" 
                    size="sm"
                    class="w-24 mt-2"
                  />
                  <p class="text-xs text-gray-500 mt-2">eficiencia</p>
                </div>
              </UCard>
            </div>

            <!-- Pie de métricas -->
            <template #footer>
              <div class="flex justify-between items-center text-xs text-gray-500">
                <div class="flex items-center gap-1">
                  <UIcon name="i-lucide-info" class="w-3 h-3" />
                  Las métricas se actualizan cada 5 minutos
                </div>
                <UButton 
                  variant="ghost" 
                  size="2xs" 
                  color="neutral"
                  icon="i-lucide-refresh-cw"
                  @click="refresh"
                >
                  Actualizar
                </UButton>
              </div>
            </template>
          </UCard>

          <!-- Estado sin métricas -->
          <UCard v-else class="text-center py-12">
            <div class="flex flex-col items-center">
              <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <UIcon name="i-lucide-chart-bar" class="w-12 h-12 text-gray-400" />
              </div>
              <h3 class="text-lg font-semibold mb-2">Sin métricas disponibles</h3>
              <p class="text-gray-500 max-w-md">
                Comienza a usar la plataforma para ver tus estadísticas de uso
              </p>
              <UButton to="/dashboard/student/queue" class="mt-6" color="primary">
                <template #leading>
                  <UIcon name="i-lucide-flask-conical" />
                </template>
                Ir al laboratorio
              </UButton>
            </div>
          </UCard>

        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>