// composables/useMenu.ts
export const useMenu = () => {
    const { isLogged, user } = useAuth()
    const lab = useLabStore()

    // Menú público
    const visitorMenu = [
        { label: "Inicio", to: "/", icon: "i-lucide-home" },
        { label: "Nosotros", to: "/about", icon: "i-lucide-users" },
        { label: "Documentación", to: "/docs", icon: "i-lucide-book-open" },
    ]

    // Menú completo de estudiantes (todos los elementos, sin filtros)

    const studentMenu = [
        { label: "Esquemático", to: "/laboratory/schematic", icon: "i-lucide-file-text", disabled: false },
        { label: "Mi Perfil", to: "/student/profile", icon: "i-lucide-user", disabled: false },
        { label: "Jetson Nano", to: "/laboratory/ios-jetson-nano", icon: "i-lucide-microchip", disabled: !lab.hasAccess },
        { label: "Cámara", to: "/laboratory/camera", icon: "i-lucide-camera", disabled: false },
        { label: "Cola", to: "/student/queue", icon: "i-lucide-clock", disabled: false },
        { label: "Esquem. Arduino", to: "/laboratory/arduino-r3", icon: "i-lucide-microchip", disabled: false },
        { label: "Esquem. Esp32", to: "/laboratory/esp32", icon: "i-lucide-microchip", disabled: false },
    ]
    // Menú de administradores
    const adminMenu = [
        { label: "Dashboard", to: "/dashboard", icon: "i-lucide-layout-dashboard" },
        { label: "Usuarios", to: "/dashboard/users", icon: "i-lucide-users" },
        { label: "Métricas Globales", to: "/dashboard/metrics", icon: "i-lucide-chart-bar" },
        { label: "Laboratorios", to: "/dashboard/labs", icon: "i-lucide-flask-conical" },
        { label: "Cola Global", to: "/dashboard/queue", icon: "i-lucide-clock" },
        { label: "Reportes", to: "/dashboard/reports", icon: "i-lucide-file-text" },
        
    ]

    // Filtrar elementos que requieren sesión activa
    const filteredStudentMenu = computed(() => {
        return studentMenu.filter(item => {
            // Si no requiere sesión, siempre se muestra
            if (!item.requiresSession) return true
            // Si requiere sesión, solo se muestra si tiene acceso al laboratorio
            return lab.hasAccess
        })
    })

    // Menú completo (con filtro dinámico)
    const fullMenu = computed(() => {
        const menu = [...filteredStudentMenu.value]
        return menu
    })

    // Menú principal según rol
    const menuItems = computed(() => {
        if (!isLogged.value) return visitorMenu
        if (user.value?.role === 'admin') return adminMenu
        if (user.value?.role === 'student') return fullMenu.value
        return visitorMenu
    })

    return {
        menuItems,
        isStudent: computed(() => user.value?.role === 'student'),
        isAdmin: computed(() => user.value?.role === 'admin'),
        hasLabAccess: computed(() => lab.hasAccess)
    }
}