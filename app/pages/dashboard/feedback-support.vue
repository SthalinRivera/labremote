<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { breakpointsTailwind } from '@vueuse/core'
import type { Mail } from '~/types'
definePageMeta({
    layout: 'dashboard', // Layout sin header ni sidebar
    middleware: ['auth', 'role'],
    roles: ['student','visitor', 'admin']
})
const tabItems = [{
  label: 'All',
  value: 'all'
}, {
  label: 'Unread',
  value: 'unread'
}]
const selectedTab = ref('all')

const { data: mails } = await useFetch<Mail[]>('/api/mails', { default: () => [] })

// Filter mails based on the selected tab
const filteredMails = computed(() => {
  if (selectedTab.value === 'unread') {
    return mails.value.filter(mail => !!mail.unread)
  }

  return mails.value
})

const selectedMail = ref<Mail | null>()

const isMailPanelOpen = computed({
  get() {
    return !!selectedMail.value
  },
  set(value: boolean) {
    if (!value) {
      selectedMail.value = null
    }
  }
})

// Reset selected mail if it's not in the filtered mails
watch(filteredMails, () => {
  if (!filteredMails.value.find(mail => mail.id === selectedMail.value?.id)) {
    selectedMail.value = null
  }
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')
</script>

<template>
   <UDashboardPanel id="dashboard">
         <UDashboardNavbar title="Dashboard - Ayuda y Soporte" :ui="{ right: 'gap-3' }">
            
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
         <UColorModeButton />

      
        </template>
      </UDashboardNavbar>
  
 
<div class="mx-4">
  <FeedbackSupport />
</div>

 </UDashboardPanel>
</template>
