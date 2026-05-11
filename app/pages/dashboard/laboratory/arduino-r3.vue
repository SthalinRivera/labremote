<script setup lang="ts">
const go = (path: string) => navigateTo(path)

definePageMeta({
    layout: "dashboard",
    roles: ["student", "docente"]
})

// Datos automatizados de pines
const pinCategories = [
  {
    name: "LEDs",
    icon: "i-heroicons-light-bulb",
    color: "green",
    pins: [
      { pin: "D2", name: "LED Verde", type: "output" },
      { pin: "D3", name: "LED Amarillo", type: "output" },
      { pin: "D4", name: "LED Rojo", type: "output" }
    ]
  },
  {
    name: "Servo Motor",
    icon: "i-heroicons-cog-6-tooth",
    color: "orange",
    pins: [
      { pin: "D5", name: "Servo Signal", type: "pwm" }
    ]
  },
  {
    name: "MAX7219",
    icon: "i-heroicons-computer-chip",
    color: "blue",
    pins: [
      { pin: "D11", name: "DIN (Data In)", type: "spi" },
      { pin: "D10", name: "CS (Chip Select)", type: "spi" },
      { pin: "D13", name: "CLK (Clock)", type: "spi" }
    ]
  },
  {
    name: "Sensor Ultrasónico",
    icon: "i-heroicons-radio",
    color: "purple",
    pins: [
      { pin: "D6", name: "TRIG", type: "trigger" },
      { pin: "D7", name: "ECHO", type: "echo" }
    ]
  },
  {
    name: "Motor DC",
    icon: "i-heroicons-bolt",
    color: "red",
    pins: [
      { pin: "D9", name: "Motor Control", type: "pwm" }
    ]
  },
  {
    name: "LCD I2C",
    icon: "i-heroicons-device-phone-mobile",
    color: "indigo",
    pins: [
      { pin: "A4", name: "SDA (Data)", type: "i2c" },
      { pin: "A5", name: "SCL (Clock)", type: "i2c" }
    ]
  }
]

// Función para obtener color de badge según tipo
const getPinTypeColor = (type: string) => {
  const colors = {
    output: "success",
    pwm: "warning",
    spi: "info",
    trigger: "primary",
    echo: "secondary",
    i2c: "neutral"
  }
  return colors[type as keyof typeof colors] || "gray"
}
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar 
        title="Dashboard - Arduino" 
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="min-h-screen p-6">
        <div class="mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          
          <!-- SIDEBAR MEJORADO CON COMPONENTES NUXT UI -->
          <aside class="space-y-6">
            <!-- Tarjeta de título -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-microchip" class="w-6 h-6 text-primary-500" />
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                      📡 Conexiones del Sistema
                    </h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Configuración de pines Arduino Uno
                    </p>
                  </div>
                </div>
              </template>

              <div class="space-y-6">
                <!-- Lista automatizada de pines -->
                <div v-for="category in pinCategories" :key="category.name" class="space-y-2">
                  <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-1">
                    <UIcon :name="category.icon" class="w-4 h-4" :class="`text-${category.color}-500`" />
                    <h3 class="font-medium text-gray-800 dark:text-gray-200 text-sm">
                      {{ category.name }}
                    </h3>
                  </div>
                  
                  <div class="space-y-1.5 pl-2">
                    <div v-for="pinInfo in category.pins" :key="pinInfo.pin" 
                         class="flex items-center justify-between text-xs">
                      <span class="font-mono font-semibold text-primary-600 dark:text-primary-400">
                        {{ pinInfo.pin }}
                      </span>
                      <span class="text-gray-600 dark:text-gray-400 flex-1 ml-2">
                        {{ pinInfo.name }}
                      </span>
                      <UBadge :color="getPinTypeColor(pinInfo.type)" size="xs" variant="subtle">
                        {{ pinInfo.type }}
                      </UBadge>
                    </div>
                  </div>
                </div>
              </div>

              <template #footer>
                <div class="space-y-2">
                  <UButton
                    block
                    color="primary"
                    variant="solid"
                    icon="i-heroicons-play-circle"
                    @click="go('/dashboard/laboratory/ios-jetson-nano')"
                  >
                    Ir a Programar
                  </UButton>
                  
                  <UButton
                    block
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-book-open"
                    @click="go('/docs/hardware/arduino/arduino-overview')"
                  >
                     Documentación completa
                  </UButton>
                </div>
              </template>
            </UCard>

            <!-- Tarjeta de estadísticas rápidas -->
            <UCard>
              <div class="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {{ pinCategories.reduce((acc, cat) => acc + cat.pins.length, 0) }}
                  </p>
                  <p class="text-xs text-gray-500">Pines Totales</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {{ pinCategories.length }}
                  </p>
                  <p class="text-xs text-gray-500">Dispositivos</p>
                </div>
              </div>
            </UCard>
          </aside>

          <!-- TARJETA DE IMAGEN -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-photo" class="w-5 h-5 text-primary-500" />
                  <div>
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                      Esquema de la Arquitectura de Arduino
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Diagrama de conexiones y pines del sistema IoT
                    </p>
                  </div>
                </div>
                <UBadge color="primary" variant="subtle" size="sm">
                  v1.0
                </UBadge>
              </div>
            </template>

            <div class="flex justify-center items-center">
              <img 
                src="/images/esquema-arduino.png" 
                alt="Esquema IoT - Arquitectura Arduino"
                class="w-full max-w-5xl rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </div>

            <template #footer>
              <div class="flex justify-between items-center text-xs text-gray-500">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
                  <span>Última actualización: diagrama de referencia oficial</span>
                </div>
                <UBadge color="gray" variant="soft" size="xs">
                  Arduino Uno R3
                </UBadge>
              </div>
            </template>
          </UCard>

        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
/* Transiciones suaves para los cards */
:deep(.card-hover) {
  transition: all 0.2s ease-in-out;
}
</style>