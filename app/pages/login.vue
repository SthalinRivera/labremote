<script setup lang="ts">
import { ref, onMounted } from "vue";

const config = useRuntimeConfig();
const toast = useToast();

type AuthResponse = {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        avatar_url?: string;
        role: string;
    };
};

type ErrorResponse = {
    error: string;
    message: string;
};

const isLoading = ref(false);
const error = ref<string | null>(null);
const pendingApproval = ref(false);
const requestingAuth = ref(false);
const googleLoaded = ref(false);

// ===== LOGIN =====
const loginWithGoogle = async (response: any) => {
    if (isLoading.value) return;

    isLoading.value = true;
    error.value = null;
    pendingApproval.value = false;
    requestingAuth.value = false;

    try {
        const res = await $fetch<AuthResponse>(
            `${config.public.apiUrl}/auth/google`,
            {
                method: "POST",
                body: { credential: response.credential },
            }
        );

        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        toast.add({
            title: '¡Bienvenido!',
            description: `Hola ${res.user.name}, has iniciado sesión correctamente.`,
            color: 'success',
            icon: 'i-lucide-circle-check',
            timeout: 3000
        });

        if (res.user.role === 'admin') {
            await navigateTo('/dashboard');
        } else if (res.user.role === 'student') {
            await navigateTo('/student');
        } else {
            await navigateTo('/');
        }

    } catch (e: any) {
        console.error(e);
        const errorData = e.data as ErrorResponse;
        
        // Manejar diferentes tipos de errores
        if (errorData?.error === 'domain_not_allowed') {
            error.value = errorData.message;
            toast.add({
                title: 'Dominio no permitido',
                description: errorData.message,
                color: 'error',
                icon: 'i-lucide-alert-circle',
                timeout: 5000
            });
        } else if (errorData?.error === 'authorization_required') {
            requestingAuth.value = true;
            error.value = errorData.message;
            toast.add({
                title: 'Solicitud enviada',
                description: 'Se ha notificado al administrador. Recibirás un correo cuando sea aprobado.',
                color: 'info',
                icon: 'i-lucide-mail',
                timeout: 5000
            });
        } else if (errorData?.error === 'pending_approval') {
            pendingApproval.value = true;
            error.value = errorData.message;
            toast.add({
                title: 'Cuenta pendiente',
                description: errorData.message,
                color: 'warning',
                icon: 'i-lucide-clock',
                timeout: 5000
            });
        } else {
            error.value = "Error al iniciar sesión";
            toast.add({
                title: 'Error',
                description: 'No se pudo iniciar sesión. Intenta nuevamente.',
                color: 'error',
                icon: 'i-lucide-alert-circle'
            });
        }
    } finally {
        isLoading.value = false;
    }
};

// ===== GOOGLE INIT (sin precarga) =====
onMounted(() => {
    // Limpiar tokens previos
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Función para cargar el script de Google
    const loadGoogleScript = () => {
        if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
            initializeGoogleButton();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            googleLoaded.value = true;
            initializeGoogleButton();
        };
        document.head.appendChild(script);
    };
    
    const initializeGoogleButton = () => {
        if (!(window as any).google?.accounts?.id) {
            setTimeout(initializeGoogleButton, 100);
            return;
        }
        
        (window as any).google.accounts.id.initialize({
            client_id: config.public.googleClientId,
            callback: loginWithGoogle,
            auto_select: false, // No precargar correo automáticamente
            itp_support: true,
        });
        
        (window as any).google.accounts.id.renderButton(
            document.getElementById("googleBtn"),
            {
                theme: "outline",
                size: "large",
                width: 280,
                text: "continue_with", // Texto personalizado
                shape: "pill",
                logo_alignment: "center"
            }
        );
        
        // Opcional: remover la suscripción automática
        (window as any).google.accounts.id.disableAutoSelect();
    };
    
    loadGoogleScript();
});

// Modo oscuro
const colorMode = useColorMode();
</script>

<template>
    <div class="flex items-center justify-center min-h-svh p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <UCard class="w-full max-w-md shadow-xl transform transition-all duration-300 hover:shadow-2xl">
            <template #header>
                <div class="text-center">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto shadow-lg">
                        <span class="text-white text-2xl font-bold">LR</span>
                    </div>
                    <h1 class="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
                        Laboratorio Remoto
                    </h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Accede con tu correo institucional
                    </p>
                    <UBadge color="primary" variant="soft" class="mt-2">
                        @undc.edu.pe
                    </UBadge>
                </div>
            </template>

            <div class="space-y-4">
                <!-- Errores específicos -->
                <UAlert
                    v-if="error && !requestingAuth && !pendingApproval"
                    color="error"
                    variant="subtle"
                    icon="i-lucide-alert-circle"
                    :title="error"
                    class="mb-4"
                />

                <!-- Solicitud de autorización -->
                <UAlert
                    v-if="requestingAuth"
                    color="info"
                    variant="subtle"
                    icon="i-lucide-mail"
                    title="Solicitud de acceso enviada"
                    :description="error"
                    class="mb-4"
                />

                <!-- Cuenta pendiente -->
                <UAlert
                    v-if="pendingApproval"
                    color="warning"
                    variant="subtle"
                    icon="i-lucide-clock"
                    title="Cuenta pendiente de aprobación"
                    :description="error"
                    class="mb-4"
                />

                <!-- Google button container -->
                <div class="flex justify-center py-4">
                    <div 
                        id="googleBtn" 
                        class="transition-opacity"
                        :class="{ 'opacity-50 pointer-events-none': isLoading }"
                    />
                </div>

                <!-- Loading state -->
                <div v-if="isLoading" class="flex items-center justify-center gap-2 py-2">
                    <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin text-primary-500" />
                    <span class="text-sm text-gray-500">Verificando acceso...</span>
                </div>

                <!-- Mensaje de restricción -->
                <div class="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                    <p class="flex items-center justify-center gap-1">
                        <UIcon name="i-lucide-shield-check" class="w-3 h-3" />
                        <span>Solo correos institucionales @undc.edu.pe</span>
                    </p>
                </div>

                <!-- Separador -->
                <div class="relative my-4">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
                    </div>
                    <div class="relative flex justify-center text-xs">
                        <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">
                            Acceso seguro con Google
                        </span>
                    </div>
                </div>

                <!-- Información adicional -->
                <div class="text-center text-xs text-gray-500 dark:text-gray-400">
                    <p>Al iniciar sesión aceptas nuestros</p>
                    <p>
                        <NuxtLink to="/terms" class="text-primary-500 hover:underline">Términos de servicio</NuxtLink>
                        y
                        <NuxtLink to="/privacy" class="text-primary-500 hover:underline">Política de privacidad</NuxtLink>
                    </p>
                </div>
            </div>

            <template #footer>
                <div class="text-center text-xs text-gray-500">
                    ¿Necesitas ayuda?
                    <NuxtLink to="/support" class="text-primary-500 hover:underline">
                        Contacta a soporte
                    </NuxtLink>
                </div>
            </template>
        </UCard>

        <!-- Botón de modo oscuro flotante -->
        <div class="fixed bottom-4 right-4">
            <UButton
                :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
                color="neutral"
                variant="ghost"
                @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
            />
        </div>
    </div>
</template>

<style scoped>
:deep(.card) {
    animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>