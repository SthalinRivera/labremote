<script setup lang="ts">
import type { Toast } from '@nuxt/ui'

definePageMeta({
    layout: 'dashboard',
    roles: ['student', 'admin']
})

// ---------- Tipado ----------
interface User {
    name: string
    email: string
    avatar_url?: string
    role?: string
}

interface QueueStatus {
    position: number
    user_id?: string
}

interface Session {
    id: string
    remaining: number
    ends_at?: string
    started_at?: string
}

// ---------- Estado ----------
const config = useRuntimeConfig()
const toast = useToast()
const user = ref<User | null>(null)
const queue = ref<QueueStatus | null>(null)
const session = ref<Session | null>(null)
const loading = ref(false)
const extending = ref(false)
const localRemaining = ref<number | null>(null)

let pollingInterval: NodeJS.Timeout | null = null
let countdownInterval: NodeJS.Timeout | null = null
let hasWarnedOneMinute = false
let hasWarnedFiveMinutes = false

// ---------- API Helper ----------
const getApi = () => {
    const token = localStorage.getItem('token')
    return $fetch.create({
        baseURL: config.public.apiUrl,
        headers: { Authorization: `Bearer ${token}` }
    })
}

// ---------- Obtener usuario actual ----------
const loadUser = async () => {
    try {
        const api = getApi()
        const userData = await api('/api/auth/me')
        user.value = userData
    } catch (error) {
        console.error('Error loading user:', error)
    }
}

// ---------- Notificaciones ----------
function showToast(
    title: string,
    description?: string,
    color: Toast['color'] = 'info'
) {
    toast.add({ title, description, color })
}

// ---------- Contador local ----------
function stopLocalCountdown() {
    if (countdownInterval) clearInterval(countdownInterval)
    countdownInterval = null
    localRemaining.value = null
}

function startLocalCountdown(initialSeconds: number) {
    stopLocalCountdown()
    localRemaining.value = initialSeconds
    hasWarnedOneMinute = false
    hasWarnedFiveMinutes = false
    
    countdownInterval = setInterval(() => {
        if (localRemaining.value !== null && localRemaining.value > 0) {
            localRemaining.value -= 1
            
            // Advertencia cuando quede 1 minuto
            if (localRemaining.value === 60 && !hasWarnedOneMinute) {
                hasWarnedOneMinute = true
                showToast('⚠️ 1 minuto restante', 'Tu sesión está por terminar', 'warning')
            }
            
            // Advertencia cuando queden 5 minutos
            if (localRemaining.value === 300 && !hasWarnedFiveMinutes) {
                hasWarnedFiveMinutes = true
                showToast('⏰ 5 minutos restantes', 'Puedes extender tu sesión', 'info')
            }
            
            if (localRemaining.value === 0) {
                stopLocalCountdown()
                showToast('⏰ Sesión terminada', 'Puedes volver a entrar en la cola', 'warning')
                loadStatus()
            }
        }
    }, 1000)
}

// Sincronizar contador con la sesión
watch(session, (newSession) => {
    if (newSession && newSession.remaining > 0) {
        startLocalCountdown(newSession.remaining)
    } else {
        stopLocalCountdown()
    }
})

// ---------- Cargar estado ----------
async function loadStatus() {
    try {
        const api = getApi()
        const [queueData, sessionData] = await Promise.all([
            api('/api/queue/status').catch(() => null),
            api('/api/session/current').catch(() => null)
        ])
        queue.value = queueData
        session.value = sessionData
        if (!sessionData && localRemaining.value !== null) {
            stopLocalCountdown()
        }
    } catch (error) {
        console.error(error)
    }
}

// ---------- Unirse a cola ----------
async function joinQueue() {
    if (queue.value || session.value || loading.value) return
    loading.value = true
    try {
        const api = getApi()
        await api('/api/queue/join', { method: 'POST' })
        showToast('✅ En cola', 'Espera tu turno', 'success')
        await loadStatus()
    } catch (error: any) {
        showToast('Error', error?.data?.message || 'No se pudo entrar a la cola', 'error')
    } finally {
        loading.value = false
    }
}

// ---------- 🆕 EXTENDER SESIÓN ----------
async function extendSession(minutes: number = 10) {
    if (!session.value) {
        showToast('Error', 'No hay sesión activa', 'error')
        return
    }
    
    extending.value = true
    try {
        const api = getApi()
        const result = await api('/api/session/extend', {
            method: 'POST',
            body: { minutes }
        })
        
        showToast(
            '✅ Sesión extendida',
            `Se añadieron ${minutes} minutos a tu sesión`,
            'success'
        )
        
        // Recargar estado para obtener el nuevo tiempo
        await loadStatus()
    } catch (error: any) {
        showToast(
            'Error',
            error?.data?.message || 'No se pudo extender la sesión',
            'error'
        )
    } finally {
        extending.value = false
    }
}

