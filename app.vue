<script setup lang="ts">
const store = useNotesStore()

onMounted(() => store.hydrate())
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
