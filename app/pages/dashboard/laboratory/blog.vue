<script setup lang="ts">
definePageMeta({ layout: 'default' })

const posts = [
    {
        title: 'Implementación de laboratorio remoto',
        date: '2026-04-20',
        slug: 'lab-remoto'
    },
    {
        title: 'Uso de Jetson Nano en visión artificial',
        date: '2026-04-18',
        slug: 'jetson-nano'
    }
]
</script>

<template>
    <div class="max-w-4xl mx-auto py-16 px-6 space-y-8">

        <h1 class="text-3xl font-bold">Blog</h1>

        <div class="space-y-4">
            <NuxtLink v-for="post in posts" :key="post.slug" :to="`/blog/${post.slug}`"
                class="block p-6 bg-gray-900 rounded-xl border border-gray-800 hover:bg-gray-800 transition">
                <h2 class="text-xl font-semibold">{{ post.title }}</h2>
                <p class="text-sm text-gray-400 mt-1">{{ post.date }}</p>
            </NuxtLink>
        </div>

    </div>
</template>