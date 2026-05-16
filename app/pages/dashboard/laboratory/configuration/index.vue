<!-- pages/dashboard/lab/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ['auth', 'role'],
  roles: ['admin']
})

const toast = useToast()
const api = useApi()

// Interfaces
interface LabConfig {
  id: string
  name: string
  is_busy: boolean
  session_duration_seconds: number
  vm_url: string | null
  webcam_url: string | null
  current_session_id: string | null
  updated_at: string
}

// Estados para edición inline
const editingField = ref<string | null>(null)
const editValue = ref('')

// Obtener configuración actual
const { data: response, refresh: refreshConfig } = useAsyncData(
  'lab-config-full',
  () => api<{ success: boolean; data: LabConfig; message: string }>('/api/lab/config'),
  { default: () => null }
)

const config = computed(() => response.value?.data || null)

// Actualizar configuración
async function updateQuickConfig(field: 'name' | 'session_duration_seconds' | 'vm_url' | 'webcam_url', value: any) {
  if (!config.value) return
  
  try {
    await api(`/api/lab/config/${config.value.id}`, {
      method: 'PATCH',
      body: { [field]: value }
    })
    
    toast.add({
      title: 'Configuración actualizada',
      description: getFieldDescription(field),
      color: 'success'
    })
    
    await refreshConfig()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error'
    })
  }
}

// Texto descriptivo para el toast
function getFieldDescription(field: string): string {
  const descriptions: Record<string, string> = {
    name: 'Nombre del laboratorio actualizado',
    vm_url: 'URL de VM actualizada',
    webcam_url: 'URL de cámara actualizada',
    session_duration_seconds: 'Duración de sesión actualizada'
  }
  return descriptions[field] || 'Campo actualizado correctamente'
}

// Iniciar edición
function startEditing(field: string, currentValue: any) {
  editingField.value = field
  editValue.value = currentValue || ''
}

// Guardar edición
async function saveEdit(field: 'name' | 'vm_url' | 'webcam_url') {
  if (!config.value) return
  
  let valueToSave: string | null = editValue.value.trim()
  
  // Validar URLs
  if (field === 'vm_url' || field === 'webcam_url') {
    if (valueToSave && !valueToSave.startsWith('http://') && !valueToSave.startsWith('https://')) {
      toast.add({
        title: 'Error',
        description: 'La URL debe comenzar con http:// o https://',
        color: 'error'
      })
      return
    }
    valueToSave = valueToSave || null
  }
  
  if (field === 'name' && !valueToSave) {
    toast.add({
      title: 'Error',
      description: 'El nombre no puede estar vacío',
      color: 'error'
    })
    return
  }
  
  await updateQuickConfig(field, valueToSave)
  cancelEditing()
}

// Cancelar edición
function cancelEditing() {
  editingField.value = null
  editValue.value = ''
}

// Manejar tecla Enter/Escape
function handleKeydown(e: KeyboardEvent, field: 'name' | 'vm_url' | 'webcam_url') {
  if (e.key === 'Enter') {
    e.preventDefault()
    saveEdit(field)
  } else if (e.key === 'Escape') {
    cancelEditing()
  }
}

// Ajustar duración en minutos
function adjustDuration(delta: number) {
  if (!config.value) return
  const newDuration = Math.min(3600, Math.max(60, config.value.session_duration_seconds + delta))
  updateQuickConfig('session_duration_seconds', newDuration)
}

// Formatear fecha
function formatDate(date: string) {
  if (!date) return 'No disponible'
  return new Date(date).toLocaleString('es-ES')
}

