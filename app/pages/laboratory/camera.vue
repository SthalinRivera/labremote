<script setup lang="ts">
definePageMeta({
    layout: 'student',
    roles: ['student', 'docente'],
    middleware: ['lab-session']
})

const toast = useToast()
const lab = useLabStore()
const config = useRuntimeConfig()

const camUrl = ref(config.public.camUrl || 'https://triangle-perception-monte-trek.trycloudflare.com/cam/')
const camLoading = ref(true)
const camError = ref(false)
const isFullscreen = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)

const onCamLoad = () => {
    camLoading.value = false
    camError.value = false
    toast.add({ title: 'Stream de cámara conectado', color: 'success' })
}
const onCamError = () => {
    camLoading.value = false
    camError.value = true
    toast.add({ title: 'Error de conexión', description: 'No se pudo cargar el stream de video', color: 'error' })
}
const reloadCam = () => {
    if (iframeRef.value) {
        camLoading.value = true
        camError.value = false
        iframeRef.value.src = camUrl.value
    }
}
const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        isFullscreen.value = true
    } else {
        document.exitFullscreen()
        isFullscreen.value = false
    }
}

const timeLeftFormatted = computed(() => {
    if (lab.timeLeft === null || lab.timeLeft === undefined) return '--:--'
    const mins = Math.floor(lab.timeLeft / 60)
    const secs = lab.timeLeft % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
})
</script>

<template>
        <UDashboardPanel id="dashboard">
              <template #header>
         <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UColorModeButton />
            <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

        
        </template>
      </UDashboardNavbar>
      </template>
      <template #body>

         <LabSessionGuard>
    <div class="container mx-auto px-4 py-6 max-w-7xl">
        <!-- Header con info de sesión -->
        <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Cámara en vivo</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">Jetson Nano - Detección en tiempo real</p>
            </div>
            <div class="flex items-center gap-3">
                <UBadge color="green" variant="subtle" class="gap-1.5">
                    <UIcon name="i-lucide-timer" class="w-3.5 h-3.5" />
                    {{ timeLeftFormatted }}
                </UBadge>
                <UButton variant="outline" size="sm" :icon="isFullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
                    @click="toggleFullscreen" />
            </div>
        </div>

        <!-- Contenedor principal -->
        <UCard class="overflow-hidden p-0">
            <!-- Barra de herramientas -->
            <div
                class="flex flex-wrap justify-between items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-video" class="w-4 h-4 text-red-500" />
                    <span class="text-sm font-medium">Stream de cámara</span>
                    <UBadge v-if="lab.session" color="green" variant="solid" size="xs">Sesión activa</UBadge>
                </div>
                <div class="flex gap-2">
                    <UButton variant="ghost" size="xs" icon="i-lucide-refresh-cw" @click="reloadCam" />
                </div>
            </div>

            <!-- Área del iframe -->
            <div class="relative bg-black" style="min-height: 60vh;">
                <!-- Loader -->
                <div v-if="camLoading"
                    class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                    <UProgress infinite class="w-64" />
                    <p class="text-white text-sm mt-4">Conectando al stream de video...</p>
                </div>
                <!-- Error -->
                <div v-else-if="camError"
                    class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
                    <UIcon name="i-lucide-camera-off" class="w-12 h-12 text-red-500 mb-3" />
                    <p class="text-white font-medium">No se pudo cargar la cámara</p>
                    <UButton size="sm" class="mt-4" @click="reloadCam">Reintentar</UButton>
                </div>
                <!-- Iframe -->
                <iframe ref="iframeRef" :src="camUrl" class="w-full h-[65vh]" frameborder="0" allow="autoplay"
                    @load="onCamLoad" @error="onCamError" />
                <!-- Overlay informativo -->
                <div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md text-xs">
                    <span class="text-red-400 font-mono">● REC</span>
                    <span class="text-gray-300 ml-2">Detección en tiempo real</span>
                </div>
            </div>
        </UCard>

        <!-- Instrucciones adicionales -->
        <UCard class="mt-6">
            <template #header>
                <h2 class="font-semibold flex items-center gap-2">
                    <UIcon name="i-lucide-info" />
                    Acerca de la cámara
                </h2>
            </template>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>La cámara muestra el entorno del laboratorio remoto donde se encuentra la Jetson Nano. Podrás
                    observar:</p>
                <ul class="list-disc list-inside space-y-1 ml-2">
                    <li>El estado físico del hardware</li>
                    <li>Movimientos de actuadores y sensores</li>
                    <li>Resultados de detección de objetos en tiempo real</li>
                </ul>
                <p class="mt-2 text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <UIcon name="i-lucide-alert-triangle" class="w-4 h-4" />
                    <span>No actualices la página mientras la sesión esté activa para no perder el stream.</span>
                </p>
            </div>
        </UCard>
    </div>
    </LabSessionGuard>
    </template>
     </UDashboardPanel>
</template>