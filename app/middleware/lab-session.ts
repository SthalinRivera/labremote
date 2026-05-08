// middleware/lab-session.ts
export default defineNuxtRouteMiddleware(async (to) => {
    const { isLogged } = useAuth()
    const lab = useLabStore()

    if (!isLogged) {
        return navigateTo('/login')
    }

    // Solo Cámara y Jetson Nano requieren sesión activa
    const requiresLabSession = [
        '/dashboard/laboratory/camera',
        '/dashboard/laboratory/ios-jetson-nano'
    ].includes(to.path)

    if (requiresLabSession && lab.session === null) {
        await lab.load()
    }

    if (requiresLabSession && !lab.hasAccess) {
        return navigateTo('/dashboard/student/queue')
    }
})