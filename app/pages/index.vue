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

       

        <!-- Features Section (cards) -->
    
                    
          <HeroSection/> 
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
@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse-slow {
    0%, 100% {
        opacity: 0.2;
        transform: scale(1);
    }
    50% {
        opacity: 0.4;
        transform: scale(1.1);
    }
}

@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
}

@keyframes scroll {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(15px); opacity: 0; }
}

.animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
}

.animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
    opacity: 0;
}

.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-300 { animation-delay: 0.3s; }
.animation-delay-400 { animation-delay: 0.4s; }

.animate-pulse-slow {
    animation: pulse-slow 4s ease-in-out infinite;
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
    animation: float 6s ease-in-out infinite 3s;
}

.animate-scroll {
    animation: scroll 2s ease-in-out infinite;
}

.perspective-1200 {
    perspective: 1200px;
}

.transform-gpu {
    transform-style: preserve-3d;
    backface-visibility: hidden;
}

.rotate-y-\[-15deg\] {
    transform: rotateY(-15deg) !important;
}

.rotate-y-\[12deg\] {
    transform: rotateY(12deg) !important;
}

/* Hover effects */
.group-hover\/cards\:rotate-y-12:hover {
    transform: rotateY(12deg) !important;
}

.group-hover\/cards\:-rotate-y-\[12deg\]:hover {
    transform: rotateY(-12deg) !important;
}

.group-hover\/cards\:scale-102:hover {
    transform: scale(1.02);
}
</style>