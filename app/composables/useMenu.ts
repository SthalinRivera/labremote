import type { NavigationMenuItem } from '@nuxt/ui'

export interface MenuItem extends NavigationMenuItem {
    id?: string
    roles?: ('admin' | 'student' | 'visitor')[]
    requiresLabAccess?: boolean
}

// ----------------------------------------------
// 1. Ítems del FOOTER (abajo del sidebar)
// ----------------------------------------------
const FOOTER_ITEMS: MenuItem[] = [
    { id: 'feedback', label: 'Feedback y soporte', icon: 'i-lucide-life-buoy', to: '/dashboard/feedback-support', roles: ['visitor', 'student', 'admin'] },
    { id: 'faq', label: 'Preguntas Frecuentes', icon: 'i-lucide-help-circle', to: '/dashboard/faq', roles: ['visitor', 'student', 'admin'] },
    { id: 'docs', label: 'Documentación', icon: 'i-lucide-book-open', to: '/docs', roles: ['visitor', 'student', 'admin'] }
]

// ----------------------------------------------
// 2. Menú PRINCIPAL (estructura plana + grupos)
// ----------------------------------------------
const MAIN_MENU_STRUCTURE: MenuItem[] = [
    // === Ítems directos (sin acordeón) ===
    {
        id: 'home',
        label: 'Inicio',
        icon: 'i-lucide-home',
        to: '/',
        roles: ['visitor', 'student', 'admin']
    },
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'i-lucide-layout-dashboard',
        to: '/dashboard',
        roles: ['admin']  // solo admin
    },
    // Para estudiantes: perfil y cola como directos
    {
        id: 'student-profile',
        label: 'Mi Perfil',
        icon: 'i-lucide-user',
        to: '/dashboard/student/profile',
        roles: ['student']
    },
    {
        id: 'student-queue',
        label: 'Cola',
        icon: 'i-lucide-clipboard-clock',
        to: '/dashboard/student/queue',
        roles: ['student']
    },

    // === Grupo LABORATORIO (colapsable, requiere acceso) ===
    {
        id: 'laboratory',
        label: 'Laboratorio',
        roles: ['student'],
        icon: 'i-lucide-flask-conical',
        requiresLabAccess: true,
        children: [
            { id: 'lab-jetson', label: 'Jetson Nano', to: '/dashboard/laboratory/ios-jetson-nano', icon: 'i-lucide-laptop', roles: ['student', 'admin'] },
            { id: 'lab-camera', label: 'Cámara', to: '/dashboard/laboratory/camera', icon: 'i-lucide-video', roles: ['student', 'admin'] },
        ]
    },
    {
        id: 'laboratory',
        label: 'Laboratorio',
        roles: ['admin'],
        icon: 'i-lucide-flask-conical',

        children: [
            { id: 'lab-jetson', label: 'Jetson Nano', to: '/dashboard/laboratory/ios-jetson-nano', icon: 'i-lucide-laptop', roles: ['admin'] },
            { id: 'lab-camera', label: 'Cámara', to: '/dashboard/laboratory/camera', icon: 'i-lucide-video', roles: ['admin'] },
        ]
    },
    {
        id: 'recursos',
        label: 'Recursos',
        roles: ['student', 'admin'],
        icon: 'i-lucide-flask-conical',
        children: [
            { id: 'lab-schematic', label: 'Esquemático', to: '/dashboard/laboratory/schematic', icon: 'i-lucide-caravan', roles: ['student', 'admin'] },
            { id: 'lab-arduino', label: 'Arduino R3', to: '/dashboard/laboratory/arduino-r3', icon: 'i-lucide-circuit-board', roles: ['student', 'admin'] },
            { id: 'lab-esp32', label: 'ESP32', to: '/dashboard/laboratory/esp32', icon: 'i-lucide-circuit-board', roles: ['student', 'admin'] }
        ]
    },


    // === Grupo MÉTRICAS (solo admin, colapsable) ===
    {
        id: 'metrics',
        label: 'Métricas',
        icon: 'i-lucide-chart-line',
        roles: ['admin'],
        children: [
            { id: 'admin-general-metrics', label: 'General', to: '/dashboard/general-metrics', icon: 'i-lucide-chart-bar' },
            { id: 'admin-ai-metrics', label: 'IA', to: '/dashboard/ai-metrics', icon: 'i-lucide-chart-line' },
            { id: 'admin-video-metrics', label: 'Video', to: '/dashboard/video-metrics', icon: 'i-lucide-chart-line' },
            { id: 'admin-system-metrics', label: 'Sistema', to: '/dashboard/system-metrics', icon: 'i-lucide-chart-line' }
        ]
    },

    // === Grupo MÉTRICAS (solo admin, colapsable) ===
    {
        id: 'reports',
        label: 'Reportes',
        icon: 'i-lucide-file-text',
        roles: ['admin'],
        children: [
            { id: 'admin-reports-general', label: 'General', to: '/dashboard/reports', icon: 'i-lucide-chart-bar' },
            { id: 'admin-reports-sessions', label: 'Sesiones', to: '/dashboard/session', icon: 'i-lucide-timer' },
        ]
    },



    {
        id: 'configuration',
        label: 'Configuración',
        icon: 'i-lucide-settings',
        to: '/dashboard/laboratory/configuration',
        roles: ['admin']
    }
]