// ---------- 🆕 FINALIZAR SESIÓN (estudiante) ----------
async function endSession() {
    if (!session.value) return
    
    const confirmed = confirm('¿Estás seguro de que quieres terminar tu sesión?')
    if (!confirmed) return
    
    try {
        const api = getApi()
        await api('/api/session/terminate', { 
            method: 'POST',
            body: {} // body vacío, usa su propia sesión
        })
        showToast('⏰ Sesión finalizada', 'Has terminado tu sesión manualmente', 'info')
        await loadStatus()
    } catch (error) {
        showToast('Error', 'No se pudo finalizar la sesión', 'error')
    }
}

// ---------- Formateo ----------
const formatTime = (seconds: number) => {
    if (!seconds && seconds !== 0) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

// Porcentaje de tiempo restante
const timePercentage = computed(() => {
    if (!session.value || !localRemaining.value) return 100
    // Asumiendo duración de 30 minutos (1800 segundos)
    const totalTime = 1800
    return (localRemaining.value / totalTime) * 100
})

// Color según tiempo
const timeColor = computed(() => {
    if (!localRemaining.value) return 'gray'
    if (localRemaining.value < 60) return 'error'
    if (localRemaining.value < 300) return 'warning'
    return 'success'
})

// Puede extender (solo si hay sesión y tiene al menos 1 minuto)
const canExtend = computed(() => {
    return session.value && (localRemaining.value || 0) > 60
})

// ---------- Ciclo de vida ----------
onMounted(() => {
    loadUser()
    loadStatus()
    pollingInterval = setInterval(() => loadStatus(), 5000)
})

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval)
    if (countdownInterval) clearInterval(countdownInterval)
})

// Logout
const logout = () => {
    localStorage.removeItem('token')
    navigateTo('/login')
}
</script>

