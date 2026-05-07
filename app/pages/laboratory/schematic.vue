<script setup lang="ts">
definePageMeta({
    layout: 'student',
    roles: ['student', 'docente']
})

type Hotspot = {
    path: string
    label: string
    position: string
    color: string
    description?: string
}

const toast = useToast()
const lab = useLabStore()

const hotspots: Hotspot[] = [
    {
        path: '/laboratory/ios-jetson-nano',
        label: 'Jetson Nano',
        position: 'top-[44%] left-[7%] w-[19%] h-[44%]',
        color: 'hover:bg-blue-500/20 border-blue-500',
        description: 'Placa principal para IA en el borde'
    },
    {   
        path: '/laboratory/raspberry-pi',
        label: 'Raspberry Pi',
        position: 'top-[18%] left-[50%] w-[18%] h-[20%]',
        color: 'hover:bg-green-500/20 border-green-500',
        description: 'Servidor web y control periférico'
    },
    {
        path: '/laboratory/esp32',
        label: 'ESP32',
        position: 'top-[30%] left-[72%] w-[20%] h-[17%]',
        color: 'hover:bg-yellow-500/20 border-yellow-500',
        description: 'Sensores y actuadores IoT'
    },
    {
        path: '/laboratory/arduino-r3',
        label: 'Arduino R3',
        position: 'top-[58%] left-[76%] w-[18%] h-[24%]',
        color: 'hover:bg-red-500/20 border-red-500',
        description: 'Adquisición de datos'
    },
    {
        path: '/laboratory/camera',
        label: 'Cámara',
        position: 'top-[30%] left-[38%] w-[10%] h-[20%]',
        color: 'hover:bg-purple-500/20 border-purple-500',
        description: 'Streaming y visión artificial'
    }
]

const imageLoading = ref(true)
const activeHotspot = ref<string | null>(null)

const navigateToDevice = (path: string, label: string) => {
    if (!lab.hasAccess && path !== '/raspberry-pi' && path !== '/esp32') {
        toast.add({
            title: 'Sesión requerida',
            description: `Necesitas una sesión activa para acceder a ${label}`,
            color: 'warning'
        })
        return
    }
    navigateTo(path)
}

const handleKeydown = (e: KeyboardEvent, hotspot: Hotspot) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        navigateToDevice(hotspot.path, hotspot.label)
    }
}

onMounted(() => {
    // Preload image
    const img = new Image()
    img.src = '/images/schematic-v1.png'
    img.onload = () => { imageLoading.value = false }
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
    <div class="container mx-auto px-4 py-6 max-w-7xl">
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
                Sin sesión
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
                    <img v-show="!imageLoading" src="/images/schematic-v1.png"
                        alt="Esquema del sistema IoT del laboratorio remoto" loading="lazy"
                        class="w-full h-auto select-none" />
                    <!-- Hotspots -->
                    <template v-if="!imageLoading">
                        <div v-for="(hotspot, i) in hotspots" :key="i"
                            :class="[hotspot.position, 'absolute rounded-lg transition-all duration-200 cursor-pointer']"
                            :style="{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'transparent' }"
                            @click="navigateToDevice(hotspot.path, hotspot.label)"
                            @mouseenter="activeHotspot = hotspot.label" @mouseleave="activeHotspot = null"
                            @keydown="handleKeydown($event, hotspot)" tabindex="0" :aria-label="`Ir a ${hotspot.label}`"
                            :title="`${hotspot.label} - ${hotspot.description}`">
                            <!-- Efecto hover y tooltip -->
                            <div :class="[
                                'w-full h-full rounded-lg transition-all',
                                hotspot.color,
                                activeHotspot === hotspot.label ? 'bg-opacity-30 border-opacity-100' : 'bg-opacity-0 border-opacity-0'
                            ]" :style="{ borderWidth: '2px', borderStyle: 'solid' }">
                                <div v-if="activeHotspot === hotspot.label"
                                    class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                                    {{ hotspot.label }}
                                </div>
                            </div>
                        </div>
                    </template>
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
                        <li v-for="hotspot in hotspots" :key="hotspot.label" class="flex items-start gap-2 text-sm">
                            <UIcon :name="`i-lucide-circle`" class="w-4 h-4 mt-0.5" :class="{
                                'text-blue-500': hotspot.label === 'Jetson Nano',
                                'text-green-500': hotspot.label === 'Raspberry Pi',
                                'text-yellow-500': hotspot.label === 'ESP32',
                                'text-red-500': hotspot.label === 'Arduino R3',
                                'text-purple-500': hotspot.label === 'Cámara'
                            }" />
                            <div>
                                <button @click="navigateToDevice(hotspot.path, hotspot.label)"
                                    class="font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
                                    {{ hotspot.label }}
                                </button>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ hotspot.description }}
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

                <!-- Info de sesión -->
                <UCard v-if="!lab.hasAccess">
                    <div class="text-center">
                        <UIcon name="i-lucide-lock" class="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                        <p class="text-sm font-medium">Algunos dispositivos requieren sesión activa</p>
                        <UButton size="sm" class="mt-3" variant="outline" to="/student">
                            Ir a la cola
                        </UButton>
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
</style>