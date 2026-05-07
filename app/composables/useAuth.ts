// composables/useAuth.ts
export const useAuth = () => {
    const user = useState<any>("user", () => null)
    const isLoading = useState<boolean>("auth-loading", () => true)

    const isLogged = computed(() => !!user.value)

    const initAuth = () => {
        if (process.client) {
            const stored = localStorage.getItem("user")
            if (stored) {
                user.value = JSON.parse(stored)
            }
            isLoading.value = false
        }
    }

    const logout = async () => {
        user.value = null
        if (process.client) {
            localStorage.removeItem("user")
            localStorage.removeItem("token")
        }
        await navigateTo("/login")
    }

    const hasRole = (roles: string[]) => {
        return user.value && roles.includes(user.value.role)
    }

    // ✅ Esto es lo importante - Inicializa automáticamente
    if (process.client) {
        initAuth()
    }

    return { user, isLogged, isLoading, initAuth, logout, hasRole }
}