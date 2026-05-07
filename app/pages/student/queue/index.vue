<script setup lang="ts">
import type { Toast } from '@nuxt/ui'

definePageMeta({
    layout: 'student',
    roles: ['student', 'docente']
})

// ---------- Tipado ----------
interface User {
    name: string
    email: string
    avatar_url?: string
}
interface QueueStatus {
    position: number
}
interface Session {
    remaining: number
}

// ---------- Estado ----------
const config = useRuntimeConfig()
const toast = useToast()
const user = ref<User | null>(null)
const queue = ref<QueueStatus | null>(null)
const session = ref<Session | null>(null)
const loading = ref(false)
const localRemaining = ref<number | null>(null)

let pollingInterval: NodeJS.Timeout | null = null
let countdownInterval: NodeJS.Timeout | null = null
let hasWarnedOneMinute = false

// ---------- API Helper ----------
const getApi = () => {
    const token = localStorage.getItem('token')
    return $fetch.create({
        baseURL: config.public.apiUrl,
        headers: { Authorization: `Bearer ${token}` }
    })
}

// ---------- Notificaciones con toast ----------
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
    countdownInterval = setInterval(() => {
        if (localRemaining.value !== null && localRemaining.value > 0) {
            localRemaining.value -= 1
            if (localRemaining.value === 0) {
                stopLocalCountdown()
                showToast('⏰ Sesión terminada', 'Puedes volver a entrar en la cola', 'warning')
                loadStatus()
            }
        }
    }, 1000)
}

// Aviso cuando falte 1 minuto
watch(localRemaining, (newValue) => {
    if (newValue !== null && newValue <= 60 && newValue > 0 && !hasWarnedOneMinute) {
        hasWarnedOneMinute = true
        showToast('⚠️ 1 minuto restante', 'Guarda tu trabajo y cierra aplicaciones', 'warning')
    }
    if (newValue !== null && newValue > 60) {
        hasWarnedOneMinute = false
    }
})

// Sincronizar contador con la sesión
watch(session, (newSession) => {
    if (newSession && newSession.remaining > 0) {
        startLocalCountdown(newSession.remaining)
        hasWarnedOneMinute = false
    } else {
        stopLocalCountdown()
    }
})

// ---------- Cargar estado ----------
async function loadStatus() {
    try {
        const api = getApi()
        const [queueData, sessionData] = await Promise.all([
            api('/queue/status').catch(() => null),
            api('/session/current').catch(() => null)
        ])
        queue.value = queueData
        session.value = sessionData
        if (!sessionData && localRemaining.value !== null) {
            stopLocalCountdown()
            showToast('Sesión expirada', 'La sesión ha finalizado', 'info')
        }
    } catch (error) {
        console.error(error)
        showToast('Error', 'No se pudo cargar el estado', 'error')
    }
}

// ---------- Unirse a cola ----------
async function joinQueue() {
    if (queue.value || session.value || loading.value) return
    loading.value = true
    try {
        const api = getApi()
        await api('/queue/join', { method: 'POST' })
        showToast('✅ En cola', 'Espera tu turno', 'success')
        await loadStatus()
    } catch (error: any) {
        showToast('Error', error?.data?.message || 'No se pudo entrar a la cola', 'error')
    } finally {
        loading.value = false
    }
}

