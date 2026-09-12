<script setup lang="ts">
import type { Note } from '~/types/note'

const props = defineProps<{ note: Note }>()
const emit = defineEmits<{ remove: [] }>()
const preview = computed(() => props.note.todos.slice(0, 3))
</script>

<template>
  <article class="note-preview">
    <NuxtLink :to="`/notes/${note.id}`" class="note-preview__main">
      <div>
        <p class="note-preview__date">{{ new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(note.updatedAt)) }}</p>
        <h2>{{ note.title.trim() || 'Без названия' }}</h2>
      </div>
      <ul v-if="preview.length" class="note-preview__todos" aria-label="Превью задач">
        <li v-for="todo in preview" :key="todo.id" :class="{ done: todo.done }">
          <span aria-hidden="true" />{{ todo.text.trim() || 'Без текста' }}
        </li>
        <li v-if="note.todos.length > preview.length" class="note-preview__more">ещё {{ note.todos.length - preview.length }}</li>
      </ul>
      <p v-else class="note-preview__empty">Задач пока нет</p>
    </NuxtLink>
    <button class="note-preview__delete" type="button" :aria-label="`Удалить заметку ${note.title || 'без названия'}`" @click="emit('remove')">Удалить</button>
  </article>
</template>
