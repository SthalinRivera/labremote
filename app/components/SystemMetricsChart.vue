<script setup lang="ts">

import {

  VisXYContainer,
  VisLine,
  VisAxis,
  VisArea,
  VisCrosshair,
  VisTooltip

} from '@unovis/vue'

// 🔥 CARD REF
const cardRef =
  useTemplateRef<HTMLElement | null>('cardRef')

const { width } = useElementSize(cardRef)

// 🔥 API
const api = useApi()

// 🔥 FETCH
const { data: response } = await useAsyncData(
  'system-metrics-chart',
  () => api('/api/system-metrics'),
  {
    default: () => ({
      data: []
    })
  }
)

// 🔥 FORMATEAR
const chartData = computed(() => {

  return response.value.data.map((item: any) => ({

    date: new Date(item.created_at),

    cpu: item.cpu_usage,

    gpu: item.gpu_usage,

    ram: item.memory_usage,

    temp: item.temperature

  }))

})

// 🔥 X
const x = (_: any, i: number) => i

// 🔥 CPU
const yCpu = (d: any) => d.cpu

// 🔥 GPU
const yGpu = (d: any) => d.gpu

// 🔥 RAM
const yRam = (d: any) => d.ram

// 🔥 TEMP
const yTemp = (d: any) => d.temp

// 🔥 PROMEDIOS
const avgCpu = computed(() => {

  if (!chartData.value.length)
    return 0

  const total = chartData.value.reduce(
    (acc: number, item: any) =>
      acc + item.cpu,
    0
  )

  return (total / chartData.value.length)
    .toFixed(1)

})

// 🔥 FECHAS
const formatDate = (date: Date) =>
  date.toLocaleTimeString()

const xTicks = (i: number) => {

  if (
    i === 0 ||
    i === chartData.value.length - 1 ||
    !chartData.value[i]
  ) {
    return ''
  }

  return formatDate(
    chartData.value[i].date
  )

}

// 🔥 TOOLTIP
const template = (d: any) => `

CPU: ${d.cpu}%
<br/>

GPU: ${d.gpu}%
<br/>

RAM: ${d.ram}%
<br/>

TEMP: ${d.temp}°C
<br/>

${formatDate(d.date)}

`

</script>

<template>

  <div
    class="grid grid-cols-1 xl:grid-cols-2 gap-6"
  >

    <!-- 🔥 CPU -->

    <UCard
      ref="cardRef"
      :ui="{
        root: 'overflow-visible',
        body: 'px-0! pt-0! pb-3!'
      }"
    >

      <template #header>

        <div>

          <p
            class="text-xs text-muted uppercase mb-1.5"
          >
            CPU Usage
          </p>

          <p
            class="text-3xl font-semibold"
          >
            {{ avgCpu }}%
          </p>

        </div>

      </template>

      <VisXYContainer
        :data="chartData"
        :padding="{ top: 40 }"
        class="h-80"
        :width="width"
      >

        <VisLine
          :x="x"
          :y="yCpu"
          color="var(--ui-primary)"
        />

        <VisArea
          :x="x"
          :y="yCpu"
          color="var(--ui-primary)"
          :opacity="0.1"
        />

        <VisAxis
          type="x"
          :x="x"
          :tick-format="xTicks"
        />

        <VisCrosshair
          :template="template"
        />

        <VisTooltip />

      </VisXYContainer>

    </UCard>

    <!-- 🔥 GPU -->

    <UCard
      :ui="{
        root: 'overflow-visible',
        body: 'px-0! pt-0! pb-3!'
      }"
    >

      <template #header>

        <div>

          <p
            class="text-xs text-muted uppercase mb-1.5"
          >
            GPU Usage
          </p>

        </div>

      </template>

      <VisXYContainer
        :data="chartData"
        :padding="{ top: 40 }"
        class="h-80"
      >

        <VisLine
          :x="x"
          :y="yGpu"
          color="#22c55e"
        />

        <VisArea
          :x="x"
          :y="yGpu"
          color="#22c55e"
          :opacity="0.1"
        />

        <VisAxis
          type="x"
          :x="x"
          :tick-format="xTicks"
        />

        <VisTooltip />

      </VisXYContainer>

    </UCard>

    <!-- 🔥 RAM -->

    <UCard
      :ui="{
        root: 'overflow-visible',
        body: 'px-0! pt-0! pb-3!'
      }"
    >

      <template #header>

        <div>

          <p
            class="text-xs text-muted uppercase mb-1.5"
          >
            RAM Usage
          </p>

        </div>

      </template>

      <VisXYContainer
        :data="chartData"
        :padding="{ top: 40 }"
        class="h-80"
      >

        <VisLine
          :x="x"
          :y="yRam"
          color="#f59e0b"
        />

        <VisArea
          :x="x"
          :y="yRam"
          color="#f59e0b"
          :opacity="0.1"
        />

        <VisAxis
          type="x"
          :x="x"
          :tick-format="xTicks"
        />

        <VisTooltip />

      </VisXYContainer>

    </UCard>

    <!-- 🔥 TEMPERATURA -->

    <UCard
      :ui="{
        root: 'overflow-visible',
        body: 'px-0! pt-0! pb-3!'
      }"
    >

      <template #header>

        <div>

          <p
            class="text-xs text-muted uppercase mb-1.5"
          >
            Temperature
          </p>

        </div>

      </template>

      <VisXYContainer
        :data="chartData"
        :padding="{ top: 40 }"
        class="h-80"
      >

        <VisLine
          :x="x"
          :y="yTemp"
          color="#ef4444"
        />

        <VisArea
          :x="x"
          :y="yTemp"
          color="#ef4444"
          :opacity="0.1"
        />

        <VisAxis
          type="x"
          :x="x"
          :tick-format="xTicks"
        />

        <VisTooltip />

      </VisXYContainer>

    </UCard>

  </div>

</template>

<style scoped>

.unovis-xy-container {

  --vis-crosshair-line-stroke-color:
    var(--ui-primary);

  --vis-crosshair-circle-stroke-color:
    var(--ui-bg);

  --vis-axis-grid-color:
    var(--ui-border);

  --vis-axis-tick-color:
    var(--ui-border);

  --vis-axis-tick-label-color:
    var(--ui-text-dimmed);

  --vis-tooltip-background-color:
    var(--ui-bg);

  --vis-tooltip-border-color:
    var(--ui-border);

  --vis-tooltip-text-color:
    var(--ui-text-highlighted);

}

</style>
