<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  roles: ['student', 'docente'],
  middleware: ['lab-session']
})

const toast = useToast()
const lab = useLabStore()
const api = useApi()

interface LabConfig {
  id: string
  name: string
  is_busy: boolean
  session_duration_seconds: number
  vm_url: string | null
  webcam_url: string | null
  current_session_id: string | null
  updated_at: string
}

const camLoading = ref(true)
const camError = ref(false)
const camIframe = ref<HTMLIFrameElement | null>(null)

const { data: response, refresh: refreshConfig } = useAsyncData(
  'lab-config-camera',
  () => api<{ success: boolean; data: LabConfig; message: string }>('/api/lab/config'),
  { default: () => null }
)

const config = computed(() => response.value?.data || null)
const camUrl = computed(() => config.value?.webcam_url || '')

const onCamLoad = () => {
  camLoading.value = false
  camError.value = false
  toast.add({ title: 'Cámara conectada', color: 'success' })
}

const onCamError = () => {
  camLoading.value = false
  camError.value = true
  toast.add({ title: 'Error de cámara', description: 'No se pudo cargar el stream', color: 'error' })
}

const reloadCam = () => {
  if (camIframe.value && camUrl.value) {
    camLoading.value = true
    camError.value = false
    // Forzar recarga asignando un timestamp para evitar caché
    camIframe.value.src = camUrl.value.includes('?') 
      ? `${camUrl.value}&_=${Date.now()}` 
      : `${camUrl.value}?_=${Date.now()}`
  } else if (!camUrl.value) {
    toast.add({ title: 'No hay URL configurada', color: 'warning' })
  }
}

const handleCapture = () => {
  toast.add({ title: 'Captura simulada', color: 'info' })
}

const handleRecord = () => {
  toast.add({ title: 'Grabación simulada', color: 'info' })
}

const handleFullscreen = () => {
  const camCard = document.getElementById('cam-card')
  if (camCard) {
    if (!document.fullscreenElement) camCard.requestFullscreen()
    else document.exitFullscreen()
  }
}

const timeLeftFormatted = computed(() => {
  if (lab.timeLeft === null || lab.timeLeft === undefined) return '0m 0s'
  const mins = Math.floor(lab.timeLeft / 60)
  const secs = Math.floor(lab.timeLeft % 60)
  return `${mins}m:${secs.toString().padStart(2, '0')}s`
})

onMounted(async () => {
  await refreshConfig()
})
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar :title="`Dashboard - ${config?.name || 'Cámara en vivo'}`">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton size="xs" variant="ghost" icon="i-lucide-refresh-cw" @click="refreshConfig" />
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-2 min-h-full">
        <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div>
            <h1 class="text-2xl font-bold">{{ config?.name || 'Cámara en vivo' }}</h1>
            <p class="text-sm text-gray-500">{{ config?.is_busy ? 'Ocupado' : 'Disponible' }} - Detección en tiempo real</p>
          </div>
          <div class="flex items-center gap-3">
            <UBadge color="green" variant="subtle" class="gap-1.5">
              <UIcon name="i-lucide-timer" /> {{ timeLeftFormatted }}
            </UBadge>
            <UBadge :color="config?.is_busy ? 'red' : 'green'" variant="solid">
              {{ config?.is_busy ? 'Ocupado' : 'Disponible' }}
            </UBadge>
          </div>
        </div>

        <UCard id="cam-card" class="overflow-hidden p-0">
          <template #header>
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <UIcon name="i-lucide-video" class="text-white w-6 h-6" />
                </div>
                <div>
                  <span class="text-xs font-semibold">CÁMARA EN TIEMPO REAL</span>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Visualización en vivo del laboratorio físico</p>
                </div>
              </div>
              <UButton variant="ghost" icon="i-lucide-refresh-cw" @click="reloadCam" />
            </div>
          </template>

          <div class="relative bg-black" style="height: 55vh;">
            <!-- Sin URL -->
            <div v-if="!camUrl" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
              <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-yellow-500 mb-2" />
              <p class="text-white text-sm">Cámara no configurada</p>
              <p class="text-white/70 text-xs">Contacte al administrador</p>
            </div>

            <!-- Loading -->
            <div v-else-if="camLoading" class="absolute inset-0 flex items-center justify-center bg-black/80">
              <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-white animate-spin" />
            </div>

            <!-- Error -->
            <div v-else-if="camError" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <UIcon name="i-lucide-wifi-off" class="w-8 h-8 text-red-500 mb-1" />
              <p class="text-white text-xs mb-1">No se pudo cargar el stream</p>
              <UButton size="2xs" @click="reloadCam">Reintentar</UButton>
            </div>

            <!-- Iframe: siempre se crea si hay URL, los eventos controlan loading/error -->
            <iframe
              v-if="camUrl"
              ref="camIframe"
              :src="camUrl"
              class="w-full h-full"
              frameborder="0"
              allow="autoplay; fullscreen"
              @load="onCamLoad"
              @error="onCamError"
            />
          </div>

          <template #footer>
            <div class="grid grid-cols-3 gap-2">
              <UButton color="primary" size="sm" icon="i-lucide-camera" @click="handleCapture">Capturar</UButton>
           
            </div>
          </template>
        </UCard>

        <div v-if="response?.pending" class="flex justify-center p-12">
          <UIcon name="i-lucide-loader-circle" class="animate-spin w-6 h-6 text-primary-500" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>