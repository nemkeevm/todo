import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Note } from '~/types/note'
import { useNotesStore } from '~/stores/notes'

const note: Note = {
  id: 'n1', title: 'Исходное', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  todos: [{ id: 't1', text: 'Первая задача', done: false }],
}

describe('notes store editing session', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function openSession() {
    const store = useNotesStore()
    store.notes = [structuredClone(note)]
    expect(store.startEditing(note.id)).toBe(true)
    return store
  }

  it('keeps changes isolated until explicit save', () => {
    const store = openSession()
    store.updateTitle('Черновик')
    store.flushPendingText()

    expect(store.editing?.draft.title).toBe('Черновик')
    expect(store.notes[0]?.title).toBe('Исходное')

    expect(store.saveEditing()).toBe(true)
    expect(store.notes[0]?.title).toBe('Черновик')
    expect(store.editing).toBeNull()
  })

  it('undoes and redoes a grouped text change', () => {
    const store = openSession()
    store.updateTodoText('t1', 'Первая')
    store.updateTodoText('t1', 'Первая готова')
    store.flushPendingText()

    expect(store.editing?.undoStack).toHaveLength(1)
    store.undo()
    expect(store.editing?.draft.todos[0]?.text).toBe('Первая задача')
    expect(store.canRedo).toBe(true)

    store.redo()
    expect(store.editing?.draft.todos[0]?.text).toBe('Первая готова')
    store.cancelEditing()
  })

  it('clears redo after a new action and handles todo operations atomically', () => {
    const store = openSession()
    store.setTodoDone('t1', true)
    store.undo()
    expect(store.canRedo).toBe(true)

    store.addTodo()
    expect(store.canRedo).toBe(false)
    expect(store.editing?.draft.todos).toHaveLength(2)

    const addedId = store.editing?.draft.todos[1]?.id
    if (!addedId) throw new Error('Expected a new todo')
    store.removeTodo(addedId)
    expect(store.editing?.draft.todos).toHaveLength(1)
    store.undo()
    expect(store.editing?.draft.todos).toHaveLength(2)
    store.cancelEditing()
  })
})