// ---------- Finalizar sesión ----------
async function endSession() {
    if (!session.value) return
    try {
        const api = getApi()
        await api('/session/end', { method: 'POST' })
        showToast('Sesión finalizada', 'Manual', 'info')
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

// ---------- Logout ----------
const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigateTo('/login')
}

// ---------- Ciclo de vida ----------
onMounted(() => {
    const stored = localStorage.getItem('user')
    if (stored) user.value = JSON.parse(stored)
    loadStatus()
    pollingInterval = setInterval(() => loadStatus(), 3000)
})

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval)
    if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<template>

      <UDashboardPanel id="dashboard">
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
    <div class="container mx-auto px-4 py-6 max-w-7xl">
        <!-- Encabezado con avatar y logout -->
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <UAvatar :src="user?.avatar_url" :alt="user?.name || 'Usuario'" size="md" />
                <div>
                    <h1 class="text-xl font-bold">Hola, {{ user?.name || 'Estudiante' }}</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
                </div>
            </div>
            <UButton variant="ghost" color="error" icon="i-lucide-log-out" label="Salir" @click="logout" />
        </div>

        <!-- Estado de cola / sesión (cards) -->
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
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Mantén esta ventana abierta
                    </p>
                </div>
                <div v-else-if="session" class="text-center py-4">
                    <UBadge color="green" variant="solid" class="mb-2">Sesión activa</UBadge>
                    <p class="text-sm">Ya tienes acceso al laboratorio</p>
                </div>
                <div v-else class="text-center py-4">
                    <p class="text-gray-500 dark:text-gray-400 mb-4">Sin conexión actual</p>
                    <UButton :loading="loading" :disabled="loading" color="primary" icon="i-lucide-log-in"
                        label="Entrar a la cola" @click="joinQueue" />
                </div>
            </UCard>

            <!-- Sesión activa (si existe) -->
            <UCard v-if="session" class="border-green-500 dark:border-green-700">
                <template #header>
                    <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <UIcon name="i-lucide-play-circle" class="w-5 h-5" />
                        <h2 class="font-semibold">Sesión en curso</h2>
                    </div>
                </template>
                <div class="text-center py-2">
                    <p class="text-4xl font-mono font-bold">
                        {{ formatTime(localRemaining ?? session.remaining) }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">tiempo restante</p>
                    <UButton variant="outline" color="error" size="sm" class="mt-4" icon="i-lucide-stop-circle"
                        label="Finalizar sesión" @click="endSession" />
                </div>
            </UCard>
        </div>

        <!-- Dashboard principal (cuando hay sesión activa) -->
        <div v-if="session">
            <h2 class="text-2xl font-bold mb-4">Panel de laboratorio</h2>
            <div class="grid sm:grid-cols-2 gap-4">
                <UCard to="/ios-jetson-nano" class="hover:shadow-lg transition-all cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">🧪</div>
                        <div>
                            <h3 class="font-semibold">Iniciar Laboratorio</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                Accede al entorno remoto
                            </p>
                        </div>
                    </div>
                </UCard>

                <UCard to="/schematic" class="hover:shadow-lg transition-all cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">🔌</div>
                        <div>
                            <h3 class="font-semibold">Esquemático</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                Revisa el esquema del laboratorio
                            </p>
                        </div>
                    </div>
                </UCard>

                <UCard to="/camera" class="hover:shadow-lg transition-all cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">📷</div>
                        <div>
                            <h3 class="font-semibold">Cámara en vivo</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                Visualiza el hardware en tiempo real
                            </p>
                        </div>
                    </div>
                </UCard>

                <UCard to="/docs" class="hover:shadow-lg transition-all cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">📘</div>
                        <div>
                            <h3 class="font-semibold">Documentación</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                Guías y manuales de uso
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>
        </div>

        <!-- Estado vacío (sin cola ni sesión) -->
        <div v-else-if="!queue && !session" class="text-center py-16">
            <UIcon name="i-lucide-plug" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 class="text-xl font-medium mb-2">Sin conexión activa</h3>
            <p class="text-gray-500 dark:text-gray-400">
                Únete a la cola para iniciar una sesión de laboratorio
            </p>
        </div>

        <!-- Indicador de posición en cola (cuando no hay sesión pero sí cola) -->
        <div v-if="queue && !session" class="text-center mt-6">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Estás en la posición <strong class="text-yellow-500">#{{ queue.position }}</strong> de la cola.
                Te avisaremos cuando sea tu turno.
            </p>
        </div>
    </div>

       </UDashboardPanel>
</template>