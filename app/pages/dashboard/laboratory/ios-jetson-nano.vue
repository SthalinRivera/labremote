<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'role', 'lab-session'],
  roles: ['student', 'admin']
})

const toast = useToast()
const lab = useLabStore()
const api = useApi()

// Interfaces
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

// Obtener configuración actual desde la base de datos
const { data: response, refresh: refreshConfig } = useAsyncData(
  'lab-config-full',
  () => api<{ success: boolean; data: LabConfig; message: string }>('/api/lab/config'),
  { default: () => null }
)

const config = computed(() => response.value?.data || null)

// URLs desde la configuración de la base de datos
const vncUrl = computed(() => config.value?.vm_url || '')
const camUrl = computed(() => config.value?.webcam_url || '')

const vncLoading = ref(true)
const camLoading = ref(true)
const vncError = ref(false)
const camError = ref(false)

const vncIframe = ref<HTMLIFrameElement | null>(null)
const camIframe = ref<HTMLIFrameElement | null>(null)

// Estado de servicios
const servicesStatus = ref({
  vnc: false,
  camera: false,
  vncChecking: false,
  cameraChecking: false
})

// Función para verificar si una URL responde (sin toasts de éxito)
const checkServiceStatus = async (url: string, type: 'vnc' | 'camera') => {
  if (!url) {
    if (type === 'vnc') {
      servicesStatus.value.vnc = false
      vncError.value = true
      vncLoading.value = false
      toast.add({
        title: '❌ VM no configurada',
        description: 'No hay URL configurada para la máquina virtual',
        color: 'error'
      })
    } else {
      servicesStatus.value.camera = false
      camError.value = true
      camLoading.value = false
      toast.add({
        title: '❌ Cámara no configurada',
        description: 'No hay URL configurada para la cámara',
        color: 'error'
      })
    }
    return
  }

  if (type === 'vnc') {
    servicesStatus.value.vncChecking = true
  } else {
    servicesStatus.value.cameraChecking = true
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors'
    })

    clearTimeout(timeoutId)

    if (type === 'vnc') {
      servicesStatus.value.vnc = true
      vncError.value = false
    } else {
      servicesStatus.value.camera = true
      camError.value = false
    }
  } catch (error) {
    if (type === 'vnc') {
      servicesStatus.value.vnc = false
      vncError.value = true
      vncLoading.value = false
      toast.add({
        title: '❌ VM no disponible',
        description: `No responde: ${url}`,
        color: 'error'
      })
    } else {
      servicesStatus.value.camera = false
      camError.value = true
      camLoading.value = false
      toast.add({
        title: '❌ Cámara no disponible',
        description: `No responde: ${url}`,
        color: 'error'
      })
    }
  } finally {
    if (type === 'vnc') {
      servicesStatus.value.vncChecking = false
    } else {
      servicesStatus.value.cameraChecking = false
    }
  }
}




// Verificar ambos servicios (sin toast de "Verificando...")
const checkAllServices = async () => {
  if (!config.value) {
    toast.add({ title: '⚠️ Cargando configuración...', color: 'info' })
    await refreshConfig()
    return
  }
  await Promise.all([
    checkServiceStatus(vncUrl.value, 'vnc'),
    checkServiceStatus(camUrl.value, 'camera')
  ])
}

const onVncLoad = () => {
  vncLoading.value = false
  vncError.value = false
  servicesStatus.value.vnc = true
}

const onVncError = () => {
  vncLoading.value = false
  vncError.value = true
  servicesStatus.value.vnc = false
  toast.add({ title: 'Error VNC', description: 'No se pudo conectar', color: 'error' })
}

const onCamLoad = () => {
  camLoading.value = false
  camError.value = false
  servicesStatus.value.camera = true
}

const onCamError = () => {
  camLoading.value = false
  camError.value = true
  servicesStatus.value.camera = false
  toast.add({ title: 'Error de cámara', description: 'No se pudo cargar el stream', color: 'error' })
}

