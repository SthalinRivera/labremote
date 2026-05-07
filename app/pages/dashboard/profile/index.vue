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


// ✅ DEBE SER /metrics/me
const { data: metricsResponse, status, error, refresh } = useAsyncData(
  'my-metrics',
  () => api('/metrics/me'),  // ← Ahora llama a /api/metrics/me
  { 
    default: () => null,
    watch: [user]
  }
)

// ✅ Extraer los datos de la respuesta
const metrics = computed(() => metricsResponse.value?.data || null)

// Verificar si hay datos
console.log('Métricas recibidas:', metrics.value)

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

// Verificar respuesta exitosa
watch(metricsResponse, (response) => {
  if (response && !response.success) {
    toast.add({
      title: 'Error',
      description: response.error || 'Error al cargar métricas',
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
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Mi Perfil" />
    </template>

    <template #body>
      <!-- LOADING -->
      <div v-if="status === 'pending' || !user" class="flex justify-center py-12">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto" />
          <p class="mt-2 text-muted">Cargando perfil...</p>
        </div>
      </div>

      <!-- CONTENIDO -->
      <div v-else class="space-y-6">
        
        <!-- 👤 PERFIL DE USUARIO -->
        <UCard>
          <div class="flex items-center gap-6">
            <div class="relative">
              <UAvatar 
                :src="user?.avatar_url" 
                :alt="user?.name || user?.email"
                size="xl" 
                :fallback="user?.name?.charAt(0) || user?.email?.charAt(0)"
              />
              <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <div class="flex-1">
              <h2 class="text-2xl font-bold">{{ user?.name || 'Usuario' }}</h2>
              <p class="text-muted">{{ user?.email }}</p>
              <div class="flex gap-2 mt-2">
                <UBadge :color="user?.role === 'admin' ? 'purple' : 'green'" variant="solid">
                  <UIcon :name="user?.role === 'admin' ? 'i-heroicons-shield-check' : 'i-heroicons-academic-cap'" class="w-4 h-4 mr-1" />
                  {{ user?.role === 'admin' ? 'Administrador' : 'Estudiante' }}
                </UBadge>
              </div>
            </div>

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
        <UCard v-if="metrics">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">📈 Métricas de Uso</h3>
              <UBadge color="primary" variant="soft">
                Última actualización: {{ formatDate(metrics.last_login) }}
              </UBadge>
            </div>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-muted">Sesiones</p>
                <UIcon name="i-heroicons-clock" class="w-5 h-5 text-primary" />
              </div>
              <p class="text-2xl font-bold">{{ metrics.total_sessions || 0 }}</p>
              <p class="text-xs text-muted mt-1">sesiones totales</p>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-muted">Tiempo Total</p>
                <UIcon name="i-heroicons-hourglass" class="w-5 h-5 text-blue-500" />
              </div>
              <p class="text-2xl font-bold">{{ formatTime(metrics.total_time_seconds) }}</p>
              <p class="text-xs text-muted mt-1">en la plataforma</p>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-muted">Promedio/Sesión</p>
                <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-green-500" />
              </div>
              <p class="text-2xl font-bold">{{ formatTime(metrics.avg_session_seconds) }}</p>
              <p class="text-xs text-muted mt-1">duración media</p>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-muted">Veces en Cola</p>
                <UIcon name="i-heroicons-users" class="w-5 h-5 text-orange-500" />
              </div>
              <p class="text-2xl font-bold">{{ metrics.times_in_queue || 0 }}</p>
              <p class="text-xs text-muted mt-1">esperas realizadas</p>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-muted">Tiempo Activo</p>
                <UIcon name="i-heroicons-play" class="w-5 h-5 text-green-500" />
              </div>
              <p class="text-2xl font-bold">{{ formatTime(metrics.total_active_time) }}</p>
              <p class="text-xs text-muted mt-1">interactuando</p>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-muted">Tiempo Inactivo</p>
                <UIcon name="i-heroicons-pause" class="w-5 h-5 text-yellow-500" />
              </div>
              <p class="text-2xl font-bold">{{ formatTime(metrics.total_idle_time) }}</p>
              <p class="text-xs text-muted mt-1">sin actividad</p>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-muted">Interacciones</p>
                <UIcon name="i-heroicons-hand-raised" class="w-5 h-5 text-purple-500" />
              </div>
              <p class="text-2xl font-bold">{{ metrics.total_interactions || 0 }}</p>
              <p class="text-xs text-muted mt-1">acciones realizadas</p>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-muted">Último Acceso</p>
                <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-red-500" />
              </div>
              <p class="text-lg font-bold">{{ formatDate(metrics.last_login) }}</p>
              <p class="text-xs text-muted mt-1">última actividad</p>
            </div>
          </div>
        </UCard>

        <!-- Estado sin métricas -->
        <UCard v-else>
          <div class="text-center py-12">
            <UIcon name="i-heroicons-chart-bar-square" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 class="text-lg font-medium mb-2">Sin métricas disponibles</h3>
            <p class="text-muted">Comienza a usar la plataforma para ver tus estadísticas de uso</p>
            <UButton to="/dashboard" class="mt-4" color="primary">
              Ir al Dashboard
            </UButton>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>