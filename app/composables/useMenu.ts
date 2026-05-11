// composables/useMenu.ts
import type { NavigationMenuItem } from '@nuxt/ui'

export interface MenuItem extends NavigationMenuItem {
    id?: string
    roles?: ('admin' | 'student' | 'visitor')[]
    requiresLabAccess?: boolean
    requiresSession?: boolean
    permissions?: string[]
}

export const useMenu = () => {
    const route = useRoute()
    const { isLogged, user } = useAuth()
    const lab = useLabStore()


    // ✅ Debug para ver el estado
    watch(() => lab.hasAccess, (newVal) => {
        console.log('🔍 Menu - lab.hasAccess changed:', newVal)
    })


    // Definición CENTRALIZADA de TODOS los menús
    const allMenuItems = computed<MenuItem[]>(() => {
        const baseItems: MenuItem[] = [
            // === ITEMS PÚBLICOS (visitors) ===
            {
                id: 'home',
                label: 'Inicio',
                to: '/',
                icon: 'i-lucide-home',
                roles: ['visitor', 'student', 'admin']
            },

            {
                id: 'docs',
                label: 'Documentación',
                to: '/docs',
                icon: 'i-lucide-book-open',
                roles: ['visitor', 'student', 'admin']
            },

            // === ITEMS DE ESTUDIANTES ===
            {
                id: 'student-profile',
                label: 'Mi Perfil',
                to: '/dashboard/student/profile',
                icon: 'i-lucide-user',
                roles: ['student'],
                onSelect: () => closeMenu()
            },
            {
                id: 'admin-dashboard',
                label: 'Dashboard',
                to: '/dashboard',
                icon: 'i-lucide-layout-dashboard',
                roles: ['admin'],
                onSelect: () => closeMenu()
            },
            {
                id: 'student-queue',
                label: 'Cola',
                to: '/dashboard/student/queue',
                icon: 'i-lucide-clipboard-clock',
                roles: ['student', 'admin'],
                onSelect: () => closeMenu()
            },

            // === ITEMS DE LABORATORIO (requieren acceso) ===
            {
                id: 'lab-schematic',
                label: 'Esquemático',
                to: '/dashboard/laboratory/schematic',
                icon: 'i-lucide-caravan',
                roles: ['student', 'admin'],

                onSelect: () => closeMenu()
            },
            {
                id: 'lab-jetson',
                label: 'Laboratorio',
                to: '/dashboard/laboratory/ios-jetson-nano',
                icon: 'i-lucide-laptop',
                roles: ['student', 'admin'],
                requiresLabAccess: true,
                onSelect: () => closeMenu()
            },
            {
                id: 'lab-camera',
                label: 'Cámara',
                to: '/dashboard/laboratory/camera',
                icon: 'i-lucide-video',
                roles: ['student', 'admin'],
                requiresLabAccess: true,
                onSelect: () => closeMenu()
            },
            {
                id: 'lab-arduino',
                label: 'Esquem. Arduino',
                to: '/dashboard/laboratory/arduino-r3',
                icon: 'i-lucide-circuit-board',
                roles: ['student', 'admin'],

                onSelect: () => closeMenu()
            },
            {
                id: 'lab-esp32',
                label: 'Esquem. Esp32',
                to: '/dashboard/laboratory/esp32',
                icon: 'i-lucide-circuit-board',
                roles: ['student', 'admin'],

                onSelect: () => closeMenu()
            },

            // === ITEMS DE ADMINISTRADOR ===

            {
                id: 'admin-users',
                label: 'Usuarios',
                to: '/dashboard/users',
                icon: 'i-lucide-users',
                roles: ['admin'],
                onSelect: () => closeMenu()
            },
            {
                id: 'admin-sesions',
                label: 'Sesiones',
                to: '/dashboard/session',
                icon: 'i-lucide-clock',
                roles: ['admin'],
                onSelect: () => closeMenu()
            },
            {
                id: 'admin-metrics',
                label: 'Métricas Globales',
                to: '/dashboard/metrics',
                icon: 'i-lucide-chart-bar',
                roles: ['admin'],
                onSelect: () => closeMenu()
            },
            {
                id: 'admin-reports',
                label: 'Reportes',
                to: '/dashboard/reports',
                icon: 'i-lucide-file-text',
                roles: ['admin'],
                onSelect: () => closeMenu()
            }, {
                id: 'admin-configuration',
                label: 'Configuración',
                to: '/dashboard/laboratory/configuration',
                icon: 'i-lucide-settings',
                roles: ['admin'],
                onSelect: () => closeMenu()
            },

            // === ITEMS SECUNDARIOS (footer) ===
            {
                id: 'feedback',
                label: 'Feedback',
                icon: 'i-lucide-message-circle',
                to: '#',
                target: '_blank',
                roles: ['student', 'admin']
            },
            {
                id: 'help',
                label: 'Ayuda',
                icon: 'i-lucide-info',
                to: '/dashboard/help',
                roles: ['student', 'admin']
            }
        ]

        return baseItems
    })

    // Filtrar items según rol y acceso
    // Filtrar items según rol y acceso
    const filteredMenuItems = computed<MenuItem[]>(() => {
        if (!isLogged.value) {
            return allMenuItems.value.filter(item =>
                item.roles?.includes('visitor')
            )
        }

        const userRole = user.value?.role as 'admin' | 'student'

        const filtered = allMenuItems.value.filter(item => {
            // Verificar rol
            if (item.roles && !item.roles.includes(userRole)) {
                return false
            }

            // ✅ Verificar acceso a laboratorio correctamente
            if (item.requiresLabAccess && !lab.hasAccess) {
                console.log(`🔍 Menu item ${item.id} filtered out - requiresLabAccess: ${item.requiresLabAccess}, hasAccess: ${lab.hasAccess}`)
                return false
            }

            return true
        })

        console.log('🔍 Filtered menu items:', filtered.map(i => ({ id: i.id, label: i.label })))
        return filtered
    })
    // Separar en menú principal y footer
    const menuStructure = computed(() => {
        const mainItems: MenuItem[] = []
        const footerItems: MenuItem[] = []

        // Items que van al footer
        const footerIds = ['feedback', 'help', 'docs']

        filteredMenuItems.value.forEach(item => {
            if (footerIds.includes(item.id || '')) {
                footerItems.push(item)
            } else {
                mainItems.push(item)
            }
        })

        return { mainItems, footerItems }
    })

    // Agrupar por categorías para el buscador
    const searchGroups = computed(() => {
        const groups = []

        // Grupo de navegación principal
        if (menuStructure.value.mainItems.length > 0) {
            groups.push({
                id: 'main-nav',
                label: 'Navegación Principal',
                items: menuStructure.value.mainItems.map(item => ({
                    id: item.id,
                    label: item.label,
                    icon: item.icon,
                    to: item.to,
                    onSelect: item.onSelect
                }))
            })
        }

        // Grupo de recursos
        if (menuStructure.value.footerItems.length > 0) {
            groups.push({
                id: 'resources',
                label: 'Recursos y Ayuda',
                items: menuStructure.value.footerItems.map(item => ({
                    id: item.id,
                    label: item.label,
                    icon: item.icon,
                    to: item.to,
                    target: item.target
                }))
            })
        }

        // Grupo de usuario (si está logueado)
        if (isLogged.value) {
            groups.push({
                id: 'account',
                label: 'Mi Cuenta',
                items: [
                    {
                        id: 'profile',
                        label: 'Mi Perfil',
                        icon: 'i-lucide-user',
                        to: user.value?.role === 'admin' ? '/dashboard/profile' : '/dashboard/student/profile'
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

    // Método para cerrar menú
    const closeMenu = () => {
        const sidebarOpen = useState('sidebar-open')
        sidebarOpen.value = false
    }

    // Método para actualizar badges
    const updateBadge = (itemId: string, badge: string | number) => {
        const item = allMenuItems.value.find(i => i.id === itemId)
        if (item) {
            item.badge = String(badge)
        }
    }

    // Computed helpers
    const isStudent = computed(() => user.value?.role === 'student')
    const isAdmin = computed(() => user.value?.role === 'admin')
    const hasLabAccess = computed(() => lab.hasAccess)

    return {
        // Menús estructurados
        mainMenuItems: computed(() => menuStructure.value.mainItems),
        footerMenuItems: computed(() => menuStructure.value.footerItems),
        searchGroups,

        // Helpers
        isStudent,
        isAdmin,
        hasLabAccess,

        // Métodos útiles
        updateBadge,
        closeMenu,

        // Items crudos (si se necesitan)
        allItems: filteredMenuItems
    }
}