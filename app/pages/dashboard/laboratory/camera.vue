<script setup lang="ts">
definePageMeta({
    layout: 'dashboard',
    roles: ['student', 'docente'],
    middleware: ['lab-session']
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

// Estados
const camLoading = ref(true)
const camError = ref(false)
const isCheckingUrl = ref(false)
const urlStatus = ref<'checking' | 'available' | 'unavailable'>('checking')
const errorMessage = ref('')
const camIframe = ref<HTMLIFrameElement | null>(null)

// Obtener configuración desde la base de datos
const { data: response, refresh: refreshConfig } = useAsyncData(
    'lab-config-camera',
    () => api<{ success: boolean; data: LabConfig; message: string }>('/api/lab/config'),
    { default: () => null }
)

const config = computed(() => response.value?.data || null)
const camUrl = computed(() => config.value?.webcam_url || '')

// Función mejorada para verificar el stream de cámara
const checkCameraStream = async (url: string): Promise<boolean> => {
    if (!url) return false
    
    return new Promise((resolve) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos
        
        // Crear un elemento img para probar si el stream realmente sirve imágenes
        const img = new Image()
        let attempts = 0
        const maxAttempts = 3
        
        const checkImage = () => {
            attempts++
            const testUrl = url.includes('?') 
                ? `${url}&_=${Date.now()}` 
                : `${url}?_=${Date.now()}`
            
            img.src = testUrl
        }
        
        img.onload = () => {
            clearTimeout(timeoutId)
            resolve(true)
        }
        
        img.onerror = () => {
            if (attempts < maxAttempts) {
                // Reintentar con un nuevo intento después de 1 segundo
                setTimeout(checkImage, 1000)
            } else {
                clearTimeout(timeoutId)
                resolve(false)
            }
        }
        
        // Iniciar la primera verificación
        checkImage()
        
        // Timeout general
        timeoutId
    })
}

// Función para verificar si la URL responde (más simple)
const checkUrlResponse = async (url: string): Promise<boolean> => {
    if (!url) return false
    
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal,
            cache: 'no-cache'
        })
        
        clearTimeout(timeoutId)
        return true
    } catch (error) {
        return false
    }
}

// Verificar disponibilidad de la cámara (combinando métodos)
const verifyCameraAvailability = async () => {
    if (!camUrl.value) {
        urlStatus.value = 'unavailable'
        camError.value = true
        camLoading.value = false
        errorMessage.value = 'No hay URL configurada para la cámara'
        return false
    }
    
    urlStatus.value = 'checking'
    isCheckingUrl.value = true
    camLoading.value = true
    camError.value = false
    errorMessage.value = ''
    
    try {
        // Primero verificar si la URL responde
        const responds = await checkUrlResponse(camUrl.value)
        
        if (!responds) {
            urlStatus.value = 'unavailable'
            camError.value = true
            camLoading.value = false
            errorMessage.value = 'La cámara no responde'
            toast.add({
                title: '❌ Cámara no disponible',
                description: 'No se puede conectar al servidor de la cámara',
                color: 'error'
            })
            return false
        }
        
        // Luego verificar si realmente sirve un stream válido
        const isValidStream = await checkCameraStream(camUrl.value)
        
        if (isValidStream) {
            urlStatus.value = 'available'
            camError.value = false
            camLoading.value = false
            toast.add({
                title: '✅ Cámara disponible',
                description: 'El stream de video está activo',
                color: 'success'
            })
            return true
        } else {
            urlStatus.value = 'unavailable'
            camError.value = true
            camLoading.value = false
            errorMessage.value = 'El stream de cámara no es válido o no responde'
            toast.add({
                title: '❌ Stream no válido',
                description: 'La URL no proporciona un stream de video válido',
                color: 'error'
            })
            return false
        }
    } catch (error) {
        urlStatus.value = 'unavailable'
        camError.value = true
        camLoading.value = false
        errorMessage.value = 'Error al verificar la cámara'
        toast.add({
            title: '❌ Error de verificación',
            description: 'No se pudo verificar el estado de la cámara',
            color: 'error'
        })
        return false
    } finally {
        isCheckingUrl.value = false
    }
}

// Evento cuando el iframe carga
const onCamLoad = () => {
    camLoading.value = false
    camError.value = false
    urlStatus.value = 'available'
    toast.add({ 
        title: 'Cámara conectada', 
        description: 'Stream de video activo',
        color: 'success' 
    })
}

// Evento cuando el iframe tiene error
const onCamError = () => {
    camLoading.value = false
    camError.value = true
    urlStatus.value = 'unavailable'
    toast.add({ 
        title: 'Error de cámara', 
        description: 'No se pudo cargar el stream de video',
        color: 'error' 
    })
}

// Recargar la cámara
const reloadCam = () => {
    if (camIframe.value && camUrl.value) {
        camLoading.value = true
        camError.value = false
        urlStatus.value = 'checking'
        camIframe.value.src = camUrl.value
        // Verificar nuevamente después de recargar
        setTimeout(() => verifyCameraAvailability(), 1000)
    } else if (!camUrl.value) {
        toast.add({
            title: 'No hay URL configurada',
            description: 'Configure la URL de la cámara en la configuración del laboratorio',
            color: 'warning'
        })
    }
}

