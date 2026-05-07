<script setup lang="ts">

definePageMeta({
    layout: "student",
    roles: ["student", "docente"]
})
</script>
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 text-4xl mb-4">
          🍓</div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Raspberry Pi (IOS Router)</h1>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Emulated Cisco IOS router / switch for network labs</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-semibold flex gap-2"><span>💻</span> Device</h2>
          <p class="mt-2 text-gray-600 dark:text-gray-300">Raspberry Pi 4 Model B (8GB RAM) running GNS3 / Dynamips with
            Cisco IOS images.</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-semibold flex gap-2"><span>🌐</span> Interfaces</h2>
          <ul class="mt-2 space-y-1 text-gray-600">
            <li>• eth0: WAN (DHCP)</li>
            <li>• eth1: LAN 192.168.1.0/24</li>
            <li>• wlan0: IoT network 10.0.0.0/24</li>
          </ul>
        </div>
      </div>

      <div class="mt-8 bg-gray-100 dark:bg-gray-800 rounded-2xl p-6">
        <h3 class="font-bold">📋 IOS Commands Example</h3>
        <pre class="bg-gray-900 text-green-400 p-4 rounded-lg text-sm mt-2 overflow-x-auto"><code>enable
configure terminal
interface eth1
ip address 192.168.1.1 255.255.255.0
no shutdown
exit
router ospf 1
network 192.168.1.0 0.0.0.255 area 0</code></pre>
      </div>
    </div>
  </div>
</template>
