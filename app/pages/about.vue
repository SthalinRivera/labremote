<script setup lang="ts">
const toast = useToast()

const formData = reactive({
    name: '',
    email: '',
    message: ''
})

const isSubmitting = ref(false)

const onSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
        toast.add({
            title: 'Campos incompletos',
            description: 'Por favor completa todos los campos',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
        return
    }

    isSubmitting.value = true

    // Simular envío (aquí conectarías con tu backend)
    setTimeout(() => {
        toast.add({
            title: 'Mensaje enviado',
            description: 'Gracias por contactarnos. Te responderemos pronto.',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })
        formData.name = ''
        formData.email = ''
        formData.message = ''
        isSubmitting.value = false
    }, 1500)
}

// Información de contacto
const contactInfo = [
    { icon: 'i-lucide-mail', label: 'Email', value: 'soporte@labremote.com', href: 'mailto:soporte@labremote.com' },
    { icon: 'i-lucide-phone', label: 'Teléfono', value: '+51 123 456 789', href: 'tel:+51123456789' },
    { icon: 'i-lucide-map-pin', label: 'Ubicación', value: 'Universidad Nacional de Cañete, Perú', href: null },
    { icon: 'i-lucide-clock', label: 'Horario', value: 'Lun - Vie, 8:00 - 18:00', href: null },
]

