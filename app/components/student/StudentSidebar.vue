<template>
    <aside 
        :class="[
            'fixed lg:relative z-30 transition-all duration-300',
            'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
            isOpen ? 'w-64' : 'w-20'
        ]"
    >
        <!-- Logo -->
        <div class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
            <NuxtLink to="/dashboard" class="flex items-center gap-2">
                <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold">L</span>
                </div>
                <span v-if="isOpen" class="font-bold">
                    LabRemoto
                </span>
            </NuxtLink>
        </div>

        <!-- Botón colapsar (solo escritorio) -->
        <button
            @click="$emit('toggle')"
            class="absolute -right-3 top-20 hidden lg:flex p-1.5 bg-white dark:bg-gray-900 rounded-full border shadow-md"
        >
            <UIcon :name="isOpen ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'" class="w-4 h-4" />
        </button>

        <!-- Botón toggle para móvil -->
        <button
            @click="$emit('toggle')"
            class="absolute -right-10 top-20 lg:hidden p-2 bg-white dark:bg-gray-900 rounded-r-lg border shadow-lg"
        >
            <UIcon :name="isOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'" class="w-5 h-5" />
        </button>

        <!-- Menú -->
        <nav class="p-3 space-y-1">
            <NuxtLink
                v-for="item in menuItems"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                :class="[
                    isActive(item.to) 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                ]"
                @click="$emit('navigate')"
            >
                <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span v-if="isOpen" class="text-sm">
                    {{ item.label }}
                </span>
            </NuxtLink>
        </nav>

        <!-- Footer con usuario -->
        <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-2" :class="{ 'justify-center': !isOpen }">
                <UAvatar size="sm" :src="userAvatar" :fallback="userName?.charAt(0) || 'U'" />
                <div v-if="isOpen" class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{{ userName || 'Usuario' }}</p>
                    <p class="text-xs text-gray-400">{{ userRole || 'Estudiante' }}</p>
                </div>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { useRoute } from '#app'

interface MenuItem {
    to: string
    label: string
    icon: string
}

defineProps<{
    menuItems: MenuItem[]
    isOpen: boolean
    userName?: string
    userRole?: string
    userAvatar?: string
}>()

const emit = defineEmits<{
    toggle: []
    navigate: []
}>()

const route = useRoute()

const isActive = (path: string) => {
    if (path === '/') return route.path === path
    return route.path.startsWith(path)
}
</script>