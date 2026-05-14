export const useCookieConsent = () => {
    const toast = useToast()
    const cookieConsent = useCookie('cookie-consent')
    const cookieNoticeShown = useCookie('cookie-notice-shown', {
        default: () => false,
        maxAge: 60 * 60 * 24 * 365
    })

    const showConsentBanner = () => {
        if (cookieConsent.value === 'accepted') return false
        if (cookieNoticeShown.value === true) return false
        return true
    }

    const askForConsent = () => {
        if (!showConsentBanner()) return

        toast.add({
            title: 'Usamos cookies para mejorar tu experiencia',
            duration: 0,
            close: false,
            actions: [
                {
                    label: 'Aceptar',
                    color: 'neutral',
                    variant: 'outline',
                    onClick: () => {
                        cookieConsent.value = 'accepted'
                        cookieNoticeShown.value = true
                    }
                },
                {
                    label: 'Rechazar',
                    color: 'neutral',
                    variant: 'ghost',
                    onClick: () => {
                        cookieNoticeShown.value = true
                    }
                }
            ]
        })
    }

    return { askForConsent }
}