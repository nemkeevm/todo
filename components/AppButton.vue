<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'primary' | 'quiet' | 'danger'
  type?: 'button' | 'submit'
}>(), { tone: 'quiet', type: 'button' })
</script>

<template>
  <button :type="type" class="app-button" :class="`app-button--${tone}`">
    <slot />
  </button>
</template>
