<script setup lang="ts">
const route = useRoute()
const store = useNotesStore()
const showRestore = ref(false)
const showCancel = ref(false)
const showDelete = ref(false)
const missing = ref(false)

const noteId = computed(() => String(route.params.id))
const draft = computed(() => store.editing?.draft ?? null)

function begin(restore = false): void {
  missing.value = !store.startEditing(noteId.value, restore)
}

function save(): void {
  if (store.saveEditing()) navigateTo('/')
  else missing.value = true
}

function cancel(): void {
  store.cancelEditing()
  navigateTo('/')
}

function remove(): void {
  store.deleteNote(noteId.value)
  navigateTo('/')
}

function onKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  if (!event.ctrlKey && !event.metaKey) return
  if (event.key.toLowerCase() !== 'z' || typing) return
  event.preventDefault()
  if (event.shiftKey) store.redo()
  else store.undo()
}

onMounted(() => {
  if (store.draftFor(noteId.value)) showRestore.value = true
  else begin()
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

watch(() => store.notes.some((note) => note.id === noteId.value), (exists) => {
  if (!exists && store.editing?.noteId === noteId.value) missing.value = true
})
</script>

<template>
  <section v-if="draft && !missing" class="editor-page">
    <header class="editor-toolbar">
      <NuxtLink class="back-link" to="/" @click.prevent="showCancel = true">← <span>Все заметки</span></NuxtLink>
      <div class="editor-toolbar__actions">
        <button class="history-button" type="button" :disabled="!store.canUndo" aria-label="Отменить изменение" @click="store.undo">↶</button>
        <button class="history-button" type="button" :disabled="!store.canRedo" aria-label="Повторить изменение" @click="store.redo">↷</button>
        <AppButton tone="primary" @click="save">Сохранить</AppButton>
      </div>
    </header>

    <div class="editor-content">
      <label class="title-field">
        <span class="sr-only">Название заметки</span>
        <textarea :value="draft.title" rows="2" placeholder="Без названия" @input="store.updateTitle(($event.target as HTMLTextAreaElement).value)" @blur="store.flushPendingText" />
      </label>

      <section class="todo-section" aria-labelledby="todo-title">
        <div class="todo-section__header">
          <div><p class="eyebrow">Чек-лист</p><h2 id="todo-title">Что важно сейчас</h2></div>
          <span>{{ draft.todos.filter((todo) => todo.done).length }}/{{ draft.todos.length }}</span>
        </div>
        <ul class="todo-list">
          <TodoEditor
            v-for="todo in draft.todos"
            :key="todo.id"
            :todo="todo"
            @update-text="store.updateTodoText(todo.id, $event)"
            @update-done="store.setTodoDone(todo.id, $event)"
            @remove="store.removeTodo(todo.id)"
          />
        </ul>
        <button class="add-todo" type="button" @click="store.addTodo">+ Добавить задачу</button>
      </section>

      <button class="delete-note" type="button" @click="showDelete = true">Удалить заметку</button>
    </div>

    <ConfirmModal :open="showCancel" title="Отменить редактирование?" description="Все несохранённые изменения этой сессии будут потеряны." confirm-text="Отменить изменения" @close="showCancel = false" @confirm="cancel" />
    <ConfirmModal :open="showDelete" title="Удалить заметку?" description="Заметка и её задачи исчезнут без возможности восстановления." confirm-text="Удалить" danger @close="showDelete = false" @confirm="remove" />
  </section>

  <section v-else class="not-found">
    <p class="eyebrow">Недоступно</p>
    <h1>Этой заметки<br>уже нет.</h1>
    <p>Возможно, её удалили в другой вкладке или ссылка устарела.</p>
    <AppButton tone="primary" @click="navigateTo('/')">К списку заметок</AppButton>
  </section>

  <ConfirmModal
    :open="showRestore"
    title="Восстановить черновик?"
    description="Нашли несохранённые изменения этой заметки после предыдущей сессии."
    confirm-text="Восстановить"
    @close="showRestore = false; begin(false)"
    @confirm="showRestore = false; begin(true)"
  />
</template>
