// middleware/role.ts - Middleware genérico de roles
export default defineNuxtRouteMiddleware((to) => {
    const { user, isLogged } = useAuth()
    const allowedRoles = to.meta.roles as string[] | undefined

    if (!isLogged.value) return

    // Si la ruta requiere roles específicos
    if (allowedRoles && !allowedRoles.includes(user.value?.role)) {
        // Redirigir según su rol
        if (user.value?.role === 'admin') return navigateTo('/dashboard')
        if (user.value?.role === 'student') return navigateTo('/dashboard/student')
        return navigateTo('/dashboard')
    }
})