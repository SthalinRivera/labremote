<!-- components/lab/LabConfigModal.vue -->
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const api = useApi()
const emit = defineEmits(['success'])

const open = ref(false)

// Interfaz para la configuración
interface LabConfig {
  id: string
  name: string
  session_duration_seconds: number
  vm_url: string | null
  webcam_url: string | null
}

// Estado del modal
const state = reactive({
  id: '',
  name: '',
  session_duration_seconds: 300,
  vm_url: '',
  webcam_url: ''
})

// Cargar configuración actual
async function loadConfig() {
  try {
    const response = await api<{ success: boolean; data: LabConfig }>('/api/lab/config')
    if (response.success && response.data) {
      state.id = response.data.id
      state.name = response.data.name
      state.session_duration_seconds = response.data.session_duration_seconds
      state.vm_url = response.data.vm_url || ''
      state.webcam_url = response.data.webcam_url || ''
    }
  } catch (err) {
    console.error('Error loading config:', err)
  }
}

// Esquema de validación
const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  session_duration_seconds: z.number()
    .min(60, 'La duración mínima es 60 segundos (1 minuto)')
    .max(3600, 'La duración máxima es 3600 segundos (60 minutos)'),
  vm_url: z.string().url('URL inválida').optional().or(z.literal('')),
  webcam_url: z.string().url('URL inválida').optional().or(z.literal(''))
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    // Convertir strings vacíos a null para las URLs
    const body = {
      name: event.data.name,
      session_duration_seconds: event.data.session_duration_seconds,
      vm_url: event.data.vm_url || null,
      webcam_url: event.data.webcam_url || null
    }

    await api(`/api/lab/config/${state.id}`, {
      method: 'PUT',
      body
    })
    
    toast.add({
      title: 'Configuración actualizada',
      description: 'La configuración del laboratorio ha sido actualizada',
      color: 'success'
    })
    
    emit('success')
    close()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message,
      color: 'error'
    })
  }
}

async function openModal() {
  open.value = true
  await loadConfig()
}

function close() {
  open.value = false
}

defineExpose({ open: openModal, close })
</script>

<template>
  <UModal v-model:open="open">
    <UButton label="Configurar Laboratorio" icon="i-lucide-settings" color="primary" />

    <template #body>
      <div class="p-4">
        <h2 class="text-xl font-semibold mb-4">Configuración del Laboratorio</h2>
        
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Nombre del laboratorio" name="name" required>
            <UInput v-model="state.name" placeholder="Lab IoT IA" />
          </UFormField>

          <UFormField 
            label="Duración de sesión" 
            name="session_duration_seconds"
            :hint="`${Math.floor(state.session_duration_seconds / 60)} minutos (${state.session_duration_seconds} segundos)`"
          >
            <div class="flex items-center gap-2">
              <UInput 
                v-model="state.session_duration_seconds" 
                type="number" 
                min="60" 
                max="3600" 
                step="60"
                class="flex-1"
              />
              <div class="flex gap-1">
                <UButton 
                  size="xs" 
                  variant="ghost" 
                  icon="i-lucide-minus"
                  @click="state.session_duration_seconds = Math.max(60, state.session_duration_seconds - 60)"
                />
                <UButton 
                  size="xs" 
                  variant="ghost" 
                  icon="i-lucide-plus"
                  @click="state.session_duration_seconds = Math.min(3600, state.session_duration_seconds + 60)"
                />
              </div>
            </div>
          </UFormField>

          <UFormField 
            label="URL Máquina Virtual" 
            name="vm_url" 
            hint="Opcional - Dejar vacío si no hay VM configurada"
          >
            <UInput v-model="state.vm_url" placeholder="https://vm.laboratorio.com" />
          </UFormField>

          <UFormField 
            label="URL Cámara Web" 
            name="webcam_url" 
            hint="Opcional - Dejar vacío si no hay cámara configurada"
          >
            <UInput v-model="state.webcam_url" placeholder="https://webcam.laboratorio.com/stream" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-4">
            <UButton label="Cancelar" color="neutral" variant="subtle" @click="close" />
            <UButton label="Guardar cambios" color="primary" type="submit" />
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>