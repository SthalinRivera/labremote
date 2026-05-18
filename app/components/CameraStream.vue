<!-- components/lab/CameraStream.vue -->
<script setup lang="ts">
interface Props {
    camUrl?: string
    showTimer?: boolean
    timeLeft?: number | null
}

const props = withDefaults(defineProps<Props>(), {
    camUrl: '',
    showTimer: true,
    timeLeft: null
})

const emit = defineEmits<{
    capture: []
    record: []
    fullscreen: []
}>()

const toast = useToast()

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
        iframeRef.value.src = props.camUrl
    }
}

const capturePhoto = () => {
    emit('capture')
}

const recordScreen = () => {
    emit('record')
}

const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        isFullscreen.value = true
    } else {
        document.exitFullscreen()
        isFullscreen.value = false
    }
    emit('fullscreen')
}

const timeLeftFormatted = computed(() => {
    if (props.timeLeft === null || props.timeLeft === undefined) return '--:--'
    const mins = Math.floor(props.timeLeft / 60)
    const secs = props.timeLeft % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
})
</script>

<template>
    <UCard id="cam-card" class="overflow-hidden p-0 shadow-sm rounded-md">
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
                        <p class="text-sm text-center text-gray-600 dark:text-gray-400 leading-relaxed">Visualización en
                            vivo del laboratorio físico</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <UBadge v-if="showTimer && timeLeft !== null" color="green" variant="subtle" class="gap-1.5">
                        <UIcon name="i-lucide-timer" class="w-3.5 h-3.5" />
                        {{ timeLeftFormatted }}
                    </UBadge>
                    <UButton variant="ghost" size="2xs" icon="i-lucide-refresh-cw" @click="reloadCam" />
                </div>
            </div>
        </template>

        <div class="relative bg-black" style="height: 100vh;">
            <!-- Loader -->
            <div v-if="camLoading" class="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                <div class="text-center">
                    <UIcon name="i-lucide-loader-2" class="w-5 h-5 text-white animate-spin mb-1" />
                    <p class="text-white text-[10px]">Cargando...</p>
                </div>
            </div>

            <!-- Error -->
            <div v-else-if="camError"
                class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
                <UIcon name="i-lucide-camera-off" class="w-6 h-6 text-red-500 mb-1" />
                <p class="text-white text-[10px] mb-1">Error de conexión</p>
                <UButton size="2xs" @click="reloadCam">Reintentar</UButton>
            </div>

            <!-- Iframe -->
            <iframe ref="iframeRef" :src="camUrl" class="w-full h-full relative z-10" frameborder="0"
                allow="autoplay; fullscreen" @load="onCamLoad" @error="onCamError" />
            
            <!-- Overlay de grabación (opcional) -->
            <div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                <div class="flex items-center gap-1.5">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span class="text-[10px] text-white font-mono">EN VIVO</span>
                </div>
            </div>
        </div>
        
        <template #footer>
            <div class="grid grid-cols-3 gap-2">
                <UButton color="primary" variant="solid" size="sm" class="justify-center gap-2" @click="capturePhoto">
                    <UIcon name="i-lucide-camera" class="w-4 h-4" />
                    Capturar
                </UButton>
                <UButton color="red" variant="solid" size="sm" class="justify-center gap-2" @click="recordScreen">
                    <UIcon name="i-lucide-circle" class="w-4 h-4" />
                    Grabar
                </UButton>
                <UButton color="gray" variant="solid" size="sm" class="justify-center gap-2"
                    @click="toggleFullscreen">
                    <UIcon name="i-lucide-maximize-2" class="w-4 h-4" />
                    Pantalla Completa
                </UButton>
            </div>
        </template>
    </UCard>
</template>