export const useMenu = () => {
    const { isLogged, user } = useAuth()
    const lab = useLabStore()
    const sidebarOpen = useState('sidebar-open')

    // Filtrado recursivo
    const filterMenuItem = (item: MenuItem): MenuItem | null => {
        if (!isLogged.value) {
            if (item.roles && !item.roles.includes('visitor')) return null
        } else {
            const userRole = user.value?.role as 'admin' | 'student'
            if (item.roles && !item.roles.includes(userRole)) return null
        }

        if (item.requiresLabAccess && !lab.hasAccess) return null

        if (item.children && item.children.length) {
            const filteredChildren = item.children
                .map(child => filterMenuItem(child))
                .filter((c): c is MenuItem => c !== null)
            if (filteredChildren.length === 0) return null
            return { ...item, children: filteredChildren }
        }
        return { ...item }
    }

    // Menú principal filtrado
    const mainMenuItems = computed<MenuItem[]>(() => {
        const filtered = MAIN_MENU_STRUCTURE
            .map(item => filterMenuItem(item))
            .filter((item): item is MenuItem => item !== null)

        // Añadir onSelect para cerrar sidebar
        const addOnSelect = (items: MenuItem[]): MenuItem[] =>
            items.map(item => ({
                ...item,
                onSelect: () => closeMenu(),
                children: item.children ? addOnSelect(item.children) : undefined
            }))

        return addOnSelect(filtered)
    })

    // Footer filtrado
    const footerMenuItems = computed<MenuItem[]>(() => {
        let filtered = FOOTER_ITEMS
        if (!isLogged.value) {
            filtered = filtered.filter(item => item.roles?.includes('visitor'))
        } else {
            const userRole = user.value?.role as 'admin' | 'student'
            filtered = filtered.filter(item => !item.roles || item.roles.includes(userRole))
        }
        return filtered.map(item => ({ ...item, onSelect: () => closeMenu() }))
    })

    // Buscador (main + footer)
    const searchGroups = computed(() => {
        const groups = []

        const flattenGroup = (parentLabel: string, items: MenuItem[]): any[] => {
            const result: any[] = []
            for (const item of items) {
                if (item.children) {
                    result.push(...flattenGroup(item.label, item.children))
                } else {
                    result.push({
                        id: item.id,
                        label: item.label,
                        icon: item.icon,
                        to: item.to,
                        group: parentLabel,
                        onSelect: () => closeMenu()
                    })
                }
            }
            return result
        }

        // Agrupar por el primer nivel (índice)
        for (const item of mainMenuItems.value) {
            const groupName = item.children ? item.label : 'General'
            const flat = item.children ? flattenGroup(item.label, item.children) : [{
                id: item.id,
                label: item.label,
                icon: item.icon,
                to: item.to,
                group: groupName,
                onSelect: () => closeMenu()
            }]
            groups.push({ id: item.id, label: groupName, items: flat })
        }

        // Footer como grupo aparte
        if (footerMenuItems.value.length) {
            groups.push({
                id: 'footer',
                label: 'Recursos',
                items: footerMenuItems.value.map(item => ({
                    id: item.id,
                    label: item.label,
                    icon: item.icon,
                    to: item.to,
                    target: item.target,
                    onSelect: () => closeMenu()
                }))
            })
        }

        // Cuenta de usuario
        if (isLogged.value) {
            groups.push({
                id: 'account',
                label: 'Mi Cuenta',
                items: [
                    {
                        id: 'profile',
                        label: 'Mi Perfil',
                        icon: 'i-lucide-user',
                        to: user.value?.role === 'admin' ? '/dashboard/profile' : '/dashboard/student/profile',
                        onSelect: () => closeMenu()
                    },
                    {
                        id: 'logout',
                        label: 'Cerrar Sesión',
                        icon: 'i-lucide-log-out',
                        onSelect: () => {
                            const { logout } = useAuth()
                            logout()
                            closeMenu()
                        }
                    }
                ]
            })
        }

        return groups
    })

    const closeMenu = () => { sidebarOpen.value = false }

    // Helper para badges (opcional)
    const updateBadge = (itemId: string, badge: string | number) => {
        const findAndSet = (items: MenuItem[]): boolean => {
            for (const item of items) {
                if (item.id === itemId) { item.badge = String(badge); return true }
                if (item.children && findAndSet(item.children)) return true
            }
            return false
        }
        findAndSet(MAIN_MENU_STRUCTURE)
        findAndSet(FOOTER_ITEMS)
    }

    const isStudent = computed(() => user.value?.role === 'student')
    const isAdmin = computed(() => user.value?.role === 'admin')
    const hasLabAccess = computed(() => lab.hasAccess)

    return {
        mainMenuItems,
        footerMenuItems,
        searchGroups,
        isStudent,
        isAdmin,
        hasLabAccess,
        updateBadge,
        closeMenu
    }
}