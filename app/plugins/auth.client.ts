// plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
    const { initAuth } = useAuth()

    // Esperar a que se inicialice la autenticación
    await initAuth()

    // También puedes verificar rutas protegidas aquí
    const router = useRouter()
    const { isLogged, user } = useAuth()

    // Middleware de protección global
    router.beforeEach((to) => {
        const publicRoutes = ['/login', '/register', '/', '/about', '/help', '/terms', '/privacy', '/contact', '/faq', '/support', '/docs']

        if (!isLogged.value && !publicRoutes.includes(to.path)) {
            return '/login'
        }

        if (to.path === '/login' && isLogged.value) {
            return user.value?.role === 'admin' ? '/admin' : '/student'
        }
    })
})