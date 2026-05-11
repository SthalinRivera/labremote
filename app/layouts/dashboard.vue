<script setup lang="ts">
const route = useRoute()
const toast = useToast()
const { mainMenuItems, footerMenuItems, searchGroups } = useMenu()
const open = ref(false)

// Cookie para consentimiento
const cookieConsent = useCookie('cookie-consent')
// Cookie para saber si ya se mostró el aviso
const cookieNoticeShown = useCookie('cookie-notice-shown', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 365 // 1 año
})

onMounted(async () => {
    // Solo mostrar si no ha dado consentimiento Y no se ha mostrado antes
    if (cookieConsent.value === 'accepted') return
    
    // Si ya se mostró el aviso antes, no mostrar de nuevo
    if (cookieNoticeShown.value === true) return
    
    toast.add({
        title: 'Usamos cookies para mejorar tu experiencia',
        duration: 0,
        close: false,
        actions: [{
            label: 'Aceptar',
            color: 'neutral',
            variant: 'outline',
            onClick: () => {
                cookieConsent.value = 'accepted'
                cookieNoticeShown.value = true
            }
        }, {
            label: 'Rechazar',
            color: 'neutral',
            variant: 'ghost',
            onClick: () => {
                cookieNoticeShown.value = true // Marcar como mostrado aunque rechace
            }
        }]
    })
})

// El resto de tu código permanece igual...
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

onMounted(() => {
    const { isLogged } = useAuth()
    if (isLogged.value) {
        lab.init()
    }
})

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
                 <LabStatusBar />
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