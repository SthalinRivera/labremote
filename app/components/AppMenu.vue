<!-- components/PublicMenu.vue -->
<script setup lang="ts">
// Versión ultra simple sin dependencias
const publicMenuItems = [
    { label: 'Inicio', to: '/', icon: 'i-lucide-home' },
    { label: 'Nosotros', to: '/about', icon: 'i-lucide-users' },
    { label: 'Documentación', to: '/docs', icon: 'i-lucide-book-open' }
]
</script>

<template>
    <nav class="flex items-center gap-6">
        <NuxtLink 
            v-for="item in publicMenuItems" 
            :key="item.to" 
            :to="item.to"
            class="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition font-medium"
            active-class="text-blue-500 border-b-2 border-blue-500 pb-1"
        >
            <UIcon :name="item.icon" class="w-4 h-4" />
            {{ item.label }}
        </NuxtLink>
    </nav>
</template>