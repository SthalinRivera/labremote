<script setup lang="ts">
const go = (path: string) => navigateTo(path)

definePageMeta({
    layout: "student",
    roles: ["student", "docente"]
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
  <div class="min-h-screen p-6">

    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

      <!-- SIDEBAR MEJORADO -->
      <aside class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl h-fit space-y-6">

        <!-- Título -->
        <div>
          <h2 class="text-base font-semibold text-gray-800 dark:text-white">
            📡 Conexiones
          </h2>
          <p class="text-xs text-gray-500">
            Pines del sistema
          </p>
        </div>

        <!-- LISTA CLARA -->
        <div class="space-y-3 text-sm">

          <div>
            <p class="font-medium text-gray-700 dark:text-gray-300">LEDs</p>
            <p class="text-xs text-gray-500">D2 (verde), D3 (amarillo), D4 (rojo)</p>
          </div>

          <div>
            <p class="font-medium text-gray-700 dark:text-gray-300">Servo</p>
            <p class="text-xs text-gray-500">D5</p>
          </div>

          <div>
            <p class="font-medium text-gray-700 dark:text-gray-300">MAX7219</p>
            <p class="text-xs text-gray-500">DIN D11 · CS D10 · CLK D13</p>
          </div>

          <div>
            <p class="font-medium text-gray-700 dark:text-gray-300">Ultrasónico</p>
            <p class="text-xs text-gray-500">TRIG D6 · ECHO D7</p>
          </div>

          <div>
            <p class="font-medium text-gray-700 dark:text-gray-300">Motor</p>
            <p class="text-xs text-gray-500">D9</p>
          </div>

          <div>
            <p class="font-medium text-gray-700 dark:text-gray-300">LCD I2C</p>
            <p class="text-xs text-gray-500">SDA A4 · SCL A5</p>
          </div>

        </div>

        <!-- BOTONES -->
        <div class="space-y-2">

          <button @click="go('/programar')"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition">
            ▶ Ir a Programar
          </button>

          <button @click="go('/documentacion')"
            class="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm py-2 rounded-lg transition">
            📄 Más documentación
          </button>

        </div>

      </aside>

      <!-- IMAGEN -->
      <div class="flex justify-center">
        <img src="/images/esquema-arduino.png" alt="Esquema IoT" class="w-full max-w-5xl rounded-2xl shadow-xl" />
      </div>

    </div>

  </div>
    </template>
</UDashboardPanel>
</template>