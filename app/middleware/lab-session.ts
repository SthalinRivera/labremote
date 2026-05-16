// middleware/lab-session.ts
export default defineNuxtRouteMiddleware(async (to) => {
    const { isLogged, user } = useAuth()
    const lab = useLabStore()

    // 🔒 Si no está logueado
    if (!isLogged) {
        return navigateTo('/login')
    }

    // ✅ Verificar si es admin
    const isAdmin = user?.value?.role === 'admin'
    console.log("Usuario: ", user.value?.role)

    // Solo estas rutas requieren sesión de laboratorio
    const requiresLabSession = [
        '/dashboard/laboratory/camera',
        '/dashboard/laboratory/ios-jetson-nano'
    ].includes(to.path)

    // 🔥 Si es admin, dejar pasar directamente
    if (isAdmin) {
        return
    }

    // 🔄 Cargar sesión si aún no existe
    if (requiresLabSession && lab.session === null) {
        await lab.load()
    }

    // ❌ Si no tiene acceso
    if (requiresLabSession && !lab.hasAccess) {
        return navigateTo('/dashboard/student/queue')
    }
})