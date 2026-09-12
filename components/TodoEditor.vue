<script setup lang="ts">
import type { Todo } from '~/types/note'

defineProps<{ todo: Todo }>()
const emit = defineEmits<{
  updateText: [value: string]
  updateDone: [value: boolean]
  remove: []
}>()
</script>

<template>
  <li class="todo-editor" :class="{ 'todo-editor--done': todo.done }">
    <input :id="`todo-${todo.id}`" class="todo-editor__check" type="checkbox" :checked="todo.done" :aria-label="`Отметить задачу: ${todo.text || 'без названия'}`" @change="emit('updateDone', ($event.target as HTMLInputElement).checked)">
    <input class="todo-editor__input" :value="todo.text" placeholder="Новая задача" aria-label="Текст задачи" @input="emit('updateText', ($event.target as HTMLInputElement).value)">
    <button class="icon-button" type="button" aria-label="Удалить задачу" @click="emit('remove')">×</button>
  </li>
</template>
