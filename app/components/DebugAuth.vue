// components/DebugAuth.vue (para depuración)
<template>
    <div class="fixed bottom-2 right-2 text-xs bg-black/80 text-white p-2 rounded">
        <div>Logged: {{ isLogged }}</div>
        <div>Role: {{ user?.role }}</div>
        <div>Loading: {{ isLoading }}</div>
        <div>Storage: {{ hasStorage }}</div>
    </div>
</template>

<script setup>
const { isLogged, user, isLoading } = useAuth()
const hasStorage = process.client && !!localStorage.getItem('token')
</script>