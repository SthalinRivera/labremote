<!-- pages/dashboard/admin/sessions.vue -->
<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'

definePageMeta({
  layout: "dashboard",
  middleware: ['auth', 'role'],
  roles: ['admin']
})

// Tipos
interface ActiveSession {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar_url: string
  started_at: string
  ends_at: string
  remaining: number
  duration_seconds: number
  status: string
}

interface HistorySession {
  id: string
  user_id: string
  user_name: string
  user_email: string
  started_at: string
  ends_at: string
  status: string
  duration_seconds: number
}

const toast = useToast()
const table = useTemplateRef('table')
const historyTable = useTemplateRef('historyTable')
const api = useApi()

// Estado
const activeTab = ref('active') // 'active' | 'history'
const sessions = ref<ActiveSession[]>([])
const history = ref<HistorySession[]>([])
const loading = ref(false)
const loadingHistory = ref(false)
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const historyPagination = ref({ pageIndex: 0, pageSize: 10 })
const selectedSessions = ref<Record<string, boolean>>({})
const filterSearch = ref('')
const historyFilterSearch = ref('')

// Auto-refresh para sesiones activas
let refreshInterval: NodeJS.Timeout

// Cargar sesiones activas
const loadSessions = async () => {
  loading.value = true
  try {
    const data = await api<ActiveSession[]>('/api/session/all-active')
    sessions.value = data
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'No se pudieron cargar las sesiones',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Cargar historial
const loadHistory = async () => {
  loadingHistory.value = true
  try {
    const data = await api<HistorySession[]>('/api/session/history?limit=100')
    history.value = data
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'No se pudo cargar el historial',
      color: 'error'
    })
  } finally {
    loadingHistory.value = false
  }
}

// Extender sesión
const extendSession = async (session: ActiveSession, minutes: number) => {
  try {
    await api('/api/session/extend', {
      method: 'POST',
      body: { userId: session.user_id, minutes }
    })
    toast.add({
      title: '✅ Sesión extendida',
      description: `${minutes} minutos añadidos a ${session.user_name}`,
      color: 'success'
    })
    await loadSessions()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'No se pudo extender la sesión',
      color: 'error'
    })
  }
}

// Terminar sesión
const terminateSession = async (session: ActiveSession) => {
  const confirmed = confirm(`¿Terminar la sesión de ${session.user_name}?`)
  if (!confirmed) return

  try {
    await api('/api/session/terminate', {
      method: 'POST',
      body: { userId: session.user_id }
    })
    toast.add({
      title: '⏰ Sesión terminada',
      description: `La sesión de ${session.user_name} ha finalizado`,
      color: 'warning'
    })
    await loadSessions()
    await loadHistory() // Recargar historial también
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'No se pudo terminar la sesión',
      color: 'error'
    })
  }
}

// Terminar todas las sesiones seleccionadas
const terminateSelectedSessions = async () => {
  const selectedRows = table.value?.tableApi?.getFilteredSelectedRowModel().rows || []
  const selected = selectedRows.map(row => row.original)
  
  if (selected.length === 0) return

  const confirmed = confirm(`¿Terminar ${selected.length} sesión(es) seleccionada(s)?`)
  if (!confirmed) return

  try {
    await Promise.all(selected.map(session => 
      api('/api/session/terminate', {
        method: 'POST',
        body: { userId: session.user_id }
      })
    ))
    toast.add({
      title: 'Sesiones terminadas',
      description: `${selected.length} sesión(es) finalizada(s)`,
      color: 'warning'
    })
    await loadSessions()
    await loadHistory()
    selectedSessions.value = {}
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Error al terminar sesiones',
      color: 'error'
    })
  }
}

