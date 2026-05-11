<script setup lang="ts">
const go = (path: string) => navigateTo(path)

definePageMeta({
    layout: "dashboard",
    roles: ["student", "docente"]
})

// Datos automatizados de pines para ESP32-S3
const pinCategories = [
  {
    name: "LEDs",
    icon: "i-heroicons-light-bulb",
    color: "green",
    pins: [
      { pin: "GPIO2", name: "LED Built-in", type: "output", notes: "LED RGB integrado" },
      { pin: "GPIO3", name: "LED Verde Externo", type: "output", notes: "" },
      { pin: "GPIO4", name: "LED Amarillo", type: "output", notes: "" },
      { pin: "GPIO5", name: "LED Rojo", type: "output", notes: "" }
    ]
  },
  {
    name: "Servo Motores",
    icon: "i-heroicons-cog-6-tooth",
    color: "orange",
    pins: [
      { pin: "GPIO6", name: "Servo 1", type: "pwm", notes: "SG90" },
      { pin: "GPIO7", name: "Servo 2", type: "pwm", notes: "MG995" },
      { pin: "GPIO8", name: "Servo 3", type: "pwm", notes: "" }
    ]
  },
  {
    name: "Comunicación SPI",
    icon: "i-heroicons-computer-chip",
    color: "blue",
    pins: [
      { pin: "GPIO11", name: "MOSI", type: "spi", notes: "Master Out Slave In" },
      { pin: "GPIO12", name: "MISO", type: "spi", notes: "Master In Slave Out" },
      { pin: "GPIO13", name: "SCK", type: "spi", notes: "Serial Clock" },
      { pin: "GPIO10", name: "CS0", type: "spi", notes: "Chip Select 0" },
      { pin: "GPIO14", name: "CS1", type: "spi", notes: "Chip Select 1" }
    ]
  },
  {
    name: "Sensores",
    icon: "i-heroicons-radio",
    color: "purple",
    pins: [
      { pin: "GPIO15", name: "Ultrasonido TRIG", type: "trigger", notes: "HC-SR04" },
      { pin: "GPIO16", name: "Ultrasonido ECHO", type: "echo", notes: "HC-SR04" },
      { pin: "GPIO17", name: "Sensor Temperatura", type: "analog", notes: "LM35/DHT22" },
      { pin: "GPIO18", name: "Sensor Humedad", type: "digital", notes: "DHT22" },
      { pin: "GPIO19", name: "Sensor PIR", type: "digital", notes: "Movimiento" },
      { pin: "GPIO20", name: "Sensor Luz", type: "analog", notes: "LDR" }
    ]
  },
  {
    name: "Motores DC",
    icon: "i-heroicons-bolt",
    color: "red",
    pins: [
      { pin: "GPIO21", name: "Motor A (IN1)", type: "pwm", notes: "Puente H" },
      { pin: "GPIO22", name: "Motor A (IN2)", type: "pwm", notes: "Puente H" },
      { pin: "GPIO23", name: "Motor B (IN3)", type: "pwm", notes: "Puente H" },
      { pin: "GPIO24", name: "Motor B (IN4)", type: "pwm", notes: "Puente H" },
      { pin: "GPIO25", name: "ENA", type: "pwm", notes: "Enable A - PWM" },
      { pin: "GPIO26", name: "ENB", type: "pwm", notes: "Enable B - PWM" }
    ]
  },
  {
    name: "LCD / Display",
    icon: "i-heroicons-device-phone-mobile",
    color: "indigo",
    pins: [
      { pin: "GPIO41", name: "SDA", type: "i2c", notes: "LCD I2C / OLED" },
      { pin: "GPIO42", name: "SCL", type: "i2c", notes: "LCD I2C / OLED" },
      { pin: "GPIO38", name: "RS", type: "lcd", notes: "LCD 16x2 Paralelo" },
      { pin: "GPIO39", name: "EN", type: "lcd", notes: "LCD Enable" },
      { pin: "GPIO33", name: "D4", type: "lcd", notes: "LCD D4" },
      { pin: "GPIO34", name: "D5", type: "lcd", notes: "LCD D5" },
      { pin: "GPIO35", name: "D6", type: "lcd", notes: "LCD D6" },
      { pin: "GPIO36", name: "D7", type: "lcd", notes: "LCD D7" }
    ]
  },
  {
    name: "I2C Adicionales",
    icon: "i-heroicons-circle-stack",
    color: "teal",
    pins: [
      { pin: "GPIO1", name: "SDA (Alternativo)", type: "i2c", notes: "Segundo bus I2C" },
      { pin: "GPIO2", name: "SCL (Alternativo)", type: "i2c", notes: "Segundo bus I2C" }
    ]
  },
  {
    name: "Botones y Entradas",
    icon: "i-heroicons-cursor-arrow-rays",
    color: "yellow",
    pins: [
      { pin: "GPIO0", name: "Boot Button", type: "input", notes: "Boot/Reset" },
      { pin: "GPIO9", name: "Botón Usuario", type: "input", notes: "Pull-up interno" },
      { pin: "GPIO40", name: "Interruptor DIP", type: "input", notes: "" },
      { pin: "GPIO43", name: "Encoder CLK", type: "encoder", notes: "Rotary Encoder" },
      { pin: "GPIO44", name: "Encoder DT", type: "encoder", notes: "Rotary Encoder" },
      { pin: "GPIO45", name: "Botón Encoder", type: "input", notes: "Push button" }
    ]
  },
  {
    name: "Comunicación Serial",
    icon: "i-heroicons-signal",
    color: "cyan",
    pins: [
      { pin: "GPIO43", name: "TX0", type: "uart", notes: "Serial0 Transmit" },
      { pin: "GPIO44", name: "RX0", type: "uart", notes: "Serial0 Receive" },
      { pin: "GPIO17", name: "TX1", type: "uart", notes: "Serial1 Transmit" },
      { pin: "GPIO18", name: "RX1", type: "uart", notes: "Serial1 Receive" },
      { pin: "GPIO19", name: "TX2", type: "uart", notes: "Serial2 Transmit" },
      { pin: "GPIO20", name: "RX2", type: "uart", notes: "Serial2 Receive" }
    ]
  },
  {
    name: "ADC (Analógicos)",
    icon: "i-heroicons-chart-bar",
    color: "emerald",
    pins: [
      { pin: "GPIO1", name: "ADC1_CH0", type: "adc", notes: "12-bit ADC" },
      { pin: "GPIO2", name: "ADC1_CH1", type: "adc", notes: "12-bit ADC" },
      { pin: "GPIO3", name: "ADC1_CH2", type: "adc", notes: "12-bit ADC" },
      { pin: "GPIO4", name: "ADC1_CH3", type: "adc", notes: "12-bit ADC" },
      { pin: "GPIO5", name: "ADC1_CH4", type: "adc", notes: "12-bit ADC" },
      { pin: "GPIO6", name: "ADC1_CH5", type: "adc", notes: "12-bit ADC" },
      { pin: "GPIO7", name: "ADC1_CH6", type: "adc", notes: "12-bit ADC" },
      { pin: "GPIO8", name: "ADC1_CH7", type: "adc", notes: "12-bit ADC" }
    ]
  },
  {
    name: "DAC (Salida Analógica)",
    icon: "i-heroicons-speaker-wave",
    color: "pink",
    pins: [
      { pin: "GPIO17", name: "DAC1", type: "dac", notes: "8-bit DAC" },
      { pin: "GPIO18", name: "DAC2", type: "dac", notes: "8-bit DAC" }
    ]
  },
  {
    name: "USB / OTG",
    icon: "i-heroicons-usb",
    color: "violet",
    pins: [
      { pin: "GPIO19", name: "USB D-", type: "usb", notes: "USB OTG" },
      { pin: "GPIO20", name: "USB D+", type: "usb", notes: "USB OTG" },
      { pin: "GPIO21", name: "VBUS Sense", type: "power", notes: "Detección USB" }
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
    i2c: "neutral",
    lcd: "cool",
    input: "gray",
    encoder: "amber",
    uart: "sky",
    adc: "emerald",
    dac: "pink",
    usb: "violet",
    power: "rose",
    analog: "lime",
    digital: "blue"
  }
  return colors[type as keyof typeof colors] || "gray"
}

// Estadísticas calculadas
const totalPins = computed(() => {
  return pinCategories.reduce((acc, cat) => acc + cat.pins.length, 0)
})

const uniqueTypes = computed(() => {
  const types = new Set()
  pinCategories.forEach(cat => {
    cat.pins.forEach(pin => types.add(pin.type))
  })
  return types.size
})
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar 
        title="Dashboard - ESP32-S3" 
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
        <div class="mx-auto grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
          
          <!-- SIDEBAR COMPLETO PARA ESP32-S3 -->
          <aside class="space-y-6">
            <!-- Tarjeta de título e info -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-microchip" class="w-7 h-7 text-primary-500" />
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                      🔌 ESP32-S3 Pinout
                    </h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Configuración completa de pines
                    </p>
                  </div>
                </div>
              </template>

              <div class="space-y-5 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scroll">
                <!-- Lista automatizada de pines por categoría -->
                <div v-for="category in pinCategories" :key="category.name" class="space-y-2">
                  <div class="flex items-center gap-2 border-b-2 border-gray-200 dark:border-gray-700 pb-1.5">
                    <UIcon :name="category.icon" class="w-4 h-4" :class="`text-${category.color}-500`" />
                    <h3 class="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                      {{ category.name }}
                    </h3>
                    <UBadge size="xs" variant="subtle" :color="category.color">
                      {{ category.pins.length }}
                    </UBadge>
                  </div>
                  
                  <div class="space-y-2 pl-2">
                    <div v-for="pinInfo in category.pins" :key="pinInfo.pin" 
                         class="group flex flex-col gap-1 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="font-mono font-bold text-sm text-primary-600 dark:text-primary-400">
                            {{ pinInfo.pin }}
                          </span>
                          <span class="text-sm text-gray-700 dark:text-gray-300">
                            {{ pinInfo.name }}
                          </span>
                        </div>
                        <UBadge :color="getPinTypeColor(pinInfo.type)" size="xs" variant="subtle">
                          {{ pinInfo.type.toUpperCase() }}
                        </UBadge>
                      </div>
                      <div v-if="pinInfo.notes" class="text-xs text-gray-500 dark:text-gray-400 pl-2">
                        💡 {{ pinInfo.notes }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <template #footer>
                <div class="space-y-2 pt-2">
                  <UButton
                    block
                    color="primary"
                    variant="solid"
                    icon="i-heroicons-play-circle"
                    size="md"
                    @click="go('/dashboard/laboratory/ios-jetson-nano')"
                  >
                    Ir a Programar
                  </UButton>
                  
                  <UButton
                    block
                    color="neutral"
                    variant="ghost"
                    icon="i-heroicons-book-open"
                    @click="go('/docs/hardware/esp32/esp32-overview')"
                  >
                   Documentación completa
                  </UButton>

                </div>
              </template>
            </UCard>

            <!-- Tarjeta de estadísticas avanzadas -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-chart-pie" class="w-4 h-4" />
                  <h3 class="text-sm font-semibold">Estadísticas del sistema</h3>
                </div>
              </template>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {{ totalPins }}
                  </p>
                  <p class="text-xs text-gray-500">Pines configurados</p>
                </div>
                <div class="text-center">
                  <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {{ pinCategories.length }}
                  </p>
                  <p class="text-xs text-gray-500">Categorías</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {{ uniqueTypes }}
                  </p>
                  <p class="text-xs text-gray-500">Tipos de pines</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    240 MHz
                  </p>
                  <p class="text-xs text-gray-500">Frecuencia</p>
                </div>
              </div>

              <UDivider class="my-3" />

            </UCard>


          </aside>

          <!-- TARJETA DE IMAGEN DEL ESP32-S3 -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-photo" class="w-5 h-5 text-primary-500" />
                  <div>
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                      📐 Arquitectura y Pinout del ESP32-S3
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Diagrama completo de conexiones y distribución de pines
                    </p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <UBadge color="primary" variant="subtle" size="sm">
                    ESP32-S3
                  </UBadge>
                  <UBadge color="green" variant="subtle" size="sm">
                    USB-OTG
                  </UBadge>
                  <UBadge color="purple" variant="subtle" size="sm">
                    AI-Instructions
                  </UBadge>
                </div>
              </div>
            </template>

            <div class="flex justify-center items-center bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
              <img 
                src="/images/esp32.png" 
                alt="ESP32-S3 Pinout - Arquitectura completa"
                class="w-full max-w-5xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                loading="lazy"
              />
            </div>

            <template #footer>
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-gray-500">
                <div class="flex items-center gap-3 flex-wrap">
                  <div class="flex items-center gap-1">
                    <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
                    <span>Referencia oficial Espressif</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                    <span>v1.0 (2024)</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <UBadge color="gray" variant="soft" size="xs">
                    Dual-core Xtensa LX7
                  </UBadge>
                  <UBadge color="gray" variant="soft" size="xs">
                    AI Accelerator
                  </UBadge>
                </div>
              </div>
            </template>
          </UCard>

        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
/* Scroll personalizado para la sidebar */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .custom-scroll::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark .custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>