// Función para reintentar la verificación
const retryVerification = () => {
    verifyCameraAvailability()
}

// Manejadores de eventos
const handleCapture = () => {
    if (urlStatus.value !== 'available') {
        toast.add({ 
            title: 'Cámara no disponible', 
            description: 'Espera a que la cámara esté conectada', 
            color: 'warning' 
        })
        return
    }
    toast.add({ 
        title: 'Captura de foto', 
        description: 'Funcionalidad en desarrollo', 
        color: 'info' 
    })
}

const handleRecord = () => {
    if (urlStatus.value !== 'available') {
        toast.add({ 
            title: 'Cámara no disponible', 
            description: 'Espera a que la cámara esté conectada', 
            color: 'warning' 
        })
        return
    }
    toast.add({ 
        title: 'Grabación iniciada', 
        description: 'Funcionalidad en desarrollo', 
        color: 'info' 
    })
}

const handleFullscreen = () => {
    const camCard = document.getElementById('cam-card')
    if (camCard) {
        if (!document.fullscreenElement) {
            camCard.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }
}

const timeLeftFormatted = computed(() => {
    if (lab.timeLeft === null || lab.timeLeft === undefined) return '0m 0s'
    const mins = Math.floor(lab.timeLeft / 60)
    const secs = Math.floor(lab.timeLeft % 60)
    return `${mins}m:${secs.toString().padStart(2, '0')}s`
})

// Verificar cuando cambie la URL de la cámara
watch(camUrl, async (newUrl) => {
    if (newUrl) {
        await verifyCameraAvailability()
        // Si el iframe existe, actualizar su src
        if (camIframe.value && urlStatus.value === 'available') {
            camIframe.value.src = newUrl
        }
    } else {
        urlStatus.value = 'unavailable'
        camError.value = true
        camLoading.value = false
        errorMessage.value = 'No hay URL configurada'
    }
}, { immediate: true })

// Recargar configuración y verificar
const reloadConfig = async () => {
    await refreshConfig()
    if (camUrl.value) {
        await verifyCameraAvailability()
    }
    toast.add({ 
        title: 'Configuración actualizada', 
        description: 'Verificando disponibilidad de la cámara', 
        color: 'info' 
    })
}

// Verificación periódica cada 30 segundos
let intervalId: NodeJS.Timeout

onMounted(async () => {
    await refreshConfig()
    if (camUrl.value) {
        await verifyCameraAvailability()
    }
    
    // Verificación periódica para monitorear el estado
    intervalId = setInterval(async () => {
        if (camUrl.value && urlStatus.value === 'available') {
            const isAvailable = await checkCameraStream(camUrl.value)
            if (!isAvailable) {
                urlStatus.value = 'unavailable'
                camError.value = true
                toast.add({
                    title: '⚠️ Cámara desconectada',
                    description: 'El stream de video se ha interrumpido',
                    color: 'warning'
                })
            }
        }
    }, 30000) // Cada 30 segundos
})

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId)
    }
})
</script>

