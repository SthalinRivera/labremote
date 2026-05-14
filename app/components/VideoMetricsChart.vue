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
  'video-metrics-chart',
  () => api('/api/video-metrics'),
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

    latency: item.latency_ms,

    fps: item.fps,

    jitter: item.jitter_ms,

    packetLoss: item.packet_loss

  }))

})

// 🔥 X
const x = (_: any, i: number) => i

// 🔥 Y FUNCTIONS
const yLatency = (d: any) => d.latency

const yFps = (d: any) => d.fps

const yJitter = (d: any) => d.jitter

const yPacketLoss = (d: any) => d.packetLoss

// 🔥 PROMEDIOS
const avgLatency = computed(() => {

  if (!chartData.value.length)
    return 0

  const total = chartData.value.reduce(
    (acc: number, item: any) =>
      acc + item.latency,
    0
  )

  return (total / chartData.value.length)
    .toFixed(1)

})

const avgFps = computed(() => {

  if (!chartData.value.length)
    return 0

  const total = chartData.value.reduce(
    (acc: number, item: any) =>
      acc + item.fps,
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

Latency: ${d.latency} ms
<br/>

FPS: ${d.fps}
<br/>

Jitter: ${d.jitter} ms
<br/>

Packet Loss: ${d.packetLoss}%
<br/>

${formatDate(d.date)}

`

</script>

<template>

  <div
    class="grid grid-cols-1 xl:grid-cols-2 gap-6"
  >

    <!-- 🔥 LATENCY -->

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
            Network Latency
          </p>

          <p
            class="text-3xl font-semibold"
          >
            {{ avgLatency }} ms
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
          :y="yLatency"
          color="#ef4444"
        />

        <VisArea
          :x="x"
          :y="yLatency"
          color="#ef4444"
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

    <!-- 🔥 FPS -->

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
            Video FPS
          </p>

          <p
            class="text-3xl font-semibold"
          >
            {{ avgFps }}
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
          :y="yFps"
          color="#22c55e"
        />

        <VisArea
          :x="x"
          :y="yFps"
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

    <!-- 🔥 JITTER -->

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
            Network Jitter
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
          :y="yJitter"
          color="#f59e0b"
        />

        <VisArea
          :x="x"
          :y="yJitter"
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

    <!-- 🔥 PACKET LOSS -->

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
            Packet Loss
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
          :y="yPacketLoss"
          color="#8b5cf6"
        />

        <VisArea
          :x="x"
          :y="yPacketLoss"
          color="#8b5cf6"
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