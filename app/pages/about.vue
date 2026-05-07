<template>
    <div class="min-h-screen  text-gray-900 dark:text-white p-6">

        <!-- HEADER -->
        <div class="max-w-4xl mx-auto text-center mb-10">
            <h1 class="text-3xl font-bold">Sobre Nosotros & Contacto</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Plataforma de Laboratorio Remoto IoT para prácticas académicas en tiempo real.
            </p>
        </div>

        <!-- GRID -->
        <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- ABOUT -->
            <div
                class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-3">

                <h2 class="text-lg font-semibold flex items-center gap-2">
                    📡 Nosotros
                </h2>

                <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Somos una plataforma enfocada en el acceso remoto a laboratorios IoT,
                    permitiendo a estudiantes ejecutar prácticas en dispositivos reales como
                    Raspberry Pi y Jetson Nano sin necesidad de hardware físico local.
                </p>

                <ul class="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                    <li>✔ Acceso remoto en tiempo real</li>
                    <li>✔ Sistema de colas inteligente</li>
                    <li>✔ Integración con dispositivos IoT</li>
                    <li>✔ Entorno académico seguro</li>
                </ul>

            </div>

            <!-- CONTACT -->
            <div
                class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-3">

                <h2 class="text-lg font-semibold flex items-center gap-2">
                    ✉️ Contacto
                </h2>

                <p class="text-sm text-gray-500 dark:text-gray-400">
                    ¿Necesitas soporte o acceso institucional? Escríbenos.
                </p>

                <div class="space-y-2 text-sm">

                    <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        <span class="text-gray-500">Email</span>
                        <span class="font-mono">soporte@labiot.edu</span>
                    </div>

                    <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        <span class="text-gray-500">Soporte</span>
                        <span class="font-mono">24/7 académico</span>
                    </div>

                    <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        <span class="text-gray-500">Respuesta</span>
                        <span class="font-mono">&lt; 24h</span>
                    </div>

                </div>

            </div>

        </div>

        <!-- FOOTER -->
        <div class="text-center text-xs text-gray-400 mt-10">
            Laboratorio Remoto IoT • Plataforma Educativa
        </div>

    </div>
</template>