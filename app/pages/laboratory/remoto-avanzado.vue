<script setup lang="ts">
import { ref, onMounted } from "vue";

definePageMeta({
    layout: "student",
    roles: ["student", "docente"]
})

const vncUrl = "https://hometown-compare-hepatitis-guru.trycloudflare.com/vnc.html";
const camUrl = "https://committees-ftp-bob-lens.trycloudflare.com/cam/";

// Estados conexión
const vncOnline = ref(true);
const camOnline = ref(true);
const checking = ref(false);

// 🌙 Dark mode
const darkMode = ref(true);

const toggleDark = () => {
  darkMode.value = !darkMode.value;
  document.documentElement.classList.toggle("dark", darkMode.value);
  localStorage.setItem("theme", darkMode.value ? "dark" : "light");
};

// cargar preferencia
onMounted(() => {
  const saved = localStorage.getItem("theme");
  darkMode.value = saved ? saved === "dark" : true;
  document.documentElement.classList.toggle("dark", darkMode.value);
});

// Verificar conexión
const checkConnection = async (url: string) => {
  try {
    await fetch(url, { method: "HEAD", mode: "no-cors" });
    return true;
  } catch {
    return false;
  }
};

const verifyServices = async () => {
  checking.value = true;

  vncOnline.value = await checkConnection(vncUrl);
  camOnline.value = await checkConnection(camUrl);

  checking.value = false;
};

onMounted(() => {
  verifyServices();
  setInterval(verifyServices, 5000);
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-white p-6 transition-colors duration-300">

    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold">Laboratorio Remoto IoT & IA</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          Monitoreo en tiempo real del sistema distribuido
        </p>
      </div>

      <!-- Toggle modo -->
      <button
        @click="toggleDark"
        class="bg-gray-200 dark:bg-gray-800 p-2 rounded-xl transition"
      >
        <span v-if="darkMode">🌙</span>
        <span v-else>🌞</span>
      </button>
    </div>

    <!-- Loader -->
    <div v-if="checking" class="mb-4 text-yellow-500 dark:text-yellow-400 text-sm">
      Verificando conexión...
    </div>

    <!-- Grid principal -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- 🖥️ VNC -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors duration-300">
        
        <div class="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between">
          <span class="font-semibold">Jetson Nano (Escritorio Remoto)</span>

          <span v-if="vncOnline" class="text-green-500 dark:text-green-400 text-xs">
            ● Online
          </span>
          <span v-else class="text-red-500 dark:text-red-400 text-xs">
            ● Offline
          </span>
        </div>

        <div v-if="vncOnline">
          <iframe
            :src="vncUrl"
            class="w-full h-[500px]"
            frameborder="0"
            allow="autoplay; fullscreen"
          ></iframe>
        </div>

        <div v-else class="flex flex-col items-center justify-center h-[500px] text-center">
          <p class="text-gray-500 dark:text-gray-400 mb-3">
            Sin conexión con la central
          </p>

          <button
            @click="verifyServices"
            class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Reintentar conexión
          </button>
        </div>
      </div>

      <!-- 🎥 Cámara -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors duration-300">
        
        <div class="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between">
          <span class="font-semibold">Cámara en Vivo</span>

          <span v-if="camOnline" class="text-red-500 dark:text-red-400 text-xs animate-pulse">
            ● REC
          </span>
          <span v-else class="text-red-500 dark:text-red-400 text-xs">
            ● Offline
          </span>
        </div>

        <div v-if="camOnline">
          <iframe
            :src="camUrl"
            class="w-full h-[500px]"
            frameborder="0"
            allow="autoplay"
          ></iframe>
        </div>

        <div v-else class="flex flex-col items-center justify-center h-[500px] text-center">
          <p class="text-gray-500 dark:text-gray-400 mb-3">
            Cámara desconectada
          </p>

          <button
            @click="verifyServices"
            class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Reconectar
          </button>
        </div>
      </div>

    </div>

    <!-- Panel inferior -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

      <div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <p class="text-gray-500 dark:text-gray-400 text-sm">Estado Sistema</p>

        <p
          class="font-bold"
          :class="(vncOnline && camOnline)
            ? 'text-green-500 dark:text-green-400'
            : 'text-red-500 dark:text-red-400'"
        >
          {{ (vncOnline && camOnline) ? 'Operativo' : 'Falla detectada' }}
        </p>
      </div>

      <div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <p class="text-gray-500 dark:text-gray-400 text-sm">Latencia</p>
        <p class="font-bold">~100 ms</p>
      </div>

      <div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <p class="text-gray-500 dark:text-gray-400 text-sm">Dispositivos</p>
        <p class="font-bold">
          {{ (vncOnline ? 1 : 0) + (camOnline ? 1 : 0) }} activos
        </p>
      </div>

    </div>

  </div>
</template>