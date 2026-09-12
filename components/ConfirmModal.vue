<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description: string
  confirmText?: string
  danger?: boolean
}>(), { confirmText: 'Подтвердить', danger: false })

const emit = defineEmits<{ confirm: []; close: [] }>()
const dialog = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

function close() { emit('close') }
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = [...dialog.value.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled])')]
  const first = focusable[0]
  const last = focusable.at(-1)
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

watch(() => props.open, async (open) => {
  if (!import.meta.client) return
  if (open) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    dialog.value?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  } else previousFocus?.focus()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @mousedown.self="close">
        <section ref="dialog" class="modal" role="dialog" aria-modal="true" :aria-label="title" @keydown="onKeydown">
          <p class="eyebrow">Подтверждение</p>
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
          <div class="modal__actions">
            <AppButton data-autofocus @click="close">Вернуться</AppButton>
            <AppButton :tone="danger ? 'danger' : 'primary'" @click="emit('confirm')">{{ confirmText }}</AppButton>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
