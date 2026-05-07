<script setup lang="ts">
definePageMeta({
  layout: 'student',
 middleware: ['auth', 'role', 'lab-session'],
    roles: ['student', 'admin']
})

const toast = useToast()
const lab = useLabStore()

// URLs desde variables de entorno (recomendado)
const config = useRuntimeConfig()
const vncUrl = ref(config.public.vncUrl || 'https://sao-process-entertaining-default.trycloudflare.com/vnc.html')
const camUrl = ref(config.public.camUrl || 'https://triangle-perception-monte-trek.trycloudflare.com/cam/')

// Estado de carga y errores
const vncLoading = ref(true)
const camLoading = ref(true)
const vncError = ref(false)
const camError = ref(false)
const isFullscreen = ref(false)

// Referencias a los iframes
const vncIframe = ref<HTMLIFrameElement | null>(null)
const camIframe = ref<HTMLIFrameElement | null>(null)

// Manejo de carga de iframes
const onVncLoad = () => {
  vncLoading.value = false
  vncError.value = false
  toast.add({ title: 'Escritorio remoto conectado', color: 'success' })
}
const onVncError = () => {
  vncLoading.value = false
  vncError.value = true
  toast.add({ title: 'Error de conexión VNC', description: 'No se pudo cargar el escritorio remoto', color: 'error' })
}
const onCamLoad = () => {
  camLoading.value = false
  camError.value = false
}
const onCamError = () => {
  camLoading.value = false
  camError.value = true
  toast.add({ title: 'Error de cámara', description: 'No se pudo cargar el stream de video', color: 'error' })
}

// Recargar iframes
const reloadVnc = () => {
  if (vncIframe.value) {
    vncLoading.value = true
    vncError.value = false
    vncIframe.value.src = vncUrl.value
  }
}
const reloadCam = () => {
  if (camIframe.value) {
    camLoading.value = true
    camError.value = false
    camIframe.value.src = camUrl.value
  }
}

// Pantalla completa para el VNC
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// Limpiar tiempo restante (el lab store ya tiene la info)
const timeLeftFormatted = computed(() => {
  if (!lab.timeLeft && lab.timeLeft !== 0) return '--:--'
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

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
  
</template>

    <template #body>
    
  <div class="container mx-auto px-4 py-6 ">
    <!-- Encabezado con info de sesión -->
    <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Laboratorio Remoto</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Jetson Nano - Escritorio remoto VNC</p>
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

    <!-- Contenedor principal del laboratorio -->
    <UCard class="overflow-hidden p-0">
      <!-- Barra de herramientas -->
      <div
        class="flex flex-wrap justify-between items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-monitor" class="w-4 h-4 text-gray-500" />
          <span class="text-sm font-medium">Escritorio remoto</span>
          <UBadge v-if="lab.session" color="green" variant="solid" size="xs">Sesión activa</UBadge>
        </div>
        <div class="flex gap-2">
          <UButton variant="ghost" size="xs" icon="i-lucide-refresh-cw" @click="reloadVnc" />
        </div>
      </div>

      <!-- Área VNC (iframe) -->
      <div class="relative bg-black" :style="{ minHeight: '60vh' }">
        <!-- Loader -->
        <div v-if="vncLoading" class="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <UProgress infinite class="w-64" />
          <p class="text-white text-sm mt-4">Conectando al escritorio remoto...</p>
        </div>
        <!-- Error -->
        <div v-else-if="vncError" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <UIcon name="i-lucide-wifi-off" class="w-12 h-12 text-red-500 mb-3" />
          <p class="text-white font-medium">No se pudo establecer conexión VNC</p>
          <UButton size="sm" class="mt-4" @click="reloadVnc">Reintentar</UButton>
        </div>
        <!-- Iframe -->
        <iframe ref="vncIframe" :src="vncUrl" class="w-full h-[65vh]" frameborder="0" allow="autoplay; fullscreen"
          @load="onVncLoad" @error="onVncError" />
      </div>
    </UCard>

    <!-- Cámara en vivo (overlay o sección separada) -->
    <div class="mt-6 grid md:grid-cols-3 gap-4">
      <UCard class="md:col-span-1 overflow-hidden p-0">
        <div class="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-video" class="w-4 h-4 text-red-500" />
            <span class="text-sm font-medium">Cámara en vivo</span>
            <UBadge color="red" variant="solid" size="xs">REC</UBadge>
          </div>
          <UButton variant="ghost" size="xs" icon="i-lucide-refresh-cw" @click="reloadCam" />
        </div>
        <div class="relative bg-black aspect-video">
          <div v-if="camLoading" class="absolute inset-0 flex items-center justify-center bg-black/80">
            <UProgress infinite class="w-32" />
          </div>
          <div v-else-if="camError" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
            <UIcon name="i-lucide-camera-off" class="w-8 h-8 text-red-500" />
            <p class="text-xs text-white mt-2">Error de stream</p>
          </div>
          <iframe ref="camIframe" :src="camUrl" class="w-full h-full" frameborder="0" allow="autoplay" @load="onCamLoad"
            @error="onCamError" />
        </div>
      </UCard>

      <!-- Información adicional del laboratorio (opcional) -->
      <UCard class="md:col-span-2">
        <template #header>
          <h2 class="font-semibold flex items-center gap-2">
            <UIcon name="i-lucide-info" />
            Instrucciones de uso
          </h2>
        </template>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li class="flex gap-2">
            <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mt-0.5" /> Utiliza el escritorio remoto para
            controlar la
            Jetson Nano.
          </li>
          <li class="flex gap-2">
            <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mt-0.5" /> La cámara muestra en tiempo real el
            hardware.
          </li>
          <li class="flex gap-2">
            <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mt-0.5" /> Al finalizar, cierra sesión desde el
            panel de
            control.
          </li>
          <li class="flex gap-2">
            <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-yellow-500 mt-0.5" /> No cierres esta ventana
            mientras
            usas el laboratorio.
          </li>
        </ul>
      </UCard>
    </div>
  </div>
  
    </template>
   </UDashboardPanel>
</template>

<style scoped>
/* Los estilos se manejan con Tailwind, no es necesario añadir CSS adicional */
</style>