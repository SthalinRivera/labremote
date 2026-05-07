// middleware/student.ts
export default defineNuxtRouteMiddleware((to) => {
    const { user, isLogged } = useAuth()

    if (!isLogged.value) {
        return navigateTo('/login')
    }

    // Verificar que el rol sea 'student'
    if (user.value?.role !== 'student') {
        // Si no es student, redirigir a admin
        if (user.value?.role === 'admin') {
            return navigateTo('/dashboard')
        }
        return navigateTo('/')
    }
})