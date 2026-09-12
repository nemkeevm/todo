<template>
  <main class="app-shell">
    <NuxtLink class="wordmark" to="/" aria-label="Todo — к списку заметок">
      <span class="wordmark__dot" />
      todo
    </NuxtLink>
    <slot />
  </main>
</template>
