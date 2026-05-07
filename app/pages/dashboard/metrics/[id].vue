<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: "dashboard",
  roles: ["admin"]
})

const route = useRoute()
const toast = useToast()
const api = useApi()

// Obtener el ID del usuario de la URL
const userId = computed(() => route.params.id as string)

// Tipo para las métricas individuales del usuario
interface UserMetrics {
  user_id: string
  total_sessions: number
  total_time_seconds: number
  avg_session_seconds: number
  times_in_queue: number
  total_active_time: number
  total_idle_time: number
  total_interactions: number
  last_login: string
}

// Obtener métricas del usuario específico
const { data: metrics, status, refresh } = useAsyncData(
  `user-metrics-${userId.value}`,
  () => api<{ success: boolean; data: UserMetrics }>(`/metrics/${userId.value}`),
  { default: () => ({ success: false, data: null }) }
)

const userMetrics = computed(() => metrics.value?.data || null)

// Formatear tiempo en segundos a formato legible
function formatTime(seconds: number): string {
  if (seconds === 0) return '0 minutos'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours} hora${hours > 1 ? 's' : ''} ${minutes} minuto${minutes > 1 ? 's' : ''}`
  }
  if (minutes > 0) {
    return `${minutes} minuto${minutes > 1 ? 's' : ''} ${secs} segundo${secs > 1 ? 's' : ''}`
  }
  return `${secs} segundo${secs > 1 ? 's' : ''}`
}

// Formatear fecha
function formatDate(dateString: string): string {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full',
    timeStyle: 'long'
  }).format(date)
}

// Métricas a mostrar
const metricsCards = computed(() => {
  if (!userMetrics.value) return []
  
  return [
    { 
      label: 'Sesiones totales', 
      value: userMetrics.value.total_sessions,
      icon: 'i-lucide-monitor',
      color: 'primary'
    },
    { 
      label: 'Tiempo total', 
      value: formatTime(userMetrics.value.total_time_seconds),
      icon: 'i-lucide-clock',
      color: 'green'
    },
    { 
      label: 'Duración promedio por sesión', 
      value: formatTime(userMetrics.value.avg_session_seconds),
      icon: 'i-lucide-trending-up',
      color: 'blue'
    },
    { 
      label: 'Veces en cola', 
      value: userMetrics.value.times_in_queue,
      icon: 'i-lucide-users',
      color: 'orange'
    },
    { 
      label: 'Tiempo activo', 
      value: formatTime(userMetrics.value.total_active_time),
      icon: 'i-lucide-play-circle',
      color: 'emerald'
    },
    { 
      label: 'Tiempo inactivo', 
      value: formatTime(userMetrics.value.total_idle_time),
      icon: 'i-lucide-pause-circle',
      color: 'yellow'
    },
    { 
      label: 'Interacciones', 
      value: userMetrics.value.total_interactions,
      icon: 'i-lucide-mouse-pointer-click',
      color: 'purple'
    }
  ]
})

// Métricas adicionales para la tabla de detalles
const detailMetrics = computed(() => {
  if (!userMetrics.value) return []
  
  return [
    { metric: 'ID de Usuario', value: userMetrics.value.user_id },
    { metric: 'Último acceso', value: formatDate(userMetrics.value.last_login) },
    { metric: 'Eficiencia de sesión', value: userMetrics.value.total_sessions > 0 
      ? `${((userMetrics.value.total_active_time / userMetrics.value.total_time_seconds) * 100).toFixed(1)}%`
      : '0%' 
    },
    { metric: 'Promedio de interacciones por sesión', value: userMetrics.value.total_sessions > 0
      ? (userMetrics.value.total_interactions / userMetrics.value.total_sessions).toFixed(1)
      : '0'
    }
  ]
})

// Navegar de vuelta
function goBack() {
  navigateTo('/dashboard/users')
}
</script>

<template>
  <UDashboardPanel id="user-metrics-detail">
    <template #header>
      <UDashboardNavbar :title="`Métricas de Usuario`">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton 
            variant="ghost" 
            icon="i-lucide-arrow-left" 
            label="Volver" 
            @click="goBack"
          />
        </template>
        <template #right>
          <UButton 
            label="Actualizar" 
            color="neutral" 
            variant="outline" 
            icon="i-lucide-refresh-cw"
            :loading="status === 'pending'"
            @click="refresh" 
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="status === 'pending'" class="flex justify-center items-center py-20">
        <ULoader />
      </div>

      <div v-else-if="!userMetrics" class="text-center py-20">
        <UIcon name="i-lucide-bar-chart-3" class="w-16 h-16 text-muted mx-auto mb-4" />
        <h3 class="text-lg font-medium mb-2">No se encontraron métricas</h3>
        <p class="text-muted mb-4">No hay datos disponibles para este usuario</p>
        <UButton label="Volver al listado" @click="goBack" />
      </div>

      <div v-else class="space-y-6">
        <!-- Tarjetas de métricas principales -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <UCard v-for="card in metricsCards" :key="card.label" class="hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-muted">{{ card.label }}</p>
                <p class="text-2xl font-semibold mt-1">{{ card.value }}</p>
              </div>
              <div class="p-2 rounded-lg bg-{{ card.color }}-50 dark:bg-{{ card.color }}-950/20">
                <UIcon :name="card.icon" class="w-5 h-5 text-{{ card.color }}-600 dark:text-{{ card.color }}-400" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Detalles adicionales -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-info" class="w-5 h-5" />
                <h3 class="font-medium">Información General</h3>
              </div>
            </template>
            
            <div class="space-y-3">
              <div v-for="detail in detailMetrics" :key="detail.metric" class="flex justify-between items-center py-2 border-b border-default last:border-0">
                <span class="text-sm text-muted">{{ detail.metric }}</span>
                <span class="text-sm font-mono">{{ detail.value }}</span>
              </div>
            </div>
          </UCard>

          <!-- Resumen de actividad -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-activity" class="w-5 h-5" />
                <h3 class="font-medium">Resumen de Actividad</h3>
              </div>
            </template>
            
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Tasa de actividad activa</span>
                  <span>{{ userMetrics.total_sessions > 0 
                    ? `${((userMetrics.total_active_time / userMetrics.total_time_seconds) * 100).toFixed(1)}%`
                    : '0%' 
                  }}</span>
                </div>
                <UProgress 
                  :value="userMetrics.total_sessions > 0 
                    ? (userMetrics.total_active_time / userMetrics.total_time_seconds) * 100 
                    : 0" 
                  color="primary"
                />
              </div>
              
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Ratio cola/sesión</span>
                  <span>{{ userMetrics.total_sessions > 0 
                    ? (userMetrics.times_in_queue / userMetrics.total_sessions).toFixed(2)
                    : '0' 
                  }}</span>
              </div>
                
              </div>
              
              <div class="pt-2">
                <div class="flex items-center justify-between text-sm">
                  <span>Última actividad</span>
                  <span class="text-muted">{{ formatDate(userMetrics.last_login) }}</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Gráfico de distribución de tiempo -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-pie-chart" class="w-5 h-5" />
              <h3 class="font-medium">Distribución de Tiempo</h3>
            </div>
          </template>
          
          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="p-4 rounded-lg bg-primary-50 dark:bg-primary-950/20">
              <p class="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                {{ formatTime(userMetrics.total_active_time) }}
              </p>
              <p class="text-sm text-muted mt-1">Tiempo Activo</p>
            </div>
            <div class="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <p class="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                {{ formatTime(userMetrics.total_idle_time) }}
              </p>
              <p class="text-sm text-muted mt-1">Tiempo Inactivo</p>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>