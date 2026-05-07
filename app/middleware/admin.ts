// middleware/admin.ts
export default defineNuxtRouteMiddleware((to) => {
    const { user, isLogged } = useAuth()

    if (!isLogged.value) {
        return navigateTo('/login')
    }

    // Verificar que el rol sea 'admin'
    if (user.value?.role !== 'admin') {
        // Si no es admin, redirigir según su rol
        if (user.value?.role === 'student') {
            return navigateTo('/student')
        }
        return navigateTo('/')
    }
})