const reloadVnc = () => {
  if (vncIframe.value && vncUrl.value) {
    vncLoading.value = true
    vncError.value = false
    vncIframe.value.src = vncUrl.value
    checkServiceStatus(vncUrl.value, 'vnc')
  } else if (!vncUrl.value) {
    toast.add({
      title: 'No hay URL configurada',
      description: 'Configure la URL de la VM en la configuración del laboratorio',
      color: 'warning'
    })
  }
}

const reloadCam = () => {
  if (camIframe.value && camUrl.value) {
    camLoading.value = true
    camError.value = false
    camIframe.value.src = camUrl.value
    checkServiceStatus(camUrl.value, 'camera')
  } else if (!camUrl.value) {
    toast.add({
      title: 'No hay URL configurada',
      description: 'Configure la URL de la cámara en la configuración del laboratorio',
      color: 'warning'
    })
  }
}

const capturePhoto = () => {
  setTimeout(() => {
    toast.add({ title: '📸 Foto capturada', color: 'success' })
  }, 500)
}

const timeLeftFormatted = computed(() => {
  if (!lab.timeLeft && lab.timeLeft !== 0) return '0m 0s'
  const mins = Math.floor(lab.timeLeft / 60)
  const secs = Math.floor(lab.timeLeft % 60)
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
})

// Verificar al montar el componente
onMounted(async () => {
  await refreshConfig()
  if (config.value) {
    await checkAllServices()
  }
})

