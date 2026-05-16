<!-- pages/support.vue o components/FeedbackSupport.vue -->
<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <!-- Cabecera -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
        <UIcon name="i-lucide-headphones" class="w-4 h-4 text-primary-600" />
        <span class="text-xs font-medium text-primary-600 dark:text-primary-400">Soporte</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        ¿Necesitas ayuda?
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Cuéntanos tu duda o problema y te responderemos a la brevedad
      </p>
    </div>

    <!-- Formulario -->
    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Nombre -->
        <UFormGroup label="Nombre completo" required>
          <UInput
            v-model="form.name"
            placeholder="Tu nombre"
            size="md"
            :ui="{ base: 'w-full' }"
          />
          <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
        </UFormGroup>

        <!-- Email -->
        <UFormGroup label="Correo electrónico" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="tu@email.com"
            size="md"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </UFormGroup>

        <!-- Tipo de consulta -->
        <UFormGroup label="Tipo de consulta">
          <USelect
            v-model="form.type"
            :options="typeOptions"
            placeholder="Selecciona una opción"
            size="md"
          />
        </UFormGroup>

        <!-- Mensaje -->
        <UFormGroup label="Mensaje" required>
          <UTextarea
            v-model="form.message"
            placeholder="Describe tu consulta o sugerencia en detalle..."
            :rows="5"
            size="md"
          />
          <p v-if="errors.message" class="text-red-500 text-xs mt-1">{{ errors.message }}</p>
        </UFormGroup>

        <!-- Botón de envío -->
        <div class="pt-2">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            block
          >
            <template #leading>
              <UIcon name="i-lucide-send" class="w-4 h-4" />
            </template>
            Enviar mensaje
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- Mensaje de éxito -->
    <div v-if="successMessage" class="mt-6">
      <UAlert
        color="green"
        variant="solid"
        :title="successMessage"
        icon="i-lucide-check-circle-2"
        close-button
        @close="successMessage = ''"
      />
    </div>

    <!-- Información adicional -->
    <div class="mt-8 text-center text-sm text-gray-500">
      <p>También puedes escribirnos directamente a  
        <ULink href="mailto:soporte@labremoto.com" class="text-primary-600">soporte@labremoto.com</ULink>
      </p>
      <p class="mt-2">Tiempo de respuesta estimado: 24 horas hábiles</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth' // ajusta la ruta según tu proyecto

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { user } = useAuth()

// Datos del formulario
const form = reactive({
  name: user?.name || '',
  email: user?.email || '',
  type: 'consulta',
  message: ''
})

const typeOptions = [
  { label: 'Consulta general', value: 'consulta' },
  { label: 'Problema técnico', value: 'problema' },
  { label: 'Sugerencia', value: 'sugerencia' },
  { label: 'Otro', value: 'otro' }
]

// Estado
const isSubmitting = ref(false)
const successMessage = ref('')
const errors = reactive({
  name: '',
  email: '',
  message: ''
})

// Validación simple
const validate = () => {
  let isValid = true
  errors.name = ''
  errors.email = ''
  errors.message = ''

  if (!form.name.trim()) {
    errors.name = 'El nombre es obligatorio'
    isValid = false
  }
  if (!form.email.trim()) {
    errors.email = 'El correo es obligatorio'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Correo electrónico inválido'
    isValid = false
  }
  if (!form.message.trim()) {
    errors.message = 'El mensaje no puede estar vacío'
    isValid = false
  }
  return isValid
}

// Envío simulado (cambiar por llamada real)
const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true
  // Simular petición a API
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Mensaje enviado:', form)
    successMessage.value = '¡Mensaje enviado con éxito! Te responderemos pronto.'
    // Resetear solo el mensaje, conservar nombre/email
    form.message = ''
    form.type = 'consulta'
  } catch (error) {
    console.error(error)
    // Mostrar error opcionalmente
  } finally {
    isSubmitting.value = false
  }
}
</script>