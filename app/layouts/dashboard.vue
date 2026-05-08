<script setup lang="ts">
const route = useRoute()
const toast = useToast()
const { mainMenuItems, footerMenuItems, searchGroups } = useMenu()
const open = ref(false)

onMounted(async () => {
    const cookie = useCookie('cookie-consent')
    if (cookie.value === 'accepted') return
    
    toast.add({
        title: 'Usamos cookies para mejorar tu experiencia',
        duration: 0,
        close: false,
        actions: [{
            label: 'Aceptar',
            color: 'neutral',
            variant: 'outline',
            onClick: () => {
                cookie.value = 'accepted'
            }
        }, {
            label: 'Rechazar',
            color: 'neutral',
            variant: 'ghost'
        }]
    })
})

// Watcher para sesión de laboratorio
const lab = useLabStore()
watch(() => lab.hasAccess, (hasAccess, oldHasAccess) => {
    if (oldHasAccess === true && hasAccess === false) {
        const currentPath = window.location.pathname
        const labRoutes = ['/laboratory/camera', '/laboratory/ios-jetson-nano', '/laboratory/schematic']
        
        if (labRoutes.some(route => currentPath.startsWith(route))) {
            toast.add({
                title: 'Sesión finalizada',
                description: 'Tu tiempo de laboratorio ha terminado',
                color: 'warning'
            })
            navigateTo('/dashboard/session-status')
        }
    }
})


// Inicializar el store cuando el usuario está logueado
onMounted(() => {
    const { isLogged } = useAuth()
    if (isLogged.value) {
        lab.init()
    }
})

// Cleanup
onUnmounted(() => {
    lab.stop()
})
</script>

<template>
    <UDashboardGroup unit="rem">
        <UDashboardSidebar 
            id="default" 
            v-model:open="open" 
            collapsible 
            resizable 
            class="bg-elevated/25"
            :ui="{ footer: 'lg:border-t lg:border-default' }"
        >
            <template #header="{ collapsed }">
                <TeamsMenu :collapsed="collapsed" />
            </template>

            <template #default="{ collapsed }">
                <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

                <!-- Menú Principal -->
                <UNavigationMenu 
                    :collapsed="collapsed" 
                    :items="mainMenuItems" 
                    orientation="vertical" 
                    tooltip 
                    popover 
                />

                <!-- Menú Footer (separador automático) -->
                <UNavigationMenu 
                    v-if="footerMenuItems.length > 0"
                    :collapsed="collapsed" 
                    :items="footerMenuItems" 
                    orientation="vertical" 
                    tooltip 
                    class="mt-auto" 
                />
            </template>

            <template #footer="{ collapsed }">
                <UserMenu :collapsed="collapsed" />
            </template>
        </UDashboardSidebar>

        <!-- Buscador unificado -->
        <UDashboardSearch :groups="searchGroups" />

        <!-- Contenido principal -->
        <slot />

        <!-- Notificaciones -->
        <NotificationsSlideover />
    </UDashboardGroup>
</template>