// Redes sociales
const socialLinks = [
    { icon: 'i-lucide-github', label: 'GitHub', href: 'https://github.com' },
    { icon: 'i-lucide-linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
    { icon: 'i-lucide-twitter', label: 'Twitter', href: 'https://twitter.com' },
    { icon: 'i-lucide-mail', label: 'Email', href: 'mailto:soporte@labremote.com' },
]
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-12">
                <UBadge color="primary" variant="soft" class="mb-4">
                    Plataforma Educativa
                </UBadge>
                <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Sobre Nosotros
                </h1>
                <p class="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
                    Laboratorio Remoto IoT para prácticas académicas en tiempo real
                </p>
            </div>

            <!-- Grid principal: Imagen + Info -->
            <div class="grid lg:grid-cols-2 gap-8 mb-12">
                <!-- Imagen (lado izquierdo) -->
                <UCard class="overflow-hidden p-0">
                    <div class="relative h-80 lg:h-full min-h-[400px]">
                        <img 
                            src="/iot.jpg" 
                            alt="Laboratorio Remoto IoT"
                            class="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <div class="text-white">
                                <p class="text-sm font-mono">Laboratorio IoT + IA</p>
                                <p class="text-xs opacity-80">Hardware real accesible desde cualquier lugar</p>
                            </div>
                        </div>
                    </div>
                </UCard>

                <!-- Información de la plataforma -->
                <UCard>
                    <template #header>
                        <h2 class="text-2xl font-bold flex items-center gap-2">
                            <UIcon name="i-lucide-rocket" class="w-6 h-6 text-primary-500" />
                            ¿Qué ofrecemos?
                        </h2>
                    </template>
                    
                    <div class="space-y-4">
                        <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                            Somos una plataforma enfocada en el acceso remoto a laboratorios IoT, permitiendo a estudiantes ejecutar prácticas en dispositivos reales como Raspberry Pi, Arduino, ESP32 y Jetson Nano sin necesidad de hardware físico local.
                        </p>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            <div class="flex items-center gap-2 text-sm">
                                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500" />
                                <span>Acceso remoto 24/7</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500" />
                                <span>Sistema de colas inteligente</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500" />
                                <span>Integración con dispositivos IoT</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500" />
                                <span>Entorno académico seguro</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500" />
                                <span>Video en tiempo real</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500" />
                                <span>Soporte para prácticas</span>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex gap-3">
                            <UButton to="/docs" color="primary" variant="solid" class="flex-1 justify-center">
                                Ver Documentación
                            </UButton>
                            <UButton to="/student/queue" color="neutral" variant="outline" class="flex-1 justify-center">
                                Comenzar ahora
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </div>

            <!-- Contacto y ubicación -->
            <div class="grid lg:grid-cols-3 gap-8 mb-12">
                <!-- Formulario de contacto -->
                <UCard class="lg:col-span-2">
                    <template #header>
                        <h2 class="text-xl font-semibold flex items-center gap-2">
                            <UIcon name="i-lucide-message-square" class="w-5 h-5" />
                            Envíanos un mensaje
                        </h2>
                        <p class="text-sm text-gray-500 mt-1">
                            ¿Necesitas soporte o acceso institucional? Escríbenos.
                        </p>
                    </template>

                    <UForm @submit="onSubmit" class="space-y-4">
                        <div class="grid sm:grid-cols-2 gap-4">
                            <UFormField label="Nombre" required>
                                <UInput 
                                    v-model="formData.name" 
                                    placeholder="Tu nombre completo"
                                    icon="i-lucide-user"
                                />
                            </UFormField>
                            <UFormField label="Email" required>
                                <UInput 
                                    v-model="formData.email" 
                                    type="email"
                                    placeholder="tu@email.com"
                                    icon="i-lucide-mail"
                                />
                            </UFormField>
                        </div>
                        <UFormField label="Mensaje" required>
                            <UTextarea 
                                v-model="formData.message" 
                                placeholder="Cuéntanos tu consulta..."
                                rows="4"
                            />
                        </UFormField>
                        <UButton 
                            type="submit" 
                            color="primary" 
                            :loading="isSubmitting"
                            icon="i-lucide-send"
                            class="w-full sm:w-auto"
                        >
                            Enviar mensaje
                        </UButton>
                    </UForm>
                </UCard>

                <!-- Información de contacto -->
                <UCard>
                    <template #header>
                        <h2 class="text-xl font-semibold flex items-center gap-2">
                            <UIcon name="i-lucide-phone-call" class="w-5 h-5" />
                            Contacto directo
                        </h2>
                    </template>
                    
                    <div class="space-y-4">
                        <div 
                            v-for="info in contactInfo" 
                            :key="info.label"
                            class="flex items-start gap-3"
                        >
                            <UIcon :name="info.icon" class="w-5 h-5 text-primary-500 mt-0.5" />
                            <div>
                                <p class="text-xs text-gray-500">{{ info.label }}</p>
                                <a 
                                    v-if="info.href" 
                                    :href="info.href" 
                                    class="text-sm hover:text-primary-600 transition"
                                >
                                    {{ info.value }}
                                </a>
                                <p v-else class="text-sm">{{ info.value }}</p>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex justify-around pt-2">
                            <a 
                                v-for="social in socialLinks" 
                                :key="social.label"
                                :href="social.href"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                :aria-label="social.label"
                            >
                                <UIcon :name="social.icon" class="w-5 h-5" />
                            </a>
                        </div>
                    </template>
                </UCard>
            </div>

            <!-- Footer con tecnologías -->
            <UCard class="text-center">
                <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                    <span class="flex items-center gap-1">
                        <UIcon name="i-lucide-cpu" class="w-4 h-4" />
                        Jetson Nano
                    </span>
                    <span class="flex items-center gap-1">
                        <UIcon name="i-lucide-microchip" class="w-4 h-4" />
                        Raspberry Pi
                    </span>
                    <span class="flex items-center gap-1">
                        <UIcon name="i-lucide-wifi" class="w-4 h-4" />
                        Arduino / ESP32
                    </span>
                </div>
                <p class="text-xs text-gray-400 mt-4">
                    Laboratorio Remoto IoT • Universidad Nacional de Cañete • Ingeniería de Sistemas
                </p>
                <p class="text-xs text-gray-400 mt-2">
                    © 2025 - Plataforma Educativa para prácticas en tiempo real
                </p>
            </UCard>
        </div>
    </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>