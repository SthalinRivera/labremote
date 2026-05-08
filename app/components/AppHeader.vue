<template>
    <UHeader>

        <!-- LEFT -->
        <template #left>
           <NuxtLink to="/" class="font-bold">
    <img
      :src="colorMode.value === 'dark'
        ? '/logo-dark.png'
        : '/logo.png'"
      alt="Lab"
      class="w-auto h-10"
    />
  </NuxtLink>
        </template>

        <!-- CENTER MENU -->
        <AppMenu :items="mainMenuItems" />

        <!-- RIGHT AUTH (COMPONENTE SEPARADO) -->
        <template #right>
            <AppAuthMenu />
        </template>

    </UHeader>
</template>

<script setup lang="ts">
const { mainMenuItems } = useMenu()
const colorMode = useColorMode()

</script>