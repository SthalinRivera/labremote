// composables/useMenuDashboard.ts
import type { NavigationMenuItem } from '@nuxt/ui'

export interface MenuItem extends NavigationMenuItem {
    id?: string
    roles?: string[] // Para control de acceso por roles
    permissions?: string[] // Para control por permisos
}

export const useMenuDashboard = () => {
    const route = useRoute()
    const { user } = useAuth() // Asumiendo que tienes un sistema de auth

    // Definición centralizada del menú principal
    const mainMenuItems = computed<MenuItem[]>(() => [
        {
            id: 'home',
            label: 'Home',
            icon: 'i-lucide-house',
            to: '/dashboard',
            onSelect: () => closeMenu()
        },
        {
            id: 'inbox',
            label: 'Inbox',
            icon: 'i-lucide-inbox',
            to: '/dashboard/inbox',
            badge: '4',
            onSelect: () => closeMenu()
        },
        {
            id: 'customers',
            label: 'Customers',
            icon: 'i-lucide-users',
            to: '/dashboard/customers',
            onSelect: () => closeMenu()
        },
        {
            id: 'usuarios',
            label: 'Usuarios',
            icon: 'i-lucide-users',
            to: '/dashboard/users',
            onSelect: () => closeMenu(),
            roles: ['admin'] // Solo visible para admins
        },
        {
            id: 'metricas',
            label: 'Métricas',
            icon: 'i-lucide-bar-chart-4',
            to: '/dashboard/metrics',
            onSelect: () => closeMenu(),
            permissions: ['view_metrics']
        },
        {
            id: 'lab',
            label: 'Laboratorios',
            to: '/laboratory',
            icon: 'i-lucide-flask-conical',
            defaultOpen: route.path.includes('/laboratory'),
            type: 'trigger',
            children: [
                {
                    label: 'Esquemático',
                    to: '/laboratory/schematic',
                    icon: 'i-lucide-file-text',
                    disabled: false,
                    onSelect: () => closeMenu()
                },
                {
                    label: 'Mi Perfil',
                    to: '/student/profile',
                    icon: 'i-lucide-user',
                    disabled: false,
                    onSelect: () => closeMenu()
                },
                {
                    label: 'Jetson Nano',
                    to: '/laboratory/ios-jetson-nano',
                    icon: 'i-lucide-microchip',
                    onSelect: () => closeMenu()
                },
                {
                    label: 'Cámara',
                    to: '/laboratory/camera',
                    icon: 'i-lucide-camera',
                    disabled: false,
                    onSelect: () => closeMenu()
                },
                {
                    label: 'Cola',
                    to: '/student/queue',
                    icon: 'i-lucide-clock',
                    disabled: false,
                    onSelect: () => closeMenu()
                },
                {
                    label: 'Esquem. Arduino',
                    to: '/laboratory/arduino-r3',
                    icon: 'i-lucide-microchip',
                    disabled: false,
                    onSelect: () => closeMenu()
                },
                {
                    label: 'Esquem. Esp32',
                    to: '/laboratory/esp32',
                    icon: 'i-lucide-microchip',
                    disabled: false,
                    onSelect: () => closeMenu()
                }
            ]
        }
    ])

    // Menú secundario (footer)
    const secondaryMenuItems = computed<MenuItem[]>(() => [
        {
            id: 'feedback',
            label: 'Feedback',
            icon: 'i-lucide-message-circle',
            to: 'https://github.com/nuxt-ui-templates/dashboard',
            target: '_blank'
        },
        {
            id: 'help',
            label: 'Help & Support',
            icon: 'i-lucide-info',
            to: 'https://github.com/nuxt-ui-templates/dashboard',
            target: '_blank'
        }
    ])

    // Función para filtrar items por permisos/roles
    const filterByPermissions = (items: MenuItem[]): MenuItem[] => {
        if (!user.value) return items

        return items.filter(item => {
            // Verificar roles
            if (item.roles && !item.roles.includes(user.value.role)) {
                return false
            }

            // Verificar permisos
            if (item.permissions && !item.permissions.some(p => user.value.permissions?.includes(p))) {
                return false
            }

            // Filtrar hijos recursivamente
            if (item.children) {
                item.children = filterByPermissions(item.children as MenuItem[])
            }

            return true
        }).map(item => {
            // Remover propiedades internas antes de retornar
            const { roles, permissions, id, ...cleanItem } = item
            return cleanItem
        })
    }

    // Función para cerrar el menú
    const closeMenu = () => {
        const sidebarOpen = useState('sidebar-open')
        sidebarOpen.value = false
    }

    // Grupos para el search
    const searchGroups = computed(() => {
        const allItems = [...mainMenuItems.value, ...secondaryMenuItems.value]

        return [{
            id: 'links',
            label: 'Go to',
            items: allItems.filter(item => item.to && !item.children)
        }, {
            id: 'code',
            label: 'Code',
            items: [{
                id: 'source',
                label: 'View page source',
                icon: 'i-simple-icons-github',
                to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
                target: '_blank'
            }]
        }]
    })

    // Método para actualizar badges dinámicamente
    const updateBadge = (itemId: string, badge: string | number) => {
        const updateItem = (items: MenuItem[]) => {
            for (const item of items) {
                if (item.id === itemId) {
                    item.badge = String(badge)
                    return true
                }
                if (item.children && updateItem(item.children as MenuItem[])) {
                    return true
                }
            }
            return false
        }

        updateItem(mainMenuItems.value)
    }

    return {
        mainMenuItems: computed(() => filterByPermissions(mainMenuItems.value)),
        secondaryMenuItems: computed(() => filterByPermissions(secondaryMenuItems.value)),
        searchGroups,
        updateBadge
    }
}