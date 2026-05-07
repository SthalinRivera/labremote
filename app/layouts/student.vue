<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useMenu } from '~/composables/useMenu'

const route = useRoute()
const toast = useToast()
const { user, isLogged } = useAuth()
const { menuItems, isStudent, isAdmin } = useMenu()
const lab = useLabStore()

const open = ref(false)

// Convertir menuItems al formato que espera NavigationMenuItem
const navigationLinks = computed(() => {
    if (!isLogged.value) return [[], []]
    
    const mainItems: NavigationMenuItem[] = []
    const footerItems: NavigationMenuItem[] = []
    
    menuItems.value.forEach(item => {
        const navItem: NavigationMenuItem = {
            label: item.label,
            icon: item.icon,
            to: item.to,
            onSelect: () => {
                open.value = false
            }
        }
        
        if (item.label === 'Documentación' || item.label === 'Ayuda') {
            footerItems.push(navItem)
        } else {
            mainItems.push(navItem)
        }
    })
    
    // if (isStudent.value) {
    //     mainItems.push({
    //         label: 'Laboratorio',
    //         icon: 'i-lucide-flask-conical',
    //         to: '/laboratory/ios-jetson-nano',
    //         badge: 'Activo',
    //         onSelect: () => { open.value = false }
    //     })
    // }
    
    if (isAdmin.value) {
        mainItems.push({
            label: 'Dashboard Admin',
            icon: 'i-lucide-layout-dashboard',
            to: '/dashboard',
            onSelect: () => { open.value = false }
        })
    }
    
    return [mainItems, footerItems]
})

// ✅ CORREGIDO: Grupos para búsqueda con datos reales
const searchGroups = computed(() => {
    const groups = []
    
    // Grupo de navegación principal
    if (navigationLinks.value[0]?.length > 0) {
        groups.push({
            id: 'main',
            label: 'Navegación Principal',
            items: navigationLinks.value[0].map(item => ({
                id: item.to,
                label: item.label,
                icon: item.icon,
                to: item.to
            }))
        })
    }
    
    // Grupo de recursos
    if (navigationLinks.value[1]?.length > 0) {
        groups.push({
            id: 'resources',
            label: 'Recursos',
            items: navigationLinks.value[1].map(item => ({
                id: item.to,
                label: item.label,
                icon: item.icon,
                to: item.to
            }))
        })
    }
    
    // Grupo de usuario
    if (isLogged.value) {
        groups.push({
            id: 'user',
            label: 'Mi Cuenta',
            items: [
                {
                    id: 'profile',
                    label: 'Mi Perfil',
                    icon: 'i-lucide-user',
                    to: '/profile'
                },
                {
                    id: 'logout',
                    label: 'Cerrar Sesión',
                    icon: 'i-lucide-log-out',
                    onSelect: () => {
                        const { logout } = useAuth()
                        logout()
                    }
                }
            ]
        })
    }
    
    return groups
})

// Verificar cookies al montar
onMounted(async () => {
    const cookie = useCookie('cookie-consent')
    if (cookie.value === 'accepted') return
    
    toast.add({
        title: 'Usamos cookies para mejorar tu experiencia.',
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


// Watcher para detectar cuando la sesión termina
watch(() => lab.hasAccess, (hasAccess, oldHasAccess) => {
    // Si perdió el acceso (sesión terminó) y antes tenía acceso
    if (oldHasAccess === true && hasAccess === false) {
        const currentPath = window.location.pathname
        const labRoutes = ['/laboratory/camera', '/laboratory/ios-jetson-nano', '/laboratory/schematic']
        
        if (labRoutes.some(route => currentPath.startsWith(route))) {
            toast.add({
                title: 'Sesión finalizada',
                description: 'Tu tiempo de laboratorio ha terminado',
                color: 'warning'
            })
            navigateTo('/student')
        }
    }
})
</script>

<template>
    <UDashboardGroup unit="rem">
        <!-- Sidebar -->
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

                <UNavigationMenu 
                    :collapsed="collapsed" 
                    :items="navigationLinks[0] || []" 
                    orientation="vertical" 
                    tooltip 
                    popover 
                />

                <UNavigationMenu 
                    :collapsed="collapsed" 
                    :items="navigationLinks[1] || []" 
                    orientation="vertical" 
                    tooltip 
                    class="mt-auto"
                />
            </template>

            <template #footer="{ collapsed }">
                <UserMenu :collapsed="collapsed" />
            </template>
        </UDashboardSidebar>

        <!-- ✅ Buscador con los grupos correctos -->
        <UDashboardSearch :groups="searchGroups" />

        <!-- Contenido principal -->
        <slot />

        <!-- Notificaciones -->
        <NotificationsSlideover />
    </UDashboardGroup>
</template>