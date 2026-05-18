export const useLabSessionGuard = () => {
    const lab = useLabStore()
    const toast = useToast()
    const router = useRouter()

    const labRoutes = [
        '/dashboard/laboratory/camera',
        '/dashboard/laboratory/ios-jetson-nano',
        '/dashboard/laboratory/schematic'
    ]

    const isOnLabRoute = (path: string) => {
        return labRoutes.some(route => path.startsWith(route))
    }

    const handleAccessLost = () => {
        const currentPath = window.location.pathname
        if (isOnLabRoute(currentPath)) {
            toast.add({
                title: 'Sesión finalizada',
                description: 'Tu tiempo de laboratorio ha terminado',
                color: 'warning'
            })
            router.push('/dashboard/laboratory/session-status')
        }
    }

    const watchLabAccess = () => {
        watch(() => lab.hasAccess, (hasAccess, oldHasAccess) => {
            if (oldHasAccess === true && hasAccess === false) {
                handleAccessLost()
            }
        })
    }

    const initLab = () => {
        const { isLogged } = useAuth()
        if (isLogged.value) {
            lab.init()
        }
    }

    return {
        watchLabAccess,
        initLab,
        stopLab: () => lab.stop()
    }
}