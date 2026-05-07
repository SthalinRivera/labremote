<template>
    <div v-if="!lab.hasAccess" class="text-center py-8">
        <UIcon name="i-lucide-clock" class="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <h3 class="text-lg font-medium mb-2">Sesión finalizada</h3>
        <p class="text-gray-500 mb-4">Tu tiempo de laboratorio ha terminado</p>
        <UButton to="/student/queue" color="primary">
            Volver a la cola
        </UButton>
    </div>
    <slot v-else />
</template>

<script setup lang="ts">
const lab = useLabStore()
</script>