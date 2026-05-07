// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
    const { isLogged, isLoading } = useAuth()

    // ✅ Esperar a que termine de cargar
    if (isLoading.value) return

    const publicRoutes = ['/login']

    if (!isLogged.value && !publicRoutes.includes(to.path)) {
        return navigateTo('/login')
    }
})