<template>
    <UDashboardPanel id="dashboard">
        <UDashboardNavbar title="Laboratorio Remoto" :ui="{ right: 'gap-3' }">
            <template #leading>
                <UDashboardSidebarCollapse />
            </template>
            <template #right>
                <UColorModeButton />
            </template>
        </UDashboardNavbar>

        <div class="container mx-auto px-4 py-6 max-w-7xl">
            <!-- Encabezado -->
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                    <UAvatar 
                        :src="user?.avatar_url" 
                        :alt="user?.name || 'Usuario'" 
                        size="md" 
                    />
                    <div>
                        <h1 class="text-xl font-bold">Hola, {{ user?.name || 'Estudiante' }}</h1>
                        <p class="text-sm text-gray-500">{{ user?.email }}</p>
                        <UBadge v-if="user?.role === 'admin'" color="purple" size="xs">
                            Administrador
                        </UBadge>
                    </div>
                </div>
                <UButton 
                    variant="ghost" 
                    color="error" 
                    icon="i-lucide-log-out" 
                    label="Salir" 
                    @click="logout" 
                />
            </div>

            <!-- Cards de estado -->
            <div class="grid md:grid-cols-2 gap-4 mb-6">
                <!-- Cola -->
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-clock" class="w-5 h-5 text-yellow-500" />
                            <h2 class="font-semibold">Cola de espera</h2>
                        </div>
                    </template>

                    <div v-if="queue" class="text-center py-4">
                        <p class="text-5xl font-mono font-bold text-yellow-500">
                            #{{ queue.position }}
                        </p>
                        <p class="text-sm text-gray-500 mt-2">
                            Mantén esta ventana abierta
                        </p>
                    </div>
                    <div v-else-if="session" class="text-center py-4">
                        <UBadge color="green" variant="solid" class="mb-2">Sesión activa</UBadge>
                        <p class="text-sm">Ya tienes acceso al laboratorio</p>
                    </div>
                    <div v-else class="text-center py-4">
                        <p class="text-gray-500 mb-4">Sin conexión actual</p>
                        <UButton 
                            :loading="loading" 
                            :disabled="loading" 
                            color="primary" 
                            icon="i-lucide-log-in"
                            label="Entrar a la cola" 
                            @click="joinQueue" 
                        />
                    </div>
                </UCard>

                <!-- Sesión activa -->
                <UCard v-if="session" class="border-green-500 dark:border-green-700">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-green-600">
                                <UIcon name="i-lucide-play-circle" class="w-5 h-5" />
                                <h2 class="font-semibold">Sesión en curso</h2>
                            </div>
                            <UBadge :color="timeColor" variant="solid">
                                Activa
                            </UBadge>
                        </div>
                    </template>

                    <div class="text-center py-2">
                        <!-- Tiempo restante grande -->
                        <p class="text-5xl font-mono font-bold" :class="{
                            'text-green-600': timeColor === 'success',
                            'text-yellow-600': timeColor === 'warning',
                            'text-red-600': timeColor === 'error'
                        }">
                            {{ formatTime(localRemaining ?? session.remaining) }}
                        </p>
                        <p class="text-sm text-gray-500 mt-1">tiempo restante</p>

                        <!-- Barra de progreso -->
                        <div class="mt-4">
                            <UProgress 
                                :value="timePercentage" 
                                :color="timeColor"
                                size="lg"
                                class="h-2 rounded-full"
                            />
                        </div>

                        <!-- Botones de acción -->
                        <div class="flex flex-wrap gap-2 justify-center mt-6">
                            <UButton 
                                variant="outline" 
                                color="primary" 
                                size="sm"
                                icon="i-lucide-clock-plus"
                                :loading="extending"
                                :disabled="!canExtend || extending"
                                @click="extendSession(10)"
                            >
                                Extender +10 min
                            </UButton>
                            
                            <UButton 
                                variant="outline" 
                                color="error" 
                                size="sm"
                                icon="i-lucide-stop-circle"
                                @click="endSession"
                            >
                                Terminar sesión
                            </UButton>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Panel de laboratorio (cuando hay sesión activa) -->
            <div v-if="session">
                <h2 class="text-2xl font-bold mb-4">Panel de laboratorio</h2>
                <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <UCard 
                        to="/laboratory/ios-jetson-nano" 
                        class="hover:shadow-lg transition-all cursor-pointer"
                    >
                        <div class="flex items-center gap-3">
                            <div class="text-3xl">🧪</div>
                            <div>
                                <h3 class="font-semibold">Jetson Nano</h3>
                                <p class="text-sm text-gray-500">
                                    IA en el borde
                                </p>
                            </div>
                        </div>
                    </UCard>

                    <UCard 
                        to="/laboratory/schematic" 
                        class="hover:shadow-lg transition-all cursor-pointer"
                    >
                        <div class="flex items-center gap-3">
                            <div class="text-3xl">🔌</div>
                            <div>
                                <h3 class="font-semibold">Esquemático</h3>
                                <p class="text-sm text-gray-500">
                                    Diagrama del sistema
                                </p>
                            </div>
                        </div>
                    </UCard>

                    <UCard 
                        to="/laboratory/camera" 
                        class="hover:shadow-lg transition-all cursor-pointer"
                    >
                        <div class="flex items-center gap-3">
                            <div class="text-3xl">📷</div>
                            <div>
                                <h3 class="font-semibold">Cámara en vivo</h3>
                                <p class="text-sm text-gray-500">
                                    Streaming en tiempo real
                                </p>
                            </div>
                        </div>
                    </UCard>

                    <UCard 
                        to="/laboratory/arduino-r3" 
                        class="hover:shadow-lg transition-all cursor-pointer"
                    >
                        <div class="flex items-center gap-3">
                            <div class="text-3xl">🖥️</div>
                            <div>
                                <h3 class="font-semibold">Arduino R3</h3>
                                <p class="text-sm text-gray-500">
                                    Adquisición de datos
                                </p>
                            </div>
                        </div>
                    </UCard>
                </div>
            </div>

            <!-- Estado vacío -->
            <div v-else-if="!queue && !session" class="text-center py-16">
                <UIcon name="i-lucide-plug" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 class="text-xl font-medium mb-2">Sin conexión activa</h3>
                <p class="text-gray-500">
                    Únete a la cola para iniciar una sesión de laboratorio
                </p>
            </div>

            <!-- Indicador de posición en cola -->
            <div v-if="queue && !session" class="text-center mt-6">
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                    <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin text-yellow-500" />
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        Estás en la posición <strong class="text-yellow-500 font-bold">#{{ queue.position }}</strong> de la cola
                    </p>
                </div>
                <p class="text-xs text-gray-400 mt-2">
                    Te avisaremos cuando sea tu turno
                </p>
            </div>
        </div>
    </UDashboardPanel>
</template>