// Formatear tiempo
const formatRemainingTime = (seconds: number) => {
  if (!seconds || seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Formatear duración (para historial)
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (mins === 0) return `${secs} seg`
  return `${mins} min ${secs} seg`
}

// Color según tiempo restante
const getTimeColor = (remaining: number) => {
  if (remaining <= 0) return 'error'
  if (remaining < 300) return 'error'
  if (remaining < 900) return 'warning'
  return 'success'
}

// Formatear fecha
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Filtrar sesiones localmente
const filteredSessions = computed(() => {
  if (!filterSearch.value) return sessions.value
  const search = filterSearch.value.toLowerCase()
  return sessions.value.filter(session => 
    session.user_name?.toLowerCase().includes(search) ||
    session.user_email?.toLowerCase().includes(search)
  )
})

// Filtrar historial localmente
const filteredHistory = computed(() => {
  if (!historyFilterSearch.value) return history.value
  const search = historyFilterSearch.value.toLowerCase()
  return history.value.filter(session => 
    session.user_name?.toLowerCase().includes(search) ||
    session.user_email?.toLowerCase().includes(search)
  )
})

// Estadísticas
const stats = computed(() => ({
  total: sessions.value.length,
  avgRemaining: sessions.value.reduce((acc, s) => acc + (s.remaining || 0), 0) / (sessions.value.length || 1),
  expiringSoon: sessions.value.filter(s => s.remaining < 300).length,
  totalHistory: history.value.length
}))

// Columnas para sesiones activas
const columns: TableColumn<ActiveSession>[] = [
  {
    id: 'select',
    header: ({ table }) => h('div', { class: 'flex justify-center' }, [
      h('input', {
        type: 'checkbox',
        checked: table.getIsAllRowsSelected(),
        onChange: (e: Event) => table.toggleAllRowsSelected((e.target as HTMLInputElement).checked)
      })
    ]),
    cell: ({ row }) => h('div', { class: 'flex justify-center' }, [
      h('input', {
        type: 'checkbox',
        checked: row.getIsSelected(),
        onChange: (e: Event) => row.toggleSelected((e.target as HTMLInputElement).checked)
      })
    ])
  },
  {
    accessorKey: 'user_name',
    header: 'Usuario',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
      h('img', {
        src: row.original.user_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.original.user_name || 'User')}&background=random`,
        class: 'w-8 h-8 rounded-full object-cover',
        alt: row.original.user_name
      }),
      h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium' }, row.original.user_name || 'Usuario sin nombre'),
        h('span', { class: 'text-xs text-gray-500' }, row.original.user_email)
      ])
    ])
  },
  {
    accessorKey: 'started_at',
    header: 'Inicio',
    cell: ({ row }) => h('span', { class: 'text-sm' }, formatDate(row.original.started_at))
  },
  {
    id: 'remaining',
    header: 'Tiempo restante',
    cell: ({ row }) => {
      const remaining = row.original.remaining || 0
      const percent = (remaining / (row.original.duration_seconds || 1800)) * 100
      
      return h('div', { class: 'flex flex-col gap-1 min-w-[140px]' }, [
        h('div', { class: 'flex items-center justify-between text-sm' }, [
          h('span', { class: `font-mono font-bold text-${getTimeColor(remaining)}-600` }, 
            formatRemainingTime(remaining)),
          h('span', { class: 'text-xs text-gray-500' }, `${Math.round(percent)}%`)
        ]),
        h(UProgress, {
          value: percent,
          color: getTimeColor(remaining),
          size: 'sm',
          class: 'w-full'
        })
      ])
    }
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const session = row.original
      return h('div', { class: 'flex gap-1' }, [
        h(UDropdownMenu, {
          items: [
            { label: '+5 minutos', icon: 'i-lucide-clock-plus', onSelect: () => extendSession(session, 5) },
            { label: '+10 minutos', icon: 'i-lucide-clock-plus', onSelect: () => extendSession(session, 10) },
            { label: '+15 minutos', icon: 'i-lucide-clock-plus', onSelect: () => extendSession(session, 15) },
            { label: '+30 minutos', icon: 'i-lucide-clock-plus', onSelect: () => extendSession(session, 30) },
            { type: 'separator' },
            { label: 'Terminar sesión', icon: 'i-lucide-stop-circle', color: 'error', onSelect: () => terminateSession(session) }
          ]
        }, () => h(UButton, { variant: 'ghost', icon: 'i-lucide-more-vertical', size: 'sm' }))
      ])
    }
  }
]

// Columnas para historial
const historyColumns: TableColumn<HistorySession>[] = [
  {
    accessorKey: 'user_name',
    header: 'Usuario',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
      h('img', {
        src: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.original.user_name || 'User')}&background=random`,
        class: 'w-8 h-8 rounded-full object-cover',
        alt: row.original.user_name
      }),
      h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium' }, row.original.user_name || 'Usuario sin nombre'),
        h('span', { class: 'text-xs text-gray-500' }, row.original.user_email)
      ])
    ])
  },
  {
    accessorKey: 'started_at',
    header: 'Inicio',
    cell: ({ row }) => h('span', { class: 'text-sm' }, formatDate(row.original.started_at))
  },
  {
    accessorKey: 'ends_at',
    header: 'Fin',
    cell: ({ row }) => h('span', { class: 'text-sm' }, formatDate(row.original.ends_at))
  },
  {
    id: 'duration',
    header: 'Duración',
    cell: ({ row }) => h(UBadge, { color: 'neutral' }, formatDuration(row.original.duration_seconds))
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => h(UBadge, { 
      color: row.original.status === 'finished' ? 'success' : 'error',
      variant: 'subtle'
    }, row.original.status === 'finished' ? 'Completada' : 'Expirada')
  }
]

// Cambiar tab y cargar datos según corresponda
watch(activeTab, (newTab) => {
  if (newTab === 'history' && history.value.length === 0) {
    loadHistory()
  }
})

