<script setup lang="ts">
import { sub } from 'date-fns'
import type { Period, Range } from '~/types'
import type { User } from '~/types'

definePageMeta({
  layout: "dashboard",
  middleware: ['auth', 'role'],
  roles: ['admin']
})

const api = useApi()
const toast = useToast()

// Filtros de fecha (opcional para futuros gráficos)
const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<Period>('daily')

// Estado del dashboard
const stats = ref({
  totalUsers: 0,
  admins: 0,
  students: 0,
  activeSessions: 0,
  avgSessionMinutes: 0,
  queueLength: 0
})

const recentUsers = ref<User[]>([])
const trends = ref<any[]>([])
const isLoading = ref(true)

// Cargar estadísticas desde el backend
async function loadStats() {
  try {
    isLoading.value = true
    const response = await api('/dashboard/stats')
    
    stats.value = response.stats
    recentUsers.value = response.recentUsers
    trends.value = response.trends
  } catch (error: any) {
    console.error('Error loading stats:', error)
    toast.add({
      title: 'Error',
      description: error?.message || 'No se pudieron cargar las estadísticas',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Formatear números
function formatNumber(num: number) {
  return new Intl.NumberFormat('es-PE').format(num)
}

// Refrescar datos
const refreshData = () => {
  loadStats()
}

// Cargar datos al montar
onMounted(() => {
  loadStats()
})

// Actualizar periódicamente (cada 30 segundos)
let interval: NodeJS.Timeout
onMounted(() => {
  interval = setInterval(loadStats, 30000)
})
onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <UDashboardPanel id="admin-dashboard">
    <template #header>
      <UDashboardNavbar title="Panel de Control" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Refrescar datos" :shortcuts="['R']">
            <UButton 
              color="neutral" 
              variant="ghost" 
              square 
              :loading="isLoading"
              @click="refreshData"
            >
              <UIcon name="i-lucide-refresh-cw" class="size-5 shrink-0" />
            </UButton>
          </UTooltip>

          <UTooltip text="Notificaciones" :shortcuts="['N']">
            <UButton color="neutral" variant="ghost" square>
              <UChip inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UButton 
            icon="i-lucide-plus" 
            size="md" 
            class="rounded-full"
            to="/dashboard/users"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Tarjetas de estadísticas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UCard class="!p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Total Usuarios</p>
                <p class="text-2xl font-bold">{{ formatNumber(stats.totalUsers) }}</p>
              </div>
              <UAvatar icon="i-lucide-users" size="md" class="bg-primary-100 dark:bg-primary-900/20" />
            </div>
          </UCard>

          <UCard class="!p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Administradores</p>
                <p class="text-2xl font-bold text-purple-600">{{ formatNumber(stats.admins) }}</p>
              </div>
              <UAvatar icon="i-lucide-shield" size="md" class="bg-purple-100 dark:bg-purple-900/20" />
            </div>
          </UCard>

          <UCard class="!p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Estudiantes</p>
                <p class="text-2xl font-bold text-orange-600">{{ formatNumber(stats.students) }}</p>
              </div>
              <UAvatar icon="i-lucide-graduation-cap" size="md" class="bg-orange-100 dark:bg-orange-900/20" />
            </div>
          </UCard>

          <UCard class="!p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Sesiones Activas</p>
                <p class="text-2xl font-bold text-blue-600">{{ formatNumber(stats.activeSessions) }}</p>
              </div>
              <UAvatar icon="i-lucide-play-circle" size="md" class="bg-blue-100 dark:bg-blue-900/20" />
            </div>
          </UCard>
        </div>

        <!-- Segunda fila de stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UCard class="!p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Tiempo Promedio de Sesión</p>
                <p class="text-2xl font-bold text-green-600">{{ stats.avgSessionMinutes }} min</p>
              </div>
              <UAvatar icon="i-lucide-timer" size="md" class="bg-green-100 dark:bg-green-900/20" />
            </div>
          </UCard>

          <UCard class="!p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">En Cola de Espera</p>
                <p class="text-2xl font-bold text-yellow-600">{{ formatNumber(stats.queueLength) }}</p>
              </div>
              <UAvatar icon="i-lucide-hourglass" size="md" class="bg-yellow-100 dark:bg-yellow-900/20" />
            </div>
          </UCard>
        </div>

        <!-- Usuarios recientes -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Usuarios Recientes</h3>
              <UButton variant="ghost" size="sm" to="/dashboard/users">Ver todos</UButton>
            </div>
          </template>

          <div v-if="recentUsers.length === 0" class="text-center py-8 text-gray-500">
            <UIcon name="i-lucide-users" class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay usuarios registrados</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="user in recentUsers" :key="user.id" class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div class="flex items-center gap-3">
                <UAvatar :src="user.avatar_url" :alt="user.name" size="sm" />
                <div>
                  <p class="font-medium">{{ user.name || 'Sin nombre' }}</p>
                  <p class="text-sm text-gray-500">{{ user.email }}</p>
                </div>
              </div>
              <UBadge :color="user.role === 'admin' ? 'purple' : 'neutral'" variant="subtle">
                {{ user.role === 'admin' ? 'Admin' : 'Estudiante' }}
              </UBadge>
            </div>
          </div>
        </UCard>

        <!-- Acciones rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Acciones Rápidas</h3>
            </template>
            <div class="grid grid-cols-2 gap-2">
              <UButton to="/dashboard/users" color="primary" variant="outline" class="justify-center">
                <UIcon name="i-lucide-users" class="w-4 h-4 mr-2" />
                Gestionar Usuarios
              </UButton>
              <UButton to="/dashboard/users?status=pending" color="warning" variant="outline" class="justify-center">
                <UIcon name="i-lucide-clock" class="w-4 h-4 mr-2" />
                Aprobar Solicitudes
              </UButton>
              <UButton to="/docs" color="neutral" variant="outline" class="justify-center">
                <UIcon name="i-lucide-book" class="w-4 h-4 mr-2" />
                Ver Documentación
              </UButton>
              <UButton to="/student" color="info" variant="outline" class="justify-center">
                <UIcon name="i-lucide-monitor" class="w-4 h-4 mr-2" />
                Monitorear Laboratorio
              </UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Información del Sistema</h3>
            </template>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Versión</span>
                <span class="font-medium">v1.0.0</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Plataforma</span>
                <span class="font-medium">Laboratorio Remoto IoT+IA</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Universidad</span>
                <span class="font-medium">UNDC - Ingeniería de Sistemas</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Estado</span>
                <UBadge color="success" variant="subtle">Operativo</UBadge>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>