// Observar cambios en la configuración
watch(config, async (newConfig) => {
  if (newConfig) {
    await checkAllServices()
  }
})
</script>

  <template>
    <UDashboardPanel id="dashboard">
      <template #header>
        <UDashboardNavbar :title="config?.name || 'Jetson Nano Lab'" :ui="{ right: 'gap-2' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right>
            <UButton size="xs" variant="ghost" icon="i-lucide-wifi"
              :loading="servicesStatus.vncChecking || servicesStatus.cameraChecking" @click="checkAllServices" />
            <UColorModeButton />
          
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <div class="p-2 min-h-full">
          <!-- Barra superior compacta -->
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <h1 class="text-base font-bold">
                {{ config?.name || 'Laboratorio Remoto' }}
              </h1>
              <UBadge color="green" variant="subtle" class="gap-1 px-1.5 py-0.5 text-xs">
                <UIcon name="i-lucide-timer" class="w-2.5 h-2.5" />
                {{ timeLeftFormatted }}
              </UBadge>
              <UBadge v-if="lab.session" color="primary" variant="solid" size="xs" class="gap-1">
                <UIcon name="i-lucide-circle-check" class="w-2.5 h-2.5" />
                Activa
              </UBadge>
              <!-- Badges de estado de servicios -->
              <UBadge :color="servicesStatus.vnc ? 'green' : 'red'" variant="solid" size="xs" class="gap-1">
                <UIcon :name="servicesStatus.vnc ? 'i-lucide-server' : 'i-lucide-server-off'" class="w-2.5 h-2.5" />
                VM
              </UBadge>
              <UBadge :color="servicesStatus.camera ? 'green' : 'red'" variant="solid" size="xs" class="gap-1">
                <UIcon :name="servicesStatus.camera ? 'i-lucide-video' : 'i-lucide-video-off'" class="w-2.5 h-2.5" />
                CAM
              </UBadge>
            </div>
          </div>

          <!-- Panel principal: VM y Cámara 50/50 -->
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-2">
            <!-- Máquina Virtual -->
            <UCard class="col-span-3 overflow-hidden p-0 shadow-sm rounded-md">
              <template #header>
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-1.5">
                    <div
                      class="w-10 h-10 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <UIcon name="i-lucide-monitor" class="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <span class="text-xs font-semibold">MAQUINA VIRTUAL</span>
                      <span class="text-[10px] text-gray-500">{{ config?.is_busy ? 'Ocupado' : 'Disponible' }}</span>
                      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Entorno Linux con Arduino IDE
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-1">
            

                    <UButton variant="ghost" size="2xs" icon="i-lucide-refresh-cw" @click="reloadVnc" />
                  </div>
                </div>
              </template>

              <div class="relative bg-black" style="height: 70vh;">
                <!-- Sin URL configurada -->
                <div v-if="!vncUrl" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 z-20">
                  <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-yellow-500 mb-2" />
                  <p class="text-white text-sm font-semibold mb-1">VM No Configurada</p>
                  <p class="text-white/70 text-xs text-center px-4">
                    No hay URL configurada para la máquina virtual.
                    <br />Contacte al administrador.
                  </p>
                </div>

                <!-- Loading -->
                <div v-else-if="vncLoading" class="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                  <div class="text-center">
                    <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-white animate-spin mb-1" />
                    <p class="text-white text-[10px]">Conectando...</p>
                  </div>
                </div>

                <!-- Error de conexión -->
                <div v-else-if="vncError"
                  class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
                  <UIcon name="i-lucide-wifi-off" class="w-8 h-8 text-red-500 mb-1" />
                  <p class="text-white text-[10px] mb-1">Error de conexión</p>
                  <UButton size="2xs" @click="reloadVnc">Reintentar</UButton>
                </div>

                <!-- Mensaje cuando el servicio está apagado -->
                <div v-else-if="!servicesStatus.vnc && !vncLoading && !vncError"
                  class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/95 z-20 backdrop-blur-sm">
                  <UIcon name="i-lucide-power" class="w-12 h-12 text-yellow-500 mb-2" />
                  <p class="text-white text-sm font-semibold mb-1">Servidor Apagado</p>
                  <p class="text-white/70 text-xs mb-2 text-center px-4">La máquina virtual no está disponible</p>
                  <UButton size="xs" color="primary" @click="reloadVnc">Reintentar</UButton>
                </div>

                <!-- iframe -->
                <iframe v-if="vncUrl" ref="vncIframe" :src="vncUrl" class="w-full h-full relative z-10" frameborder="0"
                  allow="autoplay; fullscreen" @load="onVncLoad" @error="onVncError" />
              </div>
              <template #footer>
                <p class="text-md text-center text-gray-600 dark:text-gray-400 leading-relaxed">
                  Sistema operativo: Ubuntu 20.04 LTS
                </p>
              </template>
            </UCard>
            <!-- Cámara en vivo -->
            <UCard id="cam-card" class="overflow-hidden p-0 shadow-sm rounded-md">
              <UCard id="cam-card" class="col-span-1 overflow-hidden p-0 shadow-sm rounded-md">
                <template #header>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1.5">
                      <div
                        class="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <UIcon name="i-lucide-video" class="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div class="flex items-center gap-0.5">
                          <span class="text-xs font-semibold">CÁMARA EN TIEMPO REAL</span>
                          <span class="relative flex h-1.5 w-1.5">
                            <span
                              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                          </span>
                          <span class="text-[9px] font-mono text-red-500">LIVE</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Visualización en vivo del
                          laboratorio físico</p>
                      </div>
                    </div>
                    <UButton variant="ghost" size="2xs" icon="i-lucide-refresh-cw" @click="reloadCam" />
                  </div>
                </template>

                <div class="relative bg-black" style="height: 20vh;">
                  <!-- Sin URL configurada -->
                  <div v-if="!camUrl"
                    class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 z-20">
                    <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-yellow-500 mb-2" />
                    <p class="text-white text-sm font-semibold mb-1">Cámara No Configurada</p>
                    <p class="text-white/70 text-xs text-center px-4">
                      No hay URL configurada para la cámara.
                      <br />Contacte al administrador.
                    </p>
                  </div>

                  <!-- Loading -->
                  <div v-else-if="camLoading"
                    class="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                    <div class="text-center">
                      <UIcon name="i-lucide-loader-2" class="w-5 h-5 text-white animate-spin mb-1" />
                      <p class="text-white text-[10px]">Cargando...</p>
                    </div>
                  </div>

                  <!-- Error de conexión -->
                  <div v-else-if="camError"
                    class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
                    <UIcon name="i-lucide-camera-off" class="w-6 h-6 text-red-500 mb-1" />
                    <p class="text-white text-[10px] mb-1">Error de conexión</p>
                    <UButton size="2xs" @click="reloadCam">Reintentar</UButton>
                  </div>

                  <!-- Mensaje cuando la cámara está apagada -->
                  <div v-else-if="!servicesStatus.camera && !camLoading && !camError"
                    class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/95 z-20 backdrop-blur-sm">
                    <UIcon name="i-lucide-video-off" class="w-12 h-12 text-red-500 mb-2" />
                    <p class="text-white text-sm font-semibold mb-1">Stream Desconectado</p>
                    <p class="text-white/70 text-xs mb-2 text-center px-4">La cámara no está transmitiendo en vivo</p>
                    <UButton size="xs" color="primary" @click="reloadCam">Reintentar</UButton>
                  </div>

                  <!-- iframe -->
                  <iframe v-if="camUrl" ref="camIframe" :src="camUrl" class="w-full h-full relative z-10"
                    frameborder="0" allow="autoplay; fullscreen" @load="onCamLoad" @error="onCamError" />
                </div>
                <template #footer>
                  <div class="grid grid-cols-3 gap-2">
                    <UButton color="primary" variant="solid" size="sm" class="justify-center gap-2"
                      @click="capturePhoto">
                      <UIcon name="i-lucide-camera" class="w-4 h-4" />
                      Capturar
                    </UButton>

                  </div>
                </template>
              </UCard>
               <!-- Sección Estado del Sistema -->
              <UCard class="p-0 shadow-sm rounded-md">
                <template #header>
                  <div class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-activity" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Estado del Sistema
                    </span>
                  </div>
                </template>

                <div class="p-1">
                  <div class="grid grid-cols-1  gap-4">
                    <!-- Servidor -->
                    <div
                      class="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-server" class="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-200">Servidor</p>
                      </div>
                      <span
                        class="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Online</span>
                    </div>

                    <!-- VM -->
                    <div
                      class="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-cpu" class="w-5 h-5 text-purple-500 dark:text-purple-400" />
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-200">VM</p>
                      </div>
                      <span
                        :class="servicesStatus.vnc ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : 'text-red-600 bg-red-50 dark:bg-red-900/30'"
                        class="text-xs font-semibold px-2 py-0.5 rounded-full">
                        {{ servicesStatus.vnc ? 'Activa' : 'Inactiva' }}
                      </span>
                    </div>

                    <!-- Cámara -->
                    <div
                      class="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-webcam" class="w-5 h-5 text-red-500 dark:text-red-400" />
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-200">Cámara</p>
                      </div>
                      <div
                        :class="servicesStatus.camera ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'"
                        class="flex items-center gap-1.5 px-2 py-0.5 rounded-full">
                        <div v-if="servicesStatus.camera" class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse">
                        </div>
                        <div v-else class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <span
                          :class="servicesStatus.camera ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                          class="text-xs font-semibold">
                          {{ servicesStatus.camera ? 'Streaming' : 'Offline' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </UCard>
              <UCard class="p-0 shadow-sm rounded-md">
                <template #header>
                  <div class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-key-round" class="w-3 h-3 text-purple-500" />
                    <span class="text-[10px] font-bold uppercase tracking-wide">
                      Clave de Acceso
                    </span>
                  </div>
                </template>

                <div class="p-0">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Clave: <span class="font-semibold text-black dark:text-white">123456</span>
                  </p>
                </div>
              </UCard>
            </UCard>
          </div>

         
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">



          </div>
        </div>
      </template>
    </UDashboardPanel>


  </template>

<style scoped>
iframe {
  transition: all 0.2s ease;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
}
</style> 