<script setup lang="ts">
const store = useNotesStore()
const pendingDelete = ref<string | null>(null)

function create(): void {
  const note = store.createNote()
  navigateTo(`/notes/${note.id}`)
}

function remove(): void {
  if (!pendingDelete.value) return
  store.deleteNote(pendingDelete.value)
  pendingDelete.value = null
}
</script>

<template>
  <section class="notes-page">
    <header class="page-header page-header--home">
      <div>
        <p class="eyebrow">Ваше пространство</p>
        <h1>Заметки,<br><em>которые двигают</em><br>день.</h1>
      </div>
      <AppButton tone="primary" @click="create">Новая заметка <span aria-hidden="true">↗</span></AppButton>
    </header>

    <section class="notes-list" aria-label="Все заметки">
      <div v-if="store.sortedNotes.length" class="notes-list__meta">
        <span>Все заметки</span><span>{{ store.sortedNotes.length }}</span>
      </div>
      <NotePreview v-for="note in store.sortedNotes" :key="note.id" :note="note" @remove="pendingDelete = note.id" />
      <div v-if="!store.sortedNotes.length" class="empty-state">
        <span class="empty-state__mark">+</span>
        <h2>Начните с одной мысли.</h2>
        <p>Добавьте заметку и превратите её в небольшой, ясный план.</p>
        <AppButton tone="primary" @click="create">Создать заметку</AppButton>
      </div>
    </section>

    <ConfirmModal
      :open="Boolean(pendingDelete)"
      title="Удалить заметку?"
      description="Заметка и её задачи исчезнут без возможности восстановления."
      confirm-text="Удалить"
      danger
      @close="pendingDelete = null"
      @confirm="remove"
    />
  </section>
</template>