<template>
    <UDashboardPanel id="dashboard">
        <template #header>
            <UDashboardNavbar :title="`Dashboard - ${config?.name || 'Cámara en vivo'}`" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton 
                        size="xs" 
                        variant="ghost" 
                        icon="i-lucide-refresh-cw"
                        :loading="isCheckingUrl"
                        @click="reloadConfig"
                    />
                    <UColorModeButton />
                </template>
            </UDashboardNavbar>
        </template>
        
        <template #body>
         
                <div class="p-2 min-h-full">
                    <!-- Header con info de sesión -->
                    <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
                        <div>
                            <h1 class="text-2xl font-bold tracking-tight">
                                {{ config?.name || 'Cámara en vivo' }}
                            </h1>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                {{ config?.is_busy ? 'Laboratorio ocupado' : 'Laboratorio disponible' }} - Detección en tiempo real
                            </p>
                        </div>
                        <div class="flex items-center gap-3">
                            <UBadge color="green" variant="subtle" class="gap-1.5">
                                <UIcon name="i-lucide-timer" class="w-3.5 h-3.5" />
                                {{ timeLeftFormatted }}
                            </UBadge>
                            <UBadge 
                                :color="config?.is_busy ? 'red' : 'green'" 
                                variant="solid" 
                                size="sm"
                                class="gap-1"
                            >
                                <UIcon :name="config?.is_busy ? 'i-lucide-alarm-clock' : 'i-lucide-check-circle'" class="w-3 h-3" />
                                {{ config?.is_busy ? 'Ocupado' : 'Disponible' }}
                            </UBadge>
                            <!-- Indicador de estado de la cámara -->
                            <UBadge 
                                :color="urlStatus === 'available' ? 'green' : urlStatus === 'checking' ? 'yellow' : 'red'"
                                variant="subtle"
                                size="sm"
                                class="gap-1"
                            >
                                <UIcon 
                                    :name="urlStatus === 'available' ? 'i-lucide-wifi' : urlStatus === 'checking' ? 'i-lucide-loader-circle' : 'i-lucide-wifi-off'"
                                    :class="urlStatus === 'checking' ? 'animate-spin' : ''"
                                    class="w-3 h-3"
                                />
                                {{ urlStatus === 'available' ? 'Conectado' : urlStatus === 'checking' ? 'Verificando...' : 'Desconectado' }}
                            </UBadge>
                        </div>
                    </div>

                    <!-- Contenedor de la cámara -->
                    <UCard id="cam-card" class="overflow-hidden p-0 shadow-sm rounded-md">
                        <template #header>
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-1.5">
                                    <div class="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                        <UIcon name="i-lucide-video" class="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-0.5">
                                            <span class="text-xs font-semibold">CÁMARA EN TIEMPO REAL</span>
                                            <span v-if="urlStatus === 'available'" class="relative flex h-1.5 w-1.5">
                                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                            </span>
                                            <span v-if="urlStatus === 'available'" class="text-[9px] font-mono text-red-500">LIVE</span>
                                        </div>
                                        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Visualización en vivo del laboratorio físico</p>
                                    </div>
                                </div>
                                <UButton 
                                    variant="ghost" 
                                    size="2xs" 
                                    icon="i-lucide-refresh-cw" 
                                    :disabled="isCheckingUrl"
                                    @click="reloadCam" 
                                />
                            </div>
                        </template>

                        <div class="relative bg-black" style="height: 55vh;">
                            <!-- Sin URL configurada -->
                            <div v-if="!camUrl" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 z-20">
                                <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-yellow-500 mb-2" />
                                <p class="text-white text-sm font-semibold mb-1">Cámara No Configurada</p>
                                <p class="text-white/70 text-xs text-center px-4">
                                    No hay URL configurada para la cámara.
                                    <br />Contacte al administrador.
                                </p>
                            </div>

                            <!-- Verificando -->
                            <div v-else-if="urlStatus === 'checking'" class="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                                <div class="text-center">
                                    <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-white animate-spin mb-1" />
                                    <p class="text-white text-[10px]">Verificando cámara...</p>
                                </div>
                            </div>

                            <!-- Cargando -->
                            <div v-else-if="camLoading && urlStatus === 'available'" class="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                                <div class="text-center">
                                    <UIcon name="i-lucide-loader-2" class="w-5 h-5 text-white animate-spin mb-1" />
                                    <p class="text-white text-[10px]">Cargando stream...</p>
                                </div>
                            </div>

                            <!-- Error de conexión -->
                            <div v-else-if="camError || urlStatus === 'unavailable'"
                                class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20">
                                <UIcon name="i-lucide-camera-off" class="w-8 h-8 text-red-500 mb-1" />
                                <p class="text-white text-[10px] mb-1">{{ errorMessage || 'Error de conexión' }}</p>
                                <UButton size="2xs" @click="reloadCam">Reintentar</UButton>
                            </div>

                            <!-- Iframe de la cámara -->
                            <iframe 
                                v-if="camUrl && urlStatus === 'available'"
                                ref="camIframe" 
                                :src="camUrl" 
                                class="w-full h-full relative z-10" 
                                frameborder="0"
                                allow="autoplay; fullscreen" 
                                @load="onCamLoad" 
                                @error="onCamError" 
                            />
                        </div>

                        <template #footer>
                            <div class="grid grid-cols-3 gap-2">
                                <UButton 
                                    color="primary" 
                                    variant="solid" 
                                    size="sm" 
                                    class="justify-center gap-2" 
                                    :disabled="urlStatus !== 'available'"
                                    @click="handleCapture"
                                >
                                    <UIcon name="i-lucide-camera" class="w-4 h-4" />
                                    Capturar
                                </UButton>
                                <UButton 
                                    color="red" 
                                    variant="solid" 
                                    size="sm" 
                                    class="justify-center gap-2" 
                                    :disabled="urlStatus !== 'available'"
                                    @click="handleRecord"
                                >
                                    <UIcon name="i-lucide-circle" class="w-4 h-4" />
                                    Grabar
                                </UButton>
                                <UButton 
                                    color="gray" 
                                    variant="solid" 
                                    size="sm" 
                                    class="justify-center gap-2"
                                    :disabled="urlStatus !== 'available'"
                                    @click="handleFullscreen"
                                >
                                    <UIcon name="i-lucide-maximize-2" class="w-4 h-4" />
                                    Pantalla Completa
                                </UButton>
                            </div>
                        </template>
                    </UCard>

                    <!-- Estado de carga inicial -->
                    <div v-if="response?.pending && !config" class="flex flex-col items-center justify-center p-12 mt-4">
                        <UIcon name="i-lucide-loader-circle" class="animate-spin w-8 h-8 text-primary-500 mb-3" />
                        <p class="text-sm text-gray-500">Cargando configuración de la cámara...</p>
                    </div>
                </div>
       
        </template>
    </UDashboardPanel>
</template>