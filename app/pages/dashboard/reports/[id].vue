<script setup lang="ts">
import type { User } from '~/types'
definePageMeta({
    layout: "dashboard",
    roles: ["admin"]
})
const route = useRoute()
const router = useRouter()
const toast = useToast()
const api = useApi()

const id = route.params.id as string

const { data: user, status, error } = useAsyncData(
    `user-${id}`,
    () => api<User>(`/users/${id}`),
    { default: () => null }
)

if (error.value) {
    toast.add({ title: 'Error', description: 'Usuario no encontrado', color: 'error' })
    router.push('/customers')
}

function goBack() {
    router.back()
}
</script>

<template>
    <UDashboardPanel>
        <template #header>
            <UDashboardNavbar :title="user?.name || 'Cargando...'">
                <template #leading>
                    <UButton variant="ghost" icon="i-lucide-arrow-left" @click="goBack" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div v-if="status === 'pending'" class="flex justify-center py-12">
                <UProgress infinite class="w-64" />
            </div>

            <UCard v-else-if="user">
                <div class="flex items-center gap-4">
                    <UAvatar :src="user.avatar_url || undefined" :alt="user.name" size="xl" />
                    <div>
                        <h2 class="text-2xl font-bold">{{ user.name }}</h2>
                        <p class="text-muted">{{ user.email }}</p>
                        <UBadge :color="user.role === 'admin' ? 'success' : 'neutral'" class="mt-1">
                            {{ user.role === 'admin' ? 'Administrador' : 'Estudiante' }}
                        </UBadge>
                    </div>
                </div>

                <UDivider class="my-4" />

                <div class="space-y-2 text-sm">
                    <div class="flex gap-2">
                        <span class="font-medium w-24">ID:</span>
                        <span class="font-mono text-xs">{{ user.id }}</span>
                        <UButton variant="ghost" size="xs" icon="i-lucide-copy"
                            @click="navigator.clipboard.writeText(user.id)" />
                    </div>
                    <div class="flex gap-2">
                        <span class="font-medium w-24">Creado:</span>
                        <span>{{ new Date(user.created_at).toLocaleString() }}</span>
                    </div>
                </div>
            </UCard>
        </template>
    </UDashboardPanel>
</template>