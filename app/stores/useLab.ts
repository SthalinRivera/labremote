import { defineStore } from 'pinia'

interface Queue {
    position: number
}

interface Session {
    remaining: number
}

// stores/lab.ts (corrección)
export const useLabStore = defineStore('lab', () => {
    const config = useRuntimeConfig()

    const queue = ref<Queue | null>(null)
    const session = ref<Session | null>(null)
    const timeLeft = ref<number | null>(null)
    const loading = ref(false)

    let poll: ReturnType<typeof setInterval> | null = null
    let timer: ReturnType<typeof setInterval> | null = null

    const api = () => {
        if (process.client) {
            const token = localStorage.getItem("token")
            return $fetch.create({
                baseURL: config.public.apiUrl,
                headers: { Authorization: `Bearer ${token}` }
            })
        }
        return $fetch
    }

    const load = async () => {
        try {
            const a = api()
            const [q, s] = await Promise.all([
                a("/api/queue/status").catch(() => null),
                a("/api/session/current").catch(() => null)
            ])

            queue.value = q as Queue | null
            session.value = s as Session | null

            // ✅ Log para debugging
            console.log('🔍 LabStore load:', {
                session: session.value,
                hasAccess: !!session?.value
            })

            if (session.value?.remaining !== undefined && session.value?.remaining > 0) {
                if (timeLeft.value !== session.value.remaining) {
                    startTimer(session.value.remaining)
                }
            } else {
                stopTimer()
            }
        } catch (e) {
            console.error("❌ load error", e)
        }
    }

    const startTimer = (sec: number) => {
        if (timer) clearInterval(timer)
        timeLeft.value = sec
        timer = setInterval(() => {
            if (timeLeft.value === null) return
            timeLeft.value--
            if (timeLeft.value <= 0) {
                stopTimer()
                if (process.client) {
                    const toast = useToast()
                    toast.add({
                        title: '⏰ Sesión finalizada',
                        description: 'Tu tiempo de laboratorio ha terminado.',
                        color: 'warning'
                    })
                    navigateTo('/dashboard/laboratory/session-status')
                }
                load()
            }
        }, 1000)
    }

    const stopTimer = () => {
        if (timer) clearInterval(timer)
        timer = null
        timeLeft.value = null
    }

    const join = async () => {
        if (queue.value || session.value) return
        loading.value = true
        try {
            await api()("/api/queue/join", { method: "POST" })
            await load()
        } catch (e) {
            console.error("❌ join error", e)
        } finally {
            loading.value = false
        }
    }

    const end = async () => {
        try {
            await api()("/api/session/end", { method: "POST" })
            await load()
        } catch (e) {
            console.error("❌ end error", e)
        }
    }

    const init = () => {
        if (poll) return
        load()
        poll = setInterval(load, 5000) // Aumentado a 5 segundos para menos carga
    }

    const stop = () => {
        if (poll) clearInterval(poll)
        if (timer) clearInterval(timer)
        poll = null
        timer = null
    }

    // ✅ hasAccess correctamente definido
    const hasAccess = computed(() => {
        const hasActiveSession = !!session.value && (session.value?.remaining ?? 0) > 0
        console.log('🔍 hasAccess computed:', hasActiveSession, session.value)
        return hasActiveSession
    })

    return {
        queue,
        session,
        timeLeft,
        loading,
        hasAccess,
        init,
        stop,
        join,
        load,
        end
    }
})