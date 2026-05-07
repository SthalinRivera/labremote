<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { isLogged } = useAuth()

const goToStart = () => navigateTo(isLogged.value ? '/student' : '/login')
const goToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
    <div class="text-gray-900 dark:text-gray-100 transition-colors">

        <!-- Hero Section -->
        <section class="min-h-[90vh] flex items-center justify-center overflow-hidden relative">
            <!-- Animated background (opcional) -->
           

            <div class="max-w-7xl mx-auto px-6 py-16 lg:py-24 z-10">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <!-- Texto -->
                    <div class="space-y-6 text-center lg:text-left">
                        <UBadge color="primary" variant="subtle" class="mx-auto lg:mx-0">
                            IoT + IA
                        </UBadge>
                        <h1 class="text-4xl md:text-6xl font-bold tracking-tight">
                            Laboratorio Remoto
                        </h1>
                        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0">
                            Accede a hardware real desde cualquier lugar. Controla dispositivos electrónicos,
                            ejecuta experimentos y visualiza resultados en tiempo real con nuestra plataforma educativa.
                        </p>
                        <div class="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <UButton size="xl" color="primary"
                                :label="isLogged ? 'Ir al laboratorio' : 'Comenzar ahora'" icon="i-lucide-rocket"
                                @click="goToStart" />
                            <UButton size="xl" variant="outline" label="Ver características"
                                icon="i-lucide-chevron-down" @click="goToFeatures" />
                        </div>
                        <!-- Stack tecnológico -->
                        <div class="pt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
                            <UBadge variant="soft" size="lg"
                                v-for="tech in ['Jetson Nano', 'Raspberry Pi', 'Arduino', 'ESP32', 'Sensores IoT']"
                                :key="tech">
                                {{ tech }}
                            </UBadge>
                        </div>
                    </div>
                    <!-- Imagen hero -->
                    <div class="relative flex justify-center">
                        <div
                            class="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 dark:opacity-30 animate-pulse" />
                        <img src="/images/hero.png" alt="Laboratorio remoto"
                            class="relative w-full max-w-md lg:max-w-lg drop-shadow-2xl" />
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section (cards) -->
        <section id="features" class="py-20 bg-gray-50 dark:bg-gray-900/50">
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto mb-16">
                    <UBadge variant="subtle" color="primary" class="mb-4">Características</UBadge>
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">
                        Todo lo que necesitas para tus prácticas
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400">
                        Nuestra plataforma integra hardware real con una interfaz web moderna y fácil de usar.
                    </p>
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <UCard class="text-center hover:-translate-y-1 transition-transform duration-300">
                        <template #header>
                            <div
                                class="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                <UIcon name="i-lucide-wifi" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </template>
                        <h3 class="text-xl font-semibold mb-2">Acceso Remoto 24/7</h3>
                        <p class="text-gray-500 dark:text-gray-400">
                            Controla dispositivos desde tu navegador sin necesidad de software adicional.
                        </p>
                    </UCard>

                    <UCard class="text-center hover:-translate-y-1 transition-transform duration-300">
                        <template #header>
                            <div
                                class="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                <UIcon name="i-lucide-video" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </template>
                        <h3 class="text-xl font-semibold mb-2">Video en Tiempo Real</h3>
                        <p class="text-gray-500 dark:text-gray-400">
                            Visualiza el hardware en acción con streaming de baja latencia.
                        </p>
                    </UCard>

                    <UCard class="text-center hover:-translate-y-1 transition-transform duration-300">
                        <template #header>
                            <div
                                class="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                <UIcon name="i-lucide-microchip" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </template>
                        <h3 class="text-xl font-semibold mb-2">IA en el Borde</h3>
                        <p class="text-gray-500 dark:text-gray-400">
                            Procesamiento con Jetson Nano para reconocimiento de objetos y control inteligente.
                        </p>
                    </UCard>
                </div>
            </div>
        </section>

        <!-- How it works -->
        <section class="py-20">
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto mb-16">
                    <UBadge variant="subtle" color="primary" class="mb-4">Fácil de usar</UBadge>
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">Cómo funciona</h2>
                    <p class="text-gray-600 dark:text-gray-400">
                        En tres simples pasos comienza a experimentar con hardware real.
                    </p>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div
                            class="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 mb-4">
                            1</div>
                        <h3 class="text-xl font-semibold mb-2">Regístrate</h3>
                        <p class="text-gray-500 dark:text-gray-400">Crea tu cuenta como estudiante o docente.</p>
                    </div>
                    <div class="text-center">
                        <div
                            class="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 mb-4">
                            2</div>
                        <h3 class="text-xl font-semibold mb-2">Reserva tiempo</h3>
                        <p class="text-gray-500 dark:text-gray-400">Selecciona un bloque horario en el sistema de colas.
                        </p>
                    </div>
                    <div class="text-center">
                        <div
                            class="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 mb-4">
                            3</div>
                        <h3 class="text-xl font-semibold mb-2">Experimenta</h3>
                        <p class="text-gray-500 dark:text-gray-400">Controla dispositivos y monitorea resultados en
                            vivo.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Technical features (grid with icons) -->
        <section class="py-20 bg-gray-50 dark:bg-gray-900/50">
            <div class="max-w-7xl mx-auto px-6">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <UBadge variant="subtle" color="primary" class="mb-4">Tecnología avanzada</UBadge>
                        <h2 class="text-3xl md:text-4xl font-bold mb-4">Hardware de última generación</h2>
                        <p class="text-gray-600 dark:text-gray-400 mb-6">
                            Nuestro laboratorio está equipado con plataformas de vanguardia para investigación y
                            educación.
                        </p>
                        <ul class="space-y-4">
                            <li class="flex gap-3 items-start">
                                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
                                <span><strong class="font-semibold">Jetson Nano</strong> – Procesamiento de IA en tiempo
                                    real.</span>
                            </li>
                            <li class="flex gap-3 items-start">
                                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
                                <span><strong class="font-semibold">Raspberry Pi 4</strong> – Computadora de propósito
                                    general.</span>
                            </li>
                            <li class="flex gap-3 items-start">
                                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
                                <span><strong class="font-semibold">Sensores IoT</strong> – Temperatura, humedad,
                                    movimiento,
                                    gas.</span>
                            </li>
                            <li class="flex gap-3 items-start">
                                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500 mt-0.5" />
                                <span><strong class="font-semibold">Arduino/ESP32</strong> – Control de actuadores y
                                    adquisición
                                    de datos.</span>
                            </li>
                        </ul>
                    </div>
                    <div class="relative">
                        <img src="/images/hardware.jpg" alt="Hardware del laboratorio" class="rounded-2xl shadow-xl" />
                    </div>
                </div>
            </div>
        </section>

        <!-- Call to Action -->
        <section class="py-20">
            <div class="max-w-5xl mx-auto px-6">
                <UCard
                    class="text-center bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-800 dark:to-cyan-800 border-0 shadow-xl">
                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
                        ¿Listo para empezar tu proyecto?
                    </h2>
                    <p class="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Únete a cientos de estudiantes que ya utilizan nuestra plataforma para sus prácticas e
                        investigaciones.
                    </p>
                    <UButton size="xl" color="neutral" variant="solid" :label="isLogged ? 'Ir al laboratorio' : 'Crear cuenta gratis'" icon="i-lucide-arrow-right"
                        trailing @click="goToStart"  />
                </UCard>
            </div>
        </section>

        <!-- Footer complementario (el layout ya tiene footer, pero podemos agregar información extra) -->
        <!-- No duplico footer, el layout ya tiene uno global -->
    </div>
</template>

<style scoped>
/* Transiciones suaves y animación de pulso se manejan con Tailwind, no es necesario más */
</style>