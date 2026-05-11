<script setup lang="ts">
definePageMeta({
    layout: 'dashboard',
    roles: ['student', 'admin']
})

type Hotspot = {
    path: string
    label: string
    position: string
    color: string
    description?: string
    requiresSession?: boolean
    status?: 'online' | 'offline' | 'maintenance'  // ✅ Nuevo campo
}

// Estado de dispositivos en tiempo real
const deviceStatus = ref<Record<string, 'online' | 'offline' | 'maintenance'>>({
    'Jetson Nano': 'online',
    'Raspberry Pi': 'offline',
    'ESP32': 'online',
    'Arduino R3': 'online',
    'Cámara': 'maintenance'
})

// Simular cambios de estado cada 30 segundos (opcional)
let statusInterval: NodeJS.Timeout

const updateDeviceStatuses = () => {
    // Ejemplo: Actualizar estados dinámicamente desde API
    // Aquí puedes llamar a tu backend
    console.log('Actualizando estados de dispositivos...')
}

const getDeviceStatus = (label: string) => {
    return deviceStatus.value[label] || 'offline'
}



onMounted(() => {
    // Preload image
    const img = new Image()
    img.src = '/images/schematic-v1.png'
    img.onload = () => { imageLoading.value = false }

    // Simular actualizaciones de estado cada 30 segundos
    statusInterval = setInterval(() => {
        updateDeviceStatuses()
    }, 30000)
})

onUnmounted(() => {
    if (statusInterval) clearInterval(statusInterval)
})

const toast = useToast()
const lab = useLabStore()

const hotspots: Hotspot[] = [
    {
        path: '/dashboard/laboratory/ios-jetson-nano',
        label: 'Jetson Nano',
        position: 'top-[47%] left-[8%] w-[19%] h-[49%]',
        color: 'hover:bg-blue-500/5 border-blue-500/5',
        description: 'Placa principal para IA en el borde',
        requiresSession: true,
        status: 'online'  // ✅ Estado actual
    },
    {
        path: '/dashboard/laboratory/raspberry-pi',
        label: 'Raspberry Pi',
        position: 'top-[14%] left-[52%] w-[18%] h-[24%]',
        color: 'hover:bg-green-500/5 border-green-500/5',
        description: 'Servidor web y control periférico',
        requiresSession: true,
        status: 'offline'  // ✅ Desconectado
    },
    {
        path: '/dashboard/laboratory/esp32',
        label: 'ESP32',
        position: 'top-[23%] left-[73%] w-[22%] h-[20%]',
        color: 'hover:bg-orange-500/5 border-orange-500/5',
        description: 'Sensores y actuadores IoT',
        requiresSession: false,
        status: 'online'  // ✅ En línea
    },
    {
        path: '/dashboard/laboratory/arduino-r3',
        label: 'Arduino R3',
        position: 'top-[64%] left-[77%] w-[18%] h-[27%]',
        color: 'hover:bg-orange-500/5 border-orange-500/5',
        description: 'Adquisición de datos',
        requiresSession: false,
        status: 'online'  // ✅ En línea
    },
    {
        path: '/dashboard/laboratory/camera',
        label: 'Cámara',
        position: 'top-[27%] left-[38%] w-[10%] h-[22%]',
        color: 'hover:bg-purple-500/5 border-purple-500/5',
        description: 'Streaming y visión artificial',
        requiresSession: true,
        status: 'maintenance'  // ✅ En mantenimiento
    }
]
// Función para obtener estado según sesión y requerimiento
const getDeviceStatusBySession = (hotspot: Hotspot) => {
    // Si el dispositivo requiere sesión
    if (hotspot.requiresSession) {
        // Solo está online si tiene sesión activa
        return lab.hasAccess ? 'online' : 'locked'
    }
    // Dispositivos que no requieren sesión siempre están online
    return 'online'
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'online': return 'bg-green-500'
        case 'locked': return 'bg-gray-400 dark:bg-gray-600'
        case 'offline': return 'bg-red-500'
        case 'maintenance': return 'bg-yellow-500'
        default: return 'bg-gray-500'
    }
}

const getStatusText = (status: string, requiresSession: boolean, hasAccess: boolean) => {
    if (requiresSession && !hasAccess) return 'Requiere sesión'
    switch (status) {
        case 'online': return 'Activo'
        case 'locked': return 'Bloqueado'
        case 'offline': return 'Sin conexión'
        case 'maintenance': return 'Mantenimiento'
        default: return 'Desconocido'
    }
}

