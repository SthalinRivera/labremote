<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { isLogged } = useAuth()

const goToStart = () => navigateTo(isLogged.value ? '/dashboard/student/queue' : '/login')
const goToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
    <div class="text-gray-900 dark:text-gray-100 transition-colors max-w-7xl mx-auto px-6 my-12">
        <!-- Hero Section -->
        <section class=" flex items-center relative overflow-hidden">
            
            <!-- Fondo -->

            <div class="w-full mx-auto px-6 md:px-12 lg:px-20 relative z-10">
                <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
                    
                    <!-- Columna Izquierda - Texto -->
                    <div class="w-full lg:w-1/2 lg:pr-12 xl:pr-20 py-12">
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
                    </div>

                    <!-- Columna Derecha - Una sola imagen con efecto 3D -->
                    <div class="w-full lg:w-1/2">
                        <div class="flex justify-center items-center">
                            
                            <!-- Imagen única con efecto inclinado -->
                            <div class="relative transition-all duration-300 hover:scale-105
                                        rotate-y-12 -rotate-x-5">
                                <div class="relative">
                                    <!-- Sombra 3D -->
                                    <div class="absolute -inset-4 bg-black/30 rounded-2xl blur-xl 
                                                transform translate-x-8 translate-y-8 -z-10"></div>
                                    
                                    <!-- Marco de la imagen -->
                                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden 
                                                border border-gray-200 dark:border-gray-700">
                                        <!-- Barra superior estilo ventana -->
                                        <div class="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 
                                                    border-b border-gray-200 dark:border-gray-700">
                                            <div class="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div class="w-3 h-3 rounded-full bg-green-400"></div>
                                            <div class="flex-1 text-center">
                                                <span class="text-xs text-gray-500 font-medium">Laboratorio Remoto - IoT Lab</span>
                                            </div>
                                        </div>
                                        
                                        <!-- ⭐ AJUSTA EL TAMAÑO DE LA IMAGEN AQUÍ -->
                                        <img src="/images/captura1.png" alt="Laboratorio Remoto" 
                                            class="w-80 md:w-96 lg:w-[500px] xl:w-[600px] object-cover" />
                                        
                                        <!-- Badge flotante -->
                                        <div class="absolute top-4 right-4">
                                            <div class="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 
                                                        border border-green-500/50 shadow-lg">
                                                <div class="flex items-center gap-2 text-xs text-white">
                                                    <span class="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                    <span>En Vivo - 24/7</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Badge inferior -->
                                        <div class="absolute bottom-4 left-4">
                                            <div class="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 
                                                        border border-blue-500/50 shadow-lg">
                                                <div class="flex items-center gap-2 text-xs text-white">
                                                    <UIcon name="i-lucide-cpu" class="w-3 h-3" />
                                                    <span>Hardware Real</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

          
        </section>
    </div>
</template>

<style scoped>
@keyframes scroll {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(10px); opacity: 0; }
}

.animate-scroll {
    animation: scroll 1.5s ease-in-out infinite;
}

/* Efecto 3D inclinado hacia la derecha */
.rotate-y-12 {
    transform: rotateY(12deg) rotateX(5deg);
}

.-rotate-x-5 {
    transform: rotateY(12deg) rotateX(5deg);
}
</style>