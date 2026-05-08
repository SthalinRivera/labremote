<!-- pages/404.vue - Solo para páginas no encontradas -->
<script setup lang="ts">
const router = useRouter()


</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
        <div class="text-center">
            <div class="mb-6">
                <UIcon name="i-lucide-file-question" class="w-20 h-20 text-gray-400 mx-auto" />
            </div>
            
            <h1 class="text-9xl font-bold text-gray-200 mb-4">404</h1>
            <p class="text-2xl font-semibold text-gray-700 mb-2">Página no encontrada</p>
            <p class="text-gray-500 mb-8">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
            
            <div class="space-y-4">
                <p class="text-sm text-gray-400">Serás redirigido al inicio en unos segundos...</p>
                <NuxtLink 
                    to="/" 
                    class="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Ir al inicio ahora
                </NuxtLink>
            </div>
        </div>
    </div>
</template>