// Formatear duración legible
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes} minutos`
  return `${seconds} segundos`
}

// Abrir URL en nueva pestaña
function openUrl(url: string | null) {
  if (url) window.open(url, '_blank')
}
</script>

<template>
  <UDashboardPanel id="lab-config">
    <template #header>
      <UDashboardNavbar title="Configuración del Laboratorio">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            color="primary"
            variant="solid"
            size="sm"
            @click="refreshConfig"
          >
            <UIcon name="i-lucide-refresh-cw" class="mr-1" />
            Actualizar
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="h-full flex flex-col">
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          
          <!-- Columna Izquierda: Estado y Configuración General -->
          <div class="space-y-6">
            <!-- Widget de Estado -->
            <LabStatusWidget />

            <!-- Configuración General -->
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-settings-2" class="text-xl" />
                    <h3 class="text-lg font-semibold">Configuración General</h3>
                  </div>
                  <UBadge :color="config?.is_busy ? 'error' : 'success'" variant="solid">
                    <UIcon :name="config?.is_busy ? 'i-lucide-alarm-clock' : 'i-lucide-check-circle'" class="mr-1 w-3 h-3" />
                    {{ config?.is_busy ? 'Ocupado' : 'Disponible' }}
                  </UBadge>
                </div>
              </template>

              <div v-if="config" class="space-y-5">
                <!-- Nombre del laboratorio -->
                <div class="group">
                  <label class="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">
                    Nombre del Laboratorio
                  </label>
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <div v-if="editingField === 'name'" class="flex items-center gap-2">
                        <UInput
                          v-model="editValue"
                          class="flex-1"
                          size="md"
                          placeholder="Ej: Laboratorio A"
                          autofocus
                          @keydown.enter="saveEdit('name')"
                          @keydown.escape="cancelEditing"
                        />
                        <UButton size="sm" color="primary" icon="i-lucide-check" @click="saveEdit('name')" />
                        <UButton size="sm" variant="ghost" icon="i-lucide-x" @click="cancelEditing" />
                      </div>
                      <div v-else class="flex items-center gap-2 p-2 bg-default rounded-lg">
                        <UIcon name="i-lucide-microchip" class="text-muted" />
                        <span class="font-mono font-medium">{{ config.name }}</span>
                        <UTooltip text="Editar nombre">
                          <UButton 
                            size="xs" 
                            variant="ghost" 
                            icon="i-lucide-pencil"
                            class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                            @click="startEditing('name', config.name)"
                          />
                        </UTooltip>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Duración de sesión -->
                <div>
                  <label class="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">
                    Duración de Sesión
                  </label>
                  <div class="flex items-center justify-between p-3 bg-default rounded-lg">
                    <div class="flex items-center gap-3">
                      <UIcon name="i-lucide-hourglass" class="text-muted" />
                      <div>
                        <span class="text-lg font-bold">{{ Math.floor(config.session_duration_seconds / 60) }}</span>
                        <span class="text-muted ml-1">minutos</span>
                        <div class="text-xs text-muted">{{ formatDuration(config.session_duration_seconds) }}</div>
                      </div>
                    </div>
                    <div class="flex gap-1">
                      <UTooltip text="Reducir 1 minuto">
                        <UButton 
                          size="sm" 
                          variant="outline"
                          icon="i-lucide-minus"
                          @click="adjustDuration(-60)"
                          :disabled="config.session_duration_seconds <= 60"
                        />
                      </UTooltip>
                      <UTooltip text="Aumentar 1 minuto">
                        <UButton 
                          size="sm" 
                          variant="outline"
                          icon="i-lucide-plus"
                          @click="adjustDuration(60)"
                          :disabled="config.session_duration_seconds >= 3600"
                        />
                      </UTooltip>
                    </div>
                  </div>
                </div>

                <!-- Información adicional -->
                <div class="pt-4 border-t border-default">
                  <div class="space-y-2 text-xs text-muted">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-hash" class="w-3 h-3" />
                      <span class="font-mono">ID: {{ config.id }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-clock" class="w-3 h-3" />
                      <span>Última actualización: {{ formatDate(config.updated_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Loading / Error states -->
              <div v-else-if="response?.pending" class="text-center text-muted py-12">
                <UIcon name="i-lucide-loader-circle" class="animate-spin text-3xl mb-3" />
                <div>Cargando configuración...</div>
              </div>
              <div v-else-if="response?.error" class="text-center text-error py-12">
                <UIcon name="i-lucide-alert-circle" class="text-3xl mb-3" />
                <div class="mb-3">Error al cargar la configuración</div>
                <UButton size="sm" @click="refreshConfig">Reintentar</UButton>
              </div>
            </UCard>
          </div>

          <!-- Columna Derecha: Recursos (VM + Webcam) -->
          <div>
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-link-2" class="text-xl" />
                  <h3 class="text-lg font-semibold">Recursos del Laboratorio</h3>
                </div>
              </template>

              <div v-if="config" class="space-y-5">
                <!-- Máquina Virtual -->
                <div class="group">
                  <label class="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block flex items-center gap-1">
                    <UIcon name="i-lucide-monitor" />
                    Máquina Virtual
                  </label>
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <div v-if="editingField === 'vm_url'" class="space-y-2">
                        <UInput
                          v-model="editValue"
                          size="md"
                          placeholder="https://ejemplo.com/vm"
                          autofocus
                          @keydown.enter="saveEdit('vm_url')"
                          @keydown.escape="cancelEditing"
                        />
                        <div class="flex gap-2">
                          <UButton size="sm" color="primary" icon="i-lucide-check" @click="saveEdit('vm_url')">
                            Guardar
                          </UButton>
                          <UButton size="sm" variant="ghost" @click="cancelEditing">
                            Cancelar
                          </UButton>
                        </div>
                      </div>
                      <div v-else class="flex items-center gap-2 p-2 bg-default rounded-lg">
                        <UIcon name="i-lucide-link" class="text-muted flex-shrink-0" />
                        <div class="flex-1 min-w-0">
                          <div class="font-mono text-sm truncate" :title="config.vm_url || ''">
                            {{ config.vm_url || 'No configurada' }}
                          </div>
                        </div>
                        <div class="flex items-center gap-1">
                          <UTooltip v-if="config.vm_url" text="Abrir enlace">
                            <UButton
                              size="xs"
                              variant="ghost"
                              icon="i-lucide-external-link"
                              @click="openUrl(config.vm_url)"
                            />
                          </UTooltip>
                          <UTooltip text="Editar URL">
                            <UButton
                              size="xs"
                              variant="ghost"
                              icon="i-lucide-pencil"
                              class="opacity-0 group-hover:opacity-100 transition-opacity"
                              @click="startEditing('vm_url', config.vm_url)"
                            />
                          </UTooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Cámara Web -->
                <div class="group">
                  <label class="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block flex items-center gap-1">
                    <UIcon name="i-lucide-video" />
                    Cámara Web
                  </label>
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <div v-if="editingField === 'webcam_url'" class="space-y-2">
                        <UInput
                          v-model="editValue"
                          size="md"
                          placeholder="https://ejemplo.com/webcam"
                          autofocus
                          @keydown.enter="saveEdit('webcam_url')"
                          @keydown.escape="cancelEditing"
                        />
                        <div class="flex gap-2">
                          <UButton size="sm" color="primary" icon="i-lucide-check" @click="saveEdit('webcam_url')">
                            Guardar
                          </UButton>
                          <UButton size="sm" variant="ghost" @click="cancelEditing">
                            Cancelar
                          </UButton>
                        </div>
                      </div>
                      <div v-else class="flex items-center gap-2 p-2 bg-default rounded-lg">
                        <UIcon name="i-lucide-link" class="text-muted flex-shrink-0" />
                        <div class="flex-1 min-w-0">
                          <div class="font-mono text-sm truncate" :title="config.webcam_url || ''">
                            {{ config.webcam_url || 'No configurada' }}
                          </div>
                        </div>
                        <div class="flex items-center gap-1">
                          <UTooltip v-if="config.webcam_url" text="Abrir enlace">
                            <UButton
                              size="xs"
                              variant="ghost"
                              icon="i-lucide-external-link"
                              @click="openUrl(config.webcam_url)"
                            />
                          </UTooltip>
                          <UTooltip text="Editar URL">
                            <UButton
                              size="xs"
                              variant="ghost"
                              icon="i-lucide-pencil"
                              class="opacity-0 group-hover:opacity-100 transition-opacity"
                              @click="startEditing('webcam_url', config.webcam_url)"
                            />
                          </UTooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-xs text-muted pt-2 border-t border-default">
                  <UIcon name="i-lucide-info" class="inline mr-1" />
                  Las URLs deben comenzar con http:// o https://
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>