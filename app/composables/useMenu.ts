// composables/useMenu.ts
export const useMenu = () => {
    const { isLogged, user } = useAuth()

    // Menú público
    const visitorMenu = [
        { label: "Inicio", to: "/", icon: "i-lucide-home" },
        { label: "Nosotros", to: "/about", icon: "i-lucide-users" },
        { label: "Documentación", to: "/docs", icon: "i-lucide-book-open" },
    ]

    // Menú de estudiantes
    const studentMenu = [

        { label: "Esquemático", to: "/laboratory/schematic", icon: "i-lucide-file-text" },
        { label: "Mi Perfil", to: "/student/profile", icon: "i-lucide-user" },
        { label: "Jetson Nano", to: "/laboratory/ios-jetson-nano", icon: "i-lucide-microchip" },
        { label: "Cámara", to: "/laboratory/camera", icon: "i-lucide-camera" },
        { label: "Cola", to: "/student/queue", icon: "i-lucide-clock" },
        { label: "Esquem. Arduino", to: "/laboratory/arduino-r3", icon: "i-lucide-microchip" },
        { label: "Esquem. Esp32", to: "/laboratory/esp32", icon: "i-lucide-microchip" },


    ]

    // Submenú de laboratorio (solo cuando hay sesión activa)
    const labSubmenu = [
        { label: "Esquemático", to: "/laboratory/schematic", icon: "i-lucide-file-text" },
        { label: "Jetson Nano", to: "/laboratory/ios-jetson-nano", icon: "i-lucide-microchip" },
        { label: "Cámara", to: "/laboratory/camera", icon: "i-lucide-camera" },
        { label: "Cola", to: "/laboratory/queue", icon: "i-lucide-clock" },
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

    // Menú principal basado en rol
    const mainMenu = computed(() => {
        if (!isLogged.value) return visitorMenu
        if (user.value?.role === 'admin') return adminMenu
        if (user.value?.role === 'student') return studentMenu
        return visitorMenu
    })

    // Menú completo (incluyendo submenús dinámicos)
    const fullMenu = computed(() => {
        const menu = [...mainMenu.value]

        // Agregar submenú de laboratorio si hay sesión activa
        const lab = useLabStore()
        if (lab.hasAccess && user.value?.role === 'student') {
            menu.push({ label: "Laboratorio Activo", to: null, isDivider: true })
            menu.push(...labSubmenu)
        }

        return menu
    })

    return {
        menuItems: mainMenu,
        fullMenu,
        labSubmenu,
        isStudent: computed(() => user.value?.role === 'student'),
        isAdmin: computed(() => user.value?.role === 'admin')
    }
}