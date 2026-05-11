<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-900">

    <!-- HEADER GLOBAL -->
    <AppHeader />

    <!-- CONTENIDO -->
    <main class="flex-1 py-4">
      <slot />
    </main>

<!-- FOOTER -->
<Footer />

  </div>
</template>