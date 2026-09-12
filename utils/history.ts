import type { Change, Note } from '~/types/note'
import { cloneNote } from './note'

export const HISTORY_LIMIT = 50

export function applyChange(note: Note, change: Change, direction: 'forward' | 'backward'): Note {
  const next = cloneNote(note)
  const value = direction === 'forward' ? 'after' : 'before'

  if (change.type === 'title') next.title = change[value]
  if (change.type === 'todo-text') {
    const todo = next.todos.find((item) => item.id === change.todoId)
    if (todo) todo.text = change[value]
  }
  if (change.type === 'todo-done') {
    const todo = next.todos.find((item) => item.id === change.todoId)
    if (todo) todo.done = change[value]
  }
  if (change.type === 'add-todo') {
    if (direction === 'forward') next.todos.splice(change.index, 0, { ...change.todo })
    else next.todos = next.todos.filter((todo) => todo.id !== change.todo.id)
  }
  if (change.type === 'remove-todo') {
    if (direction === 'forward') next.todos = next.todos.filter((todo) => todo.id !== change.todo.id)
    else next.todos.splice(change.index, 0, { ...change.todo })
  }
  return next
}

export function pushHistory(stack: Change[], change: Change): Change[] {
  return [...stack, change].slice(-HISTORY_LIMIT)
}
