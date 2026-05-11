<template>
  <UHeader>

    <!-- LEFT -->
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-center font-bold"
      >
        <!-- Logo Light -->
        <img
          src="/logo.png"
          alt="Lab"
          class="h-10 w-auto dark:hidden"
        />

        <!-- Logo Dark -->
        <img
          src="/logo-dark.png"
          alt="Lab"
          class="hidden h-10 w-auto dark:block"
        />
      </NuxtLink>
    </template>

    <!-- CENTER MENU -->
    <AppMenu :items="mainMenuItems" />

    <!-- RIGHT -->
    <template #right>
      <AppAuthMenu />
    </template>

  </UHeader>
</template>

<script setup lang="ts">
const { mainMenuItems } = useMenu()
const colorMode = useColorMode()

</script>