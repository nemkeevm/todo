import type { Note, Todo } from '~/types/note'

export const cloneNote = (note: Note): Note => ({
  ...note,
  todos: note.todos.map((todo) => ({ ...todo })),
})

export const createId = (): string => {
  if (import.meta.client && typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const newTodo = (): Todo => ({ id: createId(), text: '', done: false })

export const newNote = (): Note => {
  const now = new Date().toISOString()
  return { id: createId(), title: '', todos: [newTodo()], createdAt: now, updatedAt: now }
}
