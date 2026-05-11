<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()
const { user, logout } = useAuth()
const { isStudent, isAdmin } = useMenu()

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

// ✅ Usar datos reales del usuario
const userData = computed(() => ({
  name: user.value?.name || 'Usuario',
  email: user.value?.email || '',
  avatar: {
    src: user.value?.avatar_url || '/avatar.png',
    alt: user.value?.name || 'Avatar'
  },
  role: user.value?.role || 'student'
}))

// ✅ Menú dinámico según el rol
const items = computed<DropdownMenuItem[][]>(() => {
  const menuItems = []
  
  // Sección 1: Información del usuario
  menuItems.push([{
    type: 'label',
    label: userData.value.name,
    avatar: userData.value.avatar
  }, {
    label: userData.value.email,
    type: 'label',
    class: 'text-xs text-gray-500 pointer-events-none'
  }])
  
  // Sección 2: Opciones principales según rol
  const mainOptions = []
  
  // Dashboard según rol
  if (isAdmin.value) {
    mainOptions.push({
      label: 'Dashboard Admin',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard'
    })

  }
  
  if (isStudent.value) {
    mainOptions.push({
      label: 'Mi Dashboard',
      icon: 'i-lucide-home',
      to: '/dashboard/student'
    })
  
  }
  

  
  if (mainOptions.length > 0) {
    menuItems.push(mainOptions)
  }
  
  // Sección 3: Preferencias y temas
  menuItems.push([{
    label: 'Tema',
    icon: 'i-lucide-palette',
    children: [{
      label: 'Color Principal',
      slot: 'chip',
      chip: appConfig.ui.colors.primary,
      content: {
        align: 'center',
        collisionPadding: 16
      },
      children: colors.map(color => ({
        label: color,
        chip: color,
        slot: 'chip',
        checked: appConfig.ui.colors.primary === color,
        type: 'checkbox',
        onSelect: (e: Event) => {
          e.preventDefault()
          appConfig.ui.colors.primary = color
        }
      }))
    }, {
      label: 'Color Neutral',
      slot: 'chip',
      chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
      content: {
        align: 'end',
        collisionPadding: 16
      },
      children: neutrals.map(color => ({
        label: color,
        chip: color === 'neutral' ? 'old-neutral' : color,
        slot: 'chip',
        type: 'checkbox',
        checked: appConfig.ui.colors.neutral === color,
        onSelect: (e: Event) => {
          e.preventDefault()
          appConfig.ui.colors.neutral = color
        }
      }))
    }]
  }, {
    label: 'Apariencia',
    icon: 'i-lucide-sun-moon',
    children: [{
      label: 'Claro',
      icon: 'i-lucide-sun',
      type: 'checkbox',
      checked: colorMode.value === 'light',
      onSelect(e: Event) {
        e.preventDefault()
        colorMode.preference = 'light'
      }
    }, {
      label: 'Oscuro',
      icon: 'i-lucide-moon',
      type: 'checkbox',
      checked: colorMode.value === 'dark',
      onSelect(e: Event) {
        e.preventDefault()
        colorMode.preference = 'dark'
      }
    }, {
      label: 'Sistema',
      icon: 'i-lucide-monitor',
      type: 'checkbox',
      checked: colorMode.value === 'system',
      onSelect(e: Event) {
        e.preventDefault()
        colorMode.preference = 'system'
      }
    }]
  }])
  
  // Sección 4: Enlaces y soporte
  menuItems.push([{
    label: 'Documentación',
    icon: 'i-lucide-book-open',
    to: '/docs',
    target: '_blank'
  }, {
    label: 'Soporte',
    icon: 'i-lucide-help-circle',
    to: '/support'
  }])
  
  // Sección 5: Cerrar sesión
  menuItems.push([{
    label: 'Cerrar Sesión',
    icon: 'i-lucide-log-out',
    color: 'error',
    onSelect: () => logout()
  }])
  
  return menuItems
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >

    <UButton
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed' }"
    >
      <template #leading>
        <UAvatar 
          :src="userData.avatar.src" 
          :alt="userData.avatar.alt"
          size="sm"
        />
        <!-- Indicador de rol -->
        <div 
          class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
          :class="isAdmin ? 'bg-purple-500' : 'bg-green-500'"
        ></div>
      </template>
      
      <template v-if="!collapsed" #default>
        <div class="flex-1 text-left">
          <p class="text-sm font-medium truncate">{{ userData.name.split(' ')[0] }}</p>
          <p class="text-xs text-gray-500 capitalize">{{ isAdmin ? 'Administrador' : 'Estudiante' }}</p>
        </div>
      </template>
      
      <template v-if="!collapsed" #trailing>
        <UIcon name="i-lucide-chevrons-up-down" class="w-4 h-4" />
      </template>
    </UButton>

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg size-2"
          :class="`bg-${(item as any).chip}-500 dark:bg-${(item as any).chip}-400`"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>