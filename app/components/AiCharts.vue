<script setup lang="ts">

import {
  VisXYContainer,
  VisLine,
  VisAxis,
  VisArea,
  VisCrosshair,
  VisTooltip
} from '@unovis/vue'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')

const { width } = useElementSize(cardRef)

const api = useApi()

// 🔥 OBTENER MÉTRICAS IA
const { data: response } = await useAsyncData(
  'ai-metrics-chart',
  () => api('/api/ai-metrics'),
  {
    default: () => ({
      data: []
    })
  }
)

// 🔥 FORMATEAR DATA
const chartData = computed(() => {

  return response.value.data.map((item: any) => ({

    date: new Date(item.created_at),

    fps: item.ai_fps,

    inference: item.inference_time

  }))

})

// 🔥 X/Y
const x = (_: any, i: number) => i

const y = (d: any) => d.fps

// 🔥 TOTAL PROMEDIO
const avgFps = computed(() => {

  if (!chartData.value.length)
    return 0

  const total = chartData.value.reduce(
    (acc: number, item: any) => acc + item.fps,
    0
  )

  return (total / chartData.value.length)
    .toFixed(2)

})

// 🔥 FECHAS
const formatDate = (date: Date) => {

  return date.toLocaleTimeString()

}

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

FPS: ${d.fps}
<br/>
${formatDate(d.date)}

`

</script>

<template>

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
          AI FPS
        </p>

        <p
          class="text-3xl text-highlighted font-semibold"
        >
          {{ avgFps }}
        </p>

      </div>

    </template>

    <VisXYContainer
      :data="chartData"
      :padding="{ top: 40 }"
      class="h-96"
      :width="width"
    >

      <!-- 🔥 LINE -->

      <VisLine
        :x="x"
        :y="y"
        color="var(--ui-primary)"
      />

      <!-- 🔥 AREA -->

      <VisArea
        :x="x"
        :y="y"
        color="var(--ui-primary)"
        :opacity="0.1"
      />

      <!-- 🔥 AXIS -->

      <VisAxis
        type="x"
        :x="x"
        :tick-format="xTicks"
      />

      <!-- 🔥 CROSSHAIR -->

      <VisCrosshair
        color="var(--ui-primary)"
        :template="template"
      />

      <!-- 🔥 TOOLTIP -->

      <VisTooltip />

    </VisXYContainer>

  </UCard>

</template>

<style scoped>

.unovis-xy-container {

  --vis-crosshair-line-stroke-color: var(--ui-primary);

  --vis-crosshair-circle-stroke-color: var(--ui-bg);

  --vis-axis-grid-color: var(--ui-border);

  --vis-axis-tick-color: var(--ui-border);

  --vis-axis-tick-label-color: var(--ui-text-dimmed);

  --vis-tooltip-background-color: var(--ui-bg);

  --vis-tooltip-border-color: var(--ui-border);

  --vis-tooltip-text-color: var(--ui-text-highlighted);

}

</style>