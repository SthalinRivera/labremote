<script setup lang="ts">
import { useMenu } from '~/composables/useMenu'
import { useCookieConsent } from '~/composables/useCookieConsent'
import { useLabSessionGuard } from '~/composables/useLabSessionGuard'

const { mainMenuItems, footerMenuItems, searchGroups } = useMenu()
const { askForConsent } = useCookieConsent()
const { initLab, watchLabAccess, stopLab } = useLabSessionGuard()

const open = ref(false)

onMounted(() => {
  askForConsent()
  initLab()
  watchLabAccess()
})

onUnmounted(() => {
  stopLab()
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar 
      id="default" 
      v-model:open="open" 
      collapsible 
      resizable 
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <!-- MENÚ PRINCIPAL (con subgrupos y accordion) -->
        <UNavigationMenu 
          :collapsed="collapsed" 
          :items="mainMenuItems" 
          orientation="vertical" 
          tooltip 
          accordion
        />

        <!-- ESPACIADOR: empuja el footer hacia abajo -->
        <div class="flex-1" />

        <!-- MENÚ FOOTER (abajo) -->
        <UNavigationMenu 
          v-if="footerMenuItems.length > 0"
          :collapsed="collapsed" 
          :items="footerMenuItems" 
          orientation="vertical" 
          tooltip 
          class="mt-auto" 
        />

        <LabStatusBar />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="searchGroups" />
    <slot />
    <NotificationsSlideover />
  </UDashboardGroup>
</template>