const getStatusIcon = (status: string, requiresSession: boolean, hasAccess: boolean) => {
    if (requiresSession && !hasAccess) return 'i-lucide-lock'
    switch (status) {
        case 'online': return 'i-lucide-wifi'
        case 'locked': return 'i-lucide-lock'
        case 'offline': return 'i-lucide-wifi-off'
        case 'maintenance': return 'i-lucide-tool'
        default: return 'i-lucide-help-circle'
    }
}

// También puedes mantener estados específicos por dispositivo si quieres
const deviceHardwareStatus = ref<Record<string, 'online' | 'offline' | 'maintenance'>>({
    'Jetson Nano': 'online',
    'Raspberry Pi': 'online',  // Hardware funcionando
    'ESP32': 'online',
    'Arduino R3': 'online',
    'Cámara': 'online'
})

// Estado combinado: hardware + sesión
const getCombinedStatus = (hotspot: Hotspot) => {
    // Primero verificar hardware
    const hardwareStatus = deviceHardwareStatus.value[hotspot.label] || 'online'

    // Si hardware está offline o mantenimiento, mostrar eso
    if (hardwareStatus === 'offline') return 'offline'
    if (hardwareStatus === 'maintenance') return 'maintenance'

    // Si hardware está online, verificar sesión
    if (hotspot.requiresSession && !lab.hasAccess) return 'locked'

    return 'online'
}
const imageLoading = ref(true)
const activeHotspot = ref<string | null>(null)

const navigateToDevice = (path: string, label: string, requiresSession: boolean = false) => {
    // Solo validar sesión si el dispositivo requiere sesión activa
    if (requiresSession && !lab.hasAccess) {
        toast.add({
            title: 'Sesión requerida',
            description: `Necesitas una sesión activa para acceder a ${label}. Solicita tu turno en la cola.`,
            color: 'warning',
            icon: 'i-lucide-clock',
            actions: [{
                label: 'Ir a la cola',
                color: 'warning',
                variant: 'outline',
                onClick: () => navigateTo('/dashboard/student/queue')
            }]
        })
        return
    }

    // Si no requiere sesión o tiene sesión activa, navegar
    navigateTo(path)
}

const handleKeydown = (e: KeyboardEvent, hotspot: Hotspot) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        navigateToDevice(hotspot.path, hotspot.label, hotspot.requiresSession)
    }
}

onMounted(() => {
    // Preload image
    const img = new Image()
    img.src = '/images/schematic-v3.png'
    img.onload = () => { imageLoading.value = false }
})
</script>

<template>
    <UDashboardPanel id="dashboard">
        <template #header>
            <UDashboardNavbar title="Dashboard - Esquematico/Arquitectura" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>

                    <UColorModeButton />

                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="container mx-auto px-4 py-6 ">
                <!-- Título y estado de sesión -->
                <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight">Esquema del Sistema IoT</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Diagrama de conexiones del laboratorio remoto
                        </p>
                    </div>
                    <UBadge v-if="lab.hasAccess" color="green" variant="subtle" class="gap-1.5">
                        <UIcon name="i-lucide-play-circle" class="w-3.5 h-3.5" />
                        Sesión activa
                    </UBadge>
                    <UBadge v-else color="gray" variant="subtle" class="gap-1.5">
                        <UIcon name="i-lucide-wifi-off" class="w-3.5 h-3.5" />
                        Sin sesión - Solo acceso a ESP32 y Arduino
                    </UBadge>
                </div>

                <div class="grid lg:grid-cols-4 gap-6">
                    <!-- Esquema interactivo -->
                    <UCard class="lg:col-span-3 overflow-hidden p-0">
                        <div class="relative bg-gray-100 dark:bg-gray-800">
                            <!-- Placeholder mientras carga -->
                            <div v-if="imageLoading" class="flex items-center justify-center aspect-video">
                                <UProgress infinite class="w-64" />
                            </div>

                            <!-- Imagen del esquema -->
                            <img v-show="!imageLoading" src="/images/schematic-v3.png"
                                alt="Esquema del sistema IoT del laboratorio remoto" loading="lazy"
                                class="w-full h-auto select-none" />

                            <!-- Hotspots -->
                            <!-- Hotspots -->
                            <!-- Hotspots -->
                            <template v-if="!imageLoading">
                                <div v-for="(hotspot, i) in hotspots" :key="i" :class="[
                                    hotspot.position,
                                    'absolute rounded-lg transition-all duration-200 cursor-pointer',
                                    hotspot.requiresSession && !lab.hasAccess ? 'opacity-50 cursor-not-allowed' : '',
                                    getCombinedStatus(hotspot) === 'locked' ? 'grayscale-[0.3]' : ''
                                ]" :style="{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'transparent' }"
                                    @click="navigateToDevice(hotspot.path, hotspot.label, hotspot.requiresSession)"
                                    @mouseenter="activeHotspot = hotspot.label" @mouseleave="activeHotspot = null"
                                    @keydown="handleKeydown($event, hotspot)" tabindex="0"
                                    :aria-label="`Ir a ${hotspot.label} - ${getStatusText(getCombinedStatus(hotspot), hotspot.requiresSession, lab.hasAccess)}`"
                                    :title="`${hotspot.label} - ${hotspot.description} (${getStatusText(getCombinedStatus(hotspot), hotspot.requiresSession, lab.hasAccess)})`">

                                    <!-- Indicador de estado en vivo (esquina superior derecha) -->
                                    <div class="absolute -top-2 -right-2 z-20">
                                        <div class="relative">
                                            <!-- Pulsing animation solo para online activos -->
                                            <div v-if="getCombinedStatus(hotspot) === 'online' && (!hotspot.requiresSession || lab.hasAccess)"
                                                class="absolute inset-0 rounded-full animate-ping bg-green-500 opacity-75">
                                            </div>
                                            <div :class="[
                                                'w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm',
                                                getStatusColor(getCombinedStatus(hotspot))
                                            ]">
                                                <!-- Ícono pequeño para locked -->
                                                <UIcon v-if="getCombinedStatus(hotspot) === 'locked'"
                                                    name="i-lucide-lock"
                                                    class="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-75" />
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Etiqueta de estado debajo del componente -->
                                    <div
                                        class="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-20">
                                        <span :class="[
                                            'text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm',
                                            getCombinedStatus(hotspot) === 'online' && (!hotspot.requiresSession || lab.hasAccess) ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                                getCombinedStatus(hotspot) === 'locked' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                                                    getCombinedStatus(hotspot) === 'offline' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                        ]">
                                            <UIcon
                                                :name="getStatusIcon(getCombinedStatus(hotspot), hotspot.requiresSession, lab.hasAccess)"
                                                class="w-2.5 h-2.5 inline mr-1" />
                                            {{ getStatusText(getCombinedStatus(hotspot), hotspot.requiresSession,
                                            lab.hasAccess) }}
                                        </span>
                                    </div>

                                    <!-- Efecto hover y tooltip -->
                                    <div :class="[
                                        'w-full h-full rounded-lg transition-all',
                                        hotspot.color,
                                        activeHotspot === hotspot.label ? 'bg-opacity-30 border-opacity-100' : 'bg-opacity-0 border-opacity-0'
                                    ]" :style="{ borderWidth: '2px', borderStyle: 'solid' }">
                                        <div v-if="activeHotspot === hotspot.label"
                                            class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/85 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none z-30 shadow-lg">
                                            <div class="flex items-center gap-1.5">
                                                <UIcon
                                                    :name="getStatusIcon(getCombinedStatus(hotspot), hotspot.requiresSession, lab.hasAccess)"
                                                    class="w-3 h-3" />
                                                {{ hotspot.label }}
                                                <span v-if="hotspot.requiresSession && !lab.hasAccess"
                                                    class="ml-1 text-yellow-400 text-[10px]">
                                                    (Sesión requerida)
                                                </span>
                                                <span v-else-if="hotspot.requiresSession && lab.hasAccess"
                                                    class="ml-1 text-green-400 text-[10px]">
                                                    (Sesión activa)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <!-- Leyenda de colores y tipos de conexión -->
                        <div class="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
                            <!-- Texto de interacción -->
                            <p class="text-xs text-gray-500 flex items-center gap-1 mb-2">
                                <UIcon name="i-lucide-mouse-pointer" class="w-3 h-3" />
                                Pasa el cursor sobre un componente para más información.
                            </p>

                            <!-- Leyenda de conexiones -->
                            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-sm bg-green-500"></div>
                                    <span class="text-xs text-gray-600 dark:text-gray-400">Ethernet</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-sm bg-slate-900"></div>
                                    <span class="text-xs text-gray-600 dark:text-gray-400">USB</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-sm bg-purple-500"></div>
                                    <span class="text-xs text-gray-600 dark:text-gray-400">WiFi</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-sm bg-orange-500"></div>
                                    <span class="text-xs text-gray-600 dark:text-gray-400">Serial I/O</span>
                                </div>
                            </div>

                            <!-- Leyenda de estado (opcional, si aplica) -->
                            <div class="pt-1 mt-1 border-t border-gray-100 dark:border-gray-800">
                                <div class="flex items-center gap-4">
                                    <div class="flex items-center gap-2">
                                        <div
                                            class="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 ring-2 ring-gray-400/30">
                                        </div>
                                        <span class="text-xs text-gray-500">Componente interactivo</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs text-yellow-600 dark:text-yellow-500">🔒</span>
                                        <span class="text-xs text-gray-500">Requiere sesión</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UCard>

                    <!-- Panel lateral de información -->
                    <div class="space-y-4">
                        <UCard>
                            <template #header>
                                <h2 class="font-semibold flex items-center gap-2">
                                    <UIcon name="i-lucide-info" />
                                    Componentes del laboratorio
                                </h2>
                            </template>
                            <ul class="space-y-3">
                                <li v-for="hotspot in hotspots" :key="hotspot.label"
                                    class="flex items-start gap-2 text-sm">
                                    <UIcon :name="`i-lucide-circle`" class="w-4 h-4 mt-0.5" :class="{
                                        'text-blue-500': hotspot.label === 'Jetson Nano',
                                        'text-green-500': hotspot.label === 'Raspberry Pi',
                                        'text-yellow-500': hotspot.label === 'ESP32',
                                        'text-red-500': hotspot.label === 'Arduino R3',
                                        'text-purple-500': hotspot.label === 'Cámara'
                                    }" />
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2">
                                            <button
                                                @click="navigateToDevice(hotspot.path, hotspot.label, hotspot.requiresSession)"
                                                class="font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                                :class="{ 'opacity-50': hotspot.requiresSession && !lab.hasAccess }">
                                                {{ hotspot.label }}
                                            </button>
                                            <UBadge v-if="hotspot.requiresSession" size="xs"
                                                :color="lab.hasAccess ? 'green' : 'yellow'" variant="subtle">
                                                <UIcon :name="lab.hasAccess ? 'i-lucide-unlock' : 'i-lucide-lock'"
                                                    class="w-3 h-3" />
                                            </UBadge>
                                        </div>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                            {{ hotspot.description }}
                                        </p>
                                        <p v-if="hotspot.requiresSession && !lab.hasAccess"
                                            class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                            🔒 Requiere sesión activa
                                        </p>
                                    </div>
                                </li>
                            </ul>
                            <template #footer>
                                <p class="text-xs text-gray-500 flex items-center gap-1">
                                    <UIcon name="i-lucide-mouse-pointer" class="w-3 h-3" />
                                    Haz clic en cualquier bloque del esquema para acceder.
                                </p>
                            </template>
                        </UCard>

                        <!-- Info de sesión mejorada -->
                        <UCard v-if="!lab.hasAccess">
                            <div class="text-center">
                                <div class="mb-3">
                                    <UIcon name="i-lucide-lock" class="w-10 h-10 text-yellow-500 mx-auto" />
                                </div>
                                <p class="text-sm font-medium mb-1">
                                    Acceso limitado
                                </p>
                                <p class="text-xs text-gray-500 mb-3">
                                    ESP32 y Arduino R3 están disponibles sin sesión.
                                    <br>
                                    <strong>Jetson Nano, Raspberry Pi y Cámara</strong> requieren sesión activa.
                                </p>
                                <UButton size="sm" class="mt-2" variant="outline" to="/student/queue">
                                    <template #leading>
                                        <UIcon name="i-lucide-clock" />
                                    </template>
                                    Solicitar turno
                                </UButton>
                            </div>
                        </UCard>

                        <!-- Info cuando hay sesión activa -->
                        <UCard v-else>
                            <div class="text-center">
                                <div class="mb-3">
                                    <UIcon name="i-lucide-unlock" class="w-10 h-10 text-green-500 mx-auto" />
                                </div>
                                <p class="text-sm font-medium text-green-600 dark:text-green-400">
                                    ✅ Acceso completo
                                </p>
                                <p class="text-xs text-gray-500 mt-1">
                                    Tienes acceso a todos los dispositivos del laboratorio.
                                </p>
                            </div>
                        </UCard>
                    </div>
                </div>

            </div>
        </template>
    </UDashboardPanel>
</template>

<style scoped>
/* Los hotspots tienen transiciones suaves y feedback táctil */
.hotspot-focus:focus-visible {
    outline: 2px solid var(--ui-primary);
    outline-offset: 2px;
}

/* Estilo para dispositivos bloqueados */
.opacity-50 {
    opacity: 0.5;
}

.cursor-not-allowed {
    cursor: not-allowed;
}
</style>