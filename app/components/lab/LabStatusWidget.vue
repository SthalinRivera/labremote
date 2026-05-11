<!-- components/lab/LabStatusWidget.vue -->
<script setup lang="ts">
const api = useApi()

interface LabStatus {
  id: string
  name: string
  is_busy: boolean
  queue_length: number
  session_duration_seconds: number
  vm_url: string | null
  webcam_url: string | null
  current_session: {
    id: string
    name: string
    email: string
    started_at: string
    ends_at: string
  } | null
  updated_at: string
}

// ✅ Manejar la respuesta anidada
const { data: response, refresh } = useAsyncData(
  'lab-status',
  () => api<{ success: boolean; data: LabStatus; message: string }>('/api/lab/status'),
  { refreshInterval: 5000 }
)

// ✅ Extraer el status real
const status = computed(() => response.value?.data || null)
</script>

<template>
  <div v-if="status" class="space-y-4">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-microchip" class="text-xl" />
            <h3 class="text-lg font-semibold">{{ status.name }}</h3>
          </div>
          <UBadge :color="status.is_busy ? 'error' : 'success'">
            {{ status.is_busy ? 'Ocupado' : 'Disponible' }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-3">
        <!-- Estado de sesión actual -->
        <div v-if="status.current_session" class="rounded-lg bg-muted p-3">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-lucide-user" />
            <span class="font-medium">Sesión actual:</span>
          </div>
          <div class="text-sm space-y-1 ml-6">
            <div>{{ status.current_session.name }} ({{ status.current_session.email }})</div>
            <div class="text-muted">
              Inicio: {{ new Date(status.current_session.started_at).toLocaleTimeString() }}
            </div>
            <div class="text-muted">
              Finaliza: {{ new Date(status.current_session.ends_at).toLocaleTimeString() }}
            </div>
          </div>
        </div>

        <!-- Cola de espera -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" />
            <span>En cola de espera:</span>
          </div>
          <UBadge color="neutral">{{ status.queue_length }}</UBadge>
        </div>

        <!-- Duración de sesión -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-clock" />
            <span>Duración sesión:</span>
          </div>
          <span>{{ Math.floor(status.session_duration_seconds / 60) }} minutos</span>
        </div>

        <!-- URLs configuradas -->
        <div v-if="status.vm_url" class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-monitor" />
          <span class="text-muted">VM:</span>
          <a :href="status.vm_url" target="_blank" class="text-primary hover:underline truncate">
            {{ status.vm_url }}
          </a>
        </div>

        <div v-if="status.webcam_url" class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-video" />
          <span class="text-muted">Cámara:</span>
          <a :href="status.webcam_url" target="_blank" class="text-primary hover:underline truncate">
            {{ status.webcam_url }}
          </a>
        </div>

        <!-- Última actualización -->
        <div class="pt-2 text-xs text-muted">
          Actualizado: {{ new Date(status.updated_at).toLocaleString() }}
        </div>
      </div>
    </UCard>
  </div>

  <div v-else-if="response?.pending" class="text-center text-muted p-8">
    <UIcon name="i-lucide-loader-circle" class="animate-spin text-2xl mb-2" />
    <div>Cargando estado del laboratorio...</div>
  </div>

  <div v-else class="text-center text-muted p-8">
    <UIcon name="i-lucide-alert-circle" class="text-2xl mb-2" />
    <div>No se pudo cargar el estado</div>
  </div>
</template>