<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'

const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

definePageMeta({
  layout: "dashboard",
  roles: ["admin"]
})

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'email',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})

const api = useApi()

// Tipo para las métricas de usuario
interface UserMetrics {
  id: string
  email: string
  total_sessions: number
  total_time_seconds: number
  avg_session_seconds: number
  times_in_queue: number
  total_active_time: number
  total_idle_time: number
  total_interactions: number
  last_login: string
}

// Obtener métricas de usuarios
const { data: metricsResponse, status, refresh } = useAsyncData(
  'users-metrics',
  () => api<{ data: UserMetrics[]; success: boolean }>('/metrics/all'),
  { default: () => ({ data: [], success: false }) }
)

// Extraer el array de métricas de la respuesta
const metrics = computed(() => metricsResponse.value?.data || [])

// Formatear tiempo en segundos a formato legible
function formatTime(seconds: number): string {
  if (seconds === 0) return '0 min'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes}min`
}

// Formatear fecha
function formatDate(dateString: string): string {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

// --- Columnas de la tabla ---
const columns: TableColumn<UserMetrics>[] = [
  { accessorKey: 'email', header: 'Email', 
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.email)
  },
  { 
    accessorKey: 'total_sessions', 
    header: 'Sesiones',
    cell: ({ row }) => h('span', {}, row.original.total_sessions)
  },
  { 
    accessorKey: 'total_time_seconds', 
    header: 'Tiempo total',
    cell: ({ row }) => h('span', {}, formatTime(row.original.total_time_seconds))
  },
  { 
    accessorKey: 'avg_session_seconds', 
    header: 'Duración promedio',
    cell: ({ row }) => h('span', {}, formatTime(row.original.avg_session_seconds))
  },
  { 
    accessorKey: 'times_in_queue', 
    header: 'Veces en cola',
    cell: ({ row }) => h(UBadge, {
      color: row.original.times_in_queue > 0 ? 'warning' : 'neutral'
    }, () => row.original.times_in_queue)
  },
  { 
    accessorKey: 'total_interactions', 
    header: 'Interacciones',
    cell: ({ row }) => h('span', {}, row.original.total_interactions)
  },
  { 
    accessorKey: 'last_login', 
    header: 'Último acceso',
    cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, formatDate(row.original.last_login))
  }
]

// --- Filtros ---
const emailFilter = computed({
  get: () => (table.value?.tableApi?.getColumn('email')?.getFilterValue() as string) || '',
  set: (value: string) => {
    table.value?.tableApi?.getColumn('email')?.setFilterValue(value || undefined)
  }
})

// --- Paginación ---
const pagination = ref({ pageIndex: 0, pageSize: 10 })
</script>

<template>
  <UDashboardPanel id="users-metrics">
    <template #header>
      <UDashboardNavbar title="Métricas de Usuarios">
        <template #leading>
          <UDashboardSidebarCollapse />
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
      <div class="flex flex-wrap items-center justify-between gap-1.5 mb-4">
        <UInput 
          v-model="emailFilter" 
          class="max-w-sm" 
          icon="i-lucide-search" 
          placeholder="Filtrar por email..." 
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <UDropdownMenu :items="table?.tableApi?.getAllColumns()
            .filter(col => col.getCanHide())
            .map(col => ({
              label: upperFirst(col.id),
              type: 'checkbox' as const,
              checked: col.getIsVisible(),
              onUpdateChecked: (checked: boolean) => col.toggleVisibility(checked),
              onSelect: (e?: Event) => e?.preventDefault()
            }))" :content="{ align: 'end' }">
            <UButton label="Mostrar columnas" color="neutral" variant="outline" trailing-icon="i-lucide-settings-2" />
          </UDropdownMenu>
        </div>
      </div>

      <UTable 
        ref="table" 
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }" 
        :data="metrics" 
        :columns="columns"
        :loading="status === 'pending'" 
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }" 
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          Mostrando {{ metrics.length }} usuarios
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
    </template>
  </UDashboardPanel>
</template>