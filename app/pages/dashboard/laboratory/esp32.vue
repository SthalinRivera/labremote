<script setup lang="ts">

definePageMeta({
    layout: "dashboard",
    roles: ["student", "docente"]
})
</script>
<template>

       <UDashboardPanel id="dashboard">
           <template #header>
         <UDashboardNavbar title="Dashboard - ESP32" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
     
             <UColorModeButton />
         

         
        </template>
      </UDashboardNavbar>
  
</template>

    <template #body> 
  <div class="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto text-center">
      <div
        class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 text-4xl mb-4">
        📶</div>
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">ESP32 (Wireless Node)</h1>
      <p class="mt-4 text-gray-600 dark:text-gray-300">WiFi + BLE, low-power sensor node for environmental monitoring
      </p>

      <div class="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left">
        <h2 class="text-xl font-semibold">📡 Technical Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div><strong>MCU:</strong> Tensilica Xtensa LX6 (dual-core)</div>
          <div><strong>Clock:</strong> 240 MHz</div>
          <div><strong>Flash:</strong> 4MB (SPI)</div>
          <div><strong>RAM:</strong> 520 KB SRAM</div>
          <div><strong>Connectivity:</strong> 2.4 GHz WiFi + BLE 4.2</div>
        </div>
        <h2 class="text-xl font-semibold mt-6 mb-2">🌡️ Connected Sensors</h2>
        <ul class="list-disc list-inside space-y-1">
          <li>BME280 (pressure, humidity, temperature)</li>
          <li>BH1750 (light intensity)</li>
          <li>PIR motion sensor</li>
        </ul>
        <div class="mt-6 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
          <p><strong>MQTT Topics:</strong></p>
          <code class="block text-xs">esp32/sensors/temperature<br>esp32/sensors/humidity<br>esp32/motion/status</code>
        </div>
      </div>
    </div>
  </div>
    </template>
</UDashboardPanel>
</template>
