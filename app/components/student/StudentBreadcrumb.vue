<template>
    <div class="mb-1 max-w-7xl mx-auto">
        <div class="flex items-center gap-2 text-sm">
            <NuxtLink 
                v-for="(item, index) in items" 
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-1"
                :class="[
                    index === items.length - 1 
                        ? 'text-gray-600 dark:text-gray-400 font-medium' 
                        : 'text-gray-500 hover:text-primary-600'
                ]"
            >
                <UIcon v-if="item.icon" :name="item.icon" class="w-4 h-4" />
                <span>{{ item.label }}</span>
                <UIcon 
                    v-if="index < items.length - 1" 
                    name="i-heroicons-chevron-right" 
                    class="w-4 h-4 mx-1 text-gray-400"
                />
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
    label: string
    to: string
    icon?: string
}

defineProps<{
    items: BreadcrumbItem[]
}>()
</script>