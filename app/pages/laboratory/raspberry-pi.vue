<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 text-4xl mb-4">
          🍓</div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Raspberry Pi (Main Controller)</h1>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Home Assistant, Node-RED, MQTT broker and automation server</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-semibold">📦 Software Stack</h2>
          <ul class="mt-3 space-y-2">
            <li>• Raspberry Pi OS Lite (64-bit)</li>
            <li>• Docker & Portainer</li>
            <li>• Node-RED (flows)</li>
            <li>• InfluxDB + Grafana</li>
            <li>• Zigbee2MQTT (Conbee II)</li>
          </ul>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-semibold">🌐 Network Services</h2>
          <ul class="mt-3 space-y-2">
            <li>• MQTT Broker (port 1883)</li>
            <li>• HTTP Dashboard (port 1880)</li>
            <li>• Grafana (port 3000)</li>
            <li>• Samba file sharing</li>
          </ul>
        </div>
      </div>
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-semibold">📊 Automations</h2>
        <p class="mt-2 text-gray-600">Lighting schedules, temperature alerts, and remote relay control via Telegram bot.
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

definePageMeta({
    layout: "student",
    roles: ["student", "docente"]
})
</script>