// Inicializar
onMounted(() => {
  loadSessions()
  refreshInterval = setInterval(loadSessions, 5000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <UDashboardPanel id="sessions">
    <template #header>
      <UDashboardNavbar title="Gestión de Sesiones">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            v-if="activeTab === 'active'"
            color="primary"
            variant="ghost"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="loadSessions"
          />
          <UButton
            v-else
            color="primary"
            variant="ghost"
            icon="i-lucide-refresh-cw"
            :loading="loadingHistory"
            @click="loadHistory"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Tabs -->
      <UTabs
        v-model="activeTab"
        :items="[
          { label: `🟢 Sesiones Activas (${stats.total})`, value: 'active' },
          { label: `📜 Historial (${stats.totalHistory})`, value: 'history' }
        ]"
        class="mb-6"
      />

      <!-- Panel de Sesiones Activas -->
      <div v-if="activeTab === 'active'">
        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Sesiones activas</p>
                <p class="text-2xl font-bold">{{ stats.total }}</p>
              </div>
              <UIcon name="i-lucide-users" class="w-8 h-8 text-blue-500" />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Tiempo promedio restante</p>
                <p class="text-2xl font-bold">{{ formatRemainingTime(Math.floor(stats.avgRemaining)) }}</p>
              </div>
              <UIcon name="i-lucide-hourglass" class="w-8 h-8 text-green-500" />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Por vencer (&lt;5 min)</p>
                <p class="text-2xl font-bold" :class="{ 'text-red-500': stats.expiringSoon > 0 }">
                  {{ stats.expiringSoon }}
                </p>
              </div>
              <UIcon name="i-lucide-alert-triangle" class="w-8 h-8 text-yellow-500" />
            </div>
          </UCard>
        </div>

        <!-- Barra de herramientas -->
        <div class="flex flex-wrap items-center justify-between gap-1.5 mb-4">
          <UInput
            v-model="filterSearch"
            class="max-w-sm"
            icon="i-lucide-search"
            placeholder="Buscar por nombre o email..."
          />

          <div class="flex flex-wrap items-center gap-1.5">
            <UButton
              v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
              @click="terminateSelectedSessions"
            >
              Terminar seleccionadas
              <template #trailing>
                <UKbd>{{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}</UKbd>
              </template>
            </UButton>

            <UDropdownMenu :items="table?.tableApi?.getAllColumns()
              .filter(col => col.getCanHide())
              .map(col => ({
                label: col.id === 'user_name' ? 'Usuario' : col.id === 'remaining' ? 'Tiempo restante' : col.id,
                type: 'checkbox' as const,
                checked: col.getIsVisible(),
                onUpdateChecked: (checked: boolean) => col.toggleVisibility(checked),
                onSelect: (e?: Event) => e?.preventDefault()
              }))" :content="{ align: 'end' }">
              <UButton label="Columnas" color="neutral" variant="outline" trailing-icon="i-lucide-settings-2" />
            </UDropdownMenu>
          </div>
        </div>

        <!-- Tabla -->
        <UTable
          ref="table"
          v-model:row-selection="selectedSessions"
          v-model:pagination="pagination"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
          :data="filteredSessions"
          :columns="columns"
          :loading="loading"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
            separator: 'h-0'
          }"
        />

        <!-- Estado vacío -->
        <div v-if="!loading && filteredSessions.length === 0" class="text-center py-12">
          <UIcon name="i-lucide-inbox" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500">No hay sesiones activas en este momento</p>
        </div>

        <!-- Paginación -->
        <div v-if="filteredSessions.length > 0" class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-4">
          <div class="text-sm text-muted">
            {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} de
            {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} fila(s) seleccionada(s).
          </div>
          <div class="flex items-center gap-1.5">
            <UPagination
              :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
        </div>
      </div>

      <!-- Panel de Historial -->
      <div v-else>
        <!-- Barra de herramientas -->
        <div class="flex flex-wrap items-center justify-between gap-1.5 mb-4">
          <UInput
            v-model="historyFilterSearch"
            class="max-w-sm"
            icon="i-lucide-search"
            placeholder="Buscar por nombre o email..."
          />

          <UDropdownMenu :items="historyTable?.tableApi?.getAllColumns()
            .filter(col => col.getCanHide())
            .map(col => ({
              label: col.id === 'user_name' ? 'Usuario' : col.id,
              type: 'checkbox' as const,
              checked: col.getIsVisible(),
              onUpdateChecked: (checked: boolean) => col.toggleVisibility(checked),
              onSelect: (e?: Event) => e?.preventDefault()
            }))" :content="{ align: 'end' }">
            <UButton label="Columnas" color="neutral" variant="outline" trailing-icon="i-lucide-settings-2" />
          </UDropdownMenu>
        </div>

        <!-- Tabla de historial -->
        <UTable
          ref="historyTable"
          v-model:pagination="historyPagination"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
          :data="filteredHistory"
          :columns="historyColumns"
          :loading="loadingHistory"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
            separator: 'h-0'
          }"
        />

        <!-- Estado vacío -->
        <div v-if="!loadingHistory && filteredHistory.length === 0" class="text-center py-12">
          <UIcon name="i-lucide-clock" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500">No hay historial de sesiones</p>
        </div>

        <!-- Paginación -->
        <div v-if="filteredHistory.length > 0" class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-4">
          <div class="text-sm text-muted">
            {{ filteredHistory.length }} sesiones en total
          </div>
          <div class="flex items-center gap-1.5">
            <UPagination
              :default-page="(historyTable?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="historyTable?.tableApi?.getState().pagination.pageSize"
              :total="historyTable?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p: number) => historyTable?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>