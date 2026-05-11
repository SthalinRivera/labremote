<script setup lang="ts">
const { user, isLogged, isLoading, initAuth, logout } = useAuth()
const { mainMenuItems, isStudent, isAdmin } = useMenu() // 👈 Importar useMenu
const router = useRouter()

const profileOpen = ref(false)

onMounted(async () => {
    await initAuth()
})

// Opciones del menú desplegable basadas en useMenu
const dropdownItems = computed(() => {
    const items = []

    // Sección 1: Información del usuario
    items.push([
        {
            label: user.value?.name || 'Usuario',
            icon: 'i-lucide-user',
            slot: 'account',
            class: 'pointer-events-none font-semibold'
        },
        {
            label: user.value?.email,
            icon: 'i-lucide-mail',
            slot: 'email',
            class: 'pointer-events-none text-muted text-sm'
        }
    ])

    // Sección 2: Menú basado en el rol (usando menuItems del composable)
    const userMenuItems = []

    // Convertir menuItems a formato de dropdown
    if (isLogged.value) {
        // Filtrar items que no queremos en el dropdown (ej: documentación)
        const filteredItems = mainMenuItems.value.filter(item =>
            item.label !== 'Documentación' && // Excluir documentación del dropdown
            item.label !== 'Nosotros'
        )

        filteredItems.forEach(item => {
            userMenuItems.push({
                label: item.label,
                icon: item.icon,
                to: item.to,
                onSelect: () => {
                    if (item.to) router.push(item.to)
                }
            })
        })
    }

    // Agregar división si hay items
    if (userMenuItems.length > 0) {
        items.push(userMenuItems)
    }

    // Sección 3: Cerrar sesión
    items.push([
        {
            label: 'Cerrar sesión',
            icon: 'i-lucide-log-out',
            color: 'error',
            onSelect: () => logout()
        }
    ])

    return items
})

</script>

<template>
    <div class="flex items-center gap-3">
        <!-- Atajos rápidos según rol -->
        <UButton v-for="action in quickActions" :key="action.label" :to="action.to" :color="action.color"
            variant="ghost" size="sm" class="hidden md:flex">
            <UIcon :name="action.icon" class="mr-1" />
            {{ action.label }}
        </UButton>

        <UColorModeButton />

        <div v-if="isLoading" class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />

        <UButton v-else-if="!isLogged" to="/login" label="Ingresar" color="primary" variant="solid"
            icon="i-lucide-log-in" class="
    rounded-xl
    px-5
    py-2
    font-semibold
    shadow-md
    transition-all
    duration-300
    hover:scale-105
    hover:shadow-lg
    dark:shadow-primary-500/20
  " />

        <UDropdownMenu v-else :items="dropdownItems" :content="{ align: 'end', class: 'w-64' }">
            <div class="flex items-center gap-2 cursor-pointer">
                <UAvatar :src="user?.avatar_url" :alt="user?.name" size="md"
                    class="hover:ring-2 hover:ring-primary transition" />
                <div class="hidden md:block">
                    <p class="text-sm font-medium">{{ user?.name?.split(' ')[0] || 'Usuario' }}</p>
                    <p class="text-xs text-gray-500 capitalize">
                        {{ isAdmin ? 'Administrador' : 'Estudiante' }}
                    </p>
                </div>
            </div>
        </UDropdownMenu>
    </div>
</template>