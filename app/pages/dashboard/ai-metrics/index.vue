<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'


const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')


definePageMeta({
  layout: "dashboard",
  middleware: ['auth', 'role'],
  roles: ['admin']
})






const api = useApi()

// 🔥 OBTENER DATOS IA
const {
  data,
  status,
  refresh
} = useAsyncData(
  'ai-metrics',
  () => api('/api/ai-metrics'),
  {
    default: () => ({
      data: []
    })
  }
)

// 🔥 COLUMNAS
const columns: TableColumn<any>[] = [

  {
    accessorKey: 'id',
    header: 'ID'
  },

  {
    accessorKey: 'human_detected',
    header: 'Humano',
    cell: ({ row }) =>
      h(UBadge, {
        color: row.original.human_detected
          ? 'success'
          : 'neutral'
      }, () =>
        row.original.human_detected
          ? 'Detectado'
          : 'No'
      )
  },

  {
    accessorKey: 'led_on',
    header: 'LED',
    cell: ({ row }) =>
      h(UBadge, {
        color: row.original.led_on
          ? 'warning'
          : 'neutral'
      }, () =>
        row.original.led_on
          ? 'Encendido'
          : 'Apagado'
      )
  },

  {
    accessorKey: 'motion_detected',
    header: 'Movimiento',
    cell: ({ row }) =>
      h(UBadge, {
        color: row.original.motion_detected
          ? 'primary'
          : 'neutral'
      }, () =>
        row.original.motion_detected
          ? 'Sí'
          : 'No'
      )
  },

  {
    accessorKey: 'ai_fps',
    header: 'AI FPS'
  },

  {
    accessorKey: 'inference_time',
    header: 'Inferencia'
  },

  {
    accessorKey: 'created_at',
    header: 'Fecha',
    cell: ({ row }) =>
      new Date(
        row.original.created_at
      ).toLocaleString()
  }

]

</script>

<template>

  <UDashboardPanel id="ai">

    <template #header>

      <UDashboardNavbar
        title="AI Metrics"
      >

        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>

          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            @click="refresh"
          >
            Actualizar
          </UButton>

        </template>

      </UDashboardNavbar>

    </template>

    <template #body>

      <!-- 🔥 CARDS -->
<AiCharts/>
      <div
        class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >

        <UCard>

          <div class="text-sm text-muted">
            Total Registros
          </div>

          <div class="text-3xl font-bold">
            {{ data?.data?.length || 0 }}
          </div>

        </UCard>

        <UCard>

          <div class="text-sm text-muted">
            Humanos Detectados
          </div>

          <div class="text-3xl font-bold text-green-500">

            {{
              data?.data?.filter(
                (i:any) => i.human_detected
              ).length || 0
            }}

          </div>

        </UCard>

        <UCard>

          <div class="text-sm text-muted">
            LED Encendido
          </div>

          <div class="text-3xl font-bold text-yellow-500">

            {{
              data?.data?.filter(
                (i:any) => i.led_on
              ).length || 0
            }}

          </div>

        </UCard>

        <UCard>

          <div class="text-sm text-muted">
            Movimiento
          </div>

          <div class="text-3xl font-bold text-blue-500">

            {{
              data?.data?.filter(
                (i:any) => i.motion_detected
              ).length || 0
            }}

          </div>

        </UCard>

      </div>

      <!-- 🔥 TABLA -->

      <UTable
        :loading="status === 'pending'"
        :data="data?.data || []"
        :columns="columns"
      />

    </template>

  </UDashboardPanel>

</template>