import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Change, EditingSession, Note, Todo } from '~/types/note'
import { applyChange, pushHistory } from '~/utils/history'
import { cloneNote, newNote, newTodo } from '~/utils/note'
import { clearDraft, loadDraft, loadNotes, saveDraft, saveNotes, storageKeys } from '~/utils/storage'

const TEXT_IDLE_MS = 650
let draftTimer: ReturnType<typeof setTimeout> | undefined
let textTimer: ReturnType<typeof setTimeout> | undefined

function isSameTextTarget(left: Change, right: Change): boolean {
  return left.type === right.type
    && (left.type === 'title' || (left.type === 'todo-text' && right.type === 'todo-text' && left.todoId === right.todoId))
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const hydrated = ref(false)
  const editing = ref<EditingSession | null>(null)
  const pendingText = ref<Change | null>(null)

  const sortedNotes = computed(() => [...notes.value].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
  const canUndo = computed(() => Boolean(editing.value?.undoStack.length))
  const canRedo = computed(() => Boolean(editing.value?.redoStack.length))

  function hydrate(): void {
    if (hydrated.value || !import.meta.client) return
    notes.value = loadNotes()
    hydrated.value = true
    window.addEventListener('storage', (event) => {
      if (event.key === storageKeys.NOTES_KEY) notes.value = loadNotes()
    })
  }

  function persistNotes(): void {
    saveNotes(notes.value)
  }

  function persistDraftSoon(): void {
    if (!editing.value) return
    clearTimeout(draftTimer)
    draftTimer = setTimeout(() => {
      if (!editing.value) return
      saveDraft({ version: 1, noteId: editing.value.noteId, note: cloneNote(editing.value.draft), savedAt: new Date().toISOString() })
    }, 350)
  }

  function flushPendingText(): void {
    clearTimeout(textTimer)
    if (!editing.value || !pendingText.value) return
    editing.value.undoStack = pushHistory(editing.value.undoStack, pendingText.value)
    editing.value.redoStack = []
    pendingText.value = null
    persistDraftSoon()
  }

  function applyRecorded(change: Change): void {
    if (!editing.value) return
    flushPendingText()
    editing.value.draft = applyChange(editing.value.draft, change, 'forward')
    editing.value.undoStack = pushHistory(editing.value.undoStack, change)
    editing.value.redoStack = []
    persistDraftSoon()
  }

  function applyText(change: Extract<Change, { type: 'title' | 'todo-text' }>): void {
    if (!editing.value || change.before === change.after) return
    const previous = pendingText.value
    if (previous && isSameTextTarget(previous, change)) {
      const grouped = { ...previous, after: change.after } as Change
      editing.value.draft = applyChange(editing.value.draft, grouped, 'forward')
      pendingText.value = grouped
    } else {
      flushPendingText()
      editing.value.draft = applyChange(editing.value.draft, change, 'forward')
      pendingText.value = change
    }
    clearTimeout(textTimer)
    textTimer = setTimeout(flushPendingText, TEXT_IDLE_MS)
    persistDraftSoon()
  }

  function createNote(): Note {
    hydrate()
    const note = newNote()
    notes.value = [note, ...notes.value]
    persistNotes()
    return note
  }

  function deleteNote(noteId: string): void {
    notes.value = notes.value.filter((note) => note.id !== noteId)
    persistNotes()
    if (editing.value?.noteId === noteId) cancelEditing()
  }

  function draftFor(noteId: string): Note | null {
    const draft = loadDraft()
    return draft?.noteId === noteId ? cloneNote(draft.note) : null
  }

  function startEditing(noteId: string, restoreDraft = false): boolean {
    hydrate()
    const note = notes.value.find((item) => item.id === noteId)
    if (!note) return false
    const draft = restoreDraft ? draftFor(noteId) || note : note
    editing.value = { noteId, draft: cloneNote(draft), undoStack: [], redoStack: [] }
    pendingText.value = null
    return true
  }

  function updateTitle(title: string): void {
    if (!editing.value) return
    applyText({ type: 'title', before: editing.value.draft.title, after: title })
  }

  function updateTodoText(todoId: string, text: string): void {
    const todo = editing.value?.draft.todos.find((item) => item.id === todoId)
    if (todo) applyText({ type: 'todo-text', todoId, before: todo.text, after: text })
  }

  function setTodoDone(todoId: string, done: boolean): void {
    const todo = editing.value?.draft.todos.find((item) => item.id === todoId)
    if (todo && todo.done !== done) applyRecorded({ type: 'todo-done', todoId, before: todo.done, after: done })
  }

  function addTodo(): void {
    if (!editing.value) return
    applyRecorded({ type: 'add-todo', todo: newTodo(), index: editing.value.draft.todos.length })
  }

  function removeTodo(todoId: string): void {
    if (!editing.value) return
    const index = editing.value.draft.todos.findIndex((todo) => todo.id === todoId)
    const todo = editing.value.draft.todos[index]
    if (todo && index >= 0) applyRecorded({ type: 'remove-todo', todo: { ...todo }, index })
  }

  function undo(): void {
    flushPendingText()
    if (!editing.value) return
    const change = editing.value.undoStack.pop()
    if (!change) return
    editing.value.draft = applyChange(editing.value.draft, change, 'backward')
    editing.value.redoStack = pushHistory(editing.value.redoStack, change)
    persistDraftSoon()
  }

  function redo(): void {
    flushPendingText()
    if (!editing.value) return
    const change = editing.value.redoStack.pop()
    if (!change) return
    editing.value.draft = applyChange(editing.value.draft, change, 'forward')
    editing.value.undoStack = pushHistory(editing.value.undoStack, change)
    persistDraftSoon()
  }

  function saveEditing(): boolean {
    flushPendingText()
    if (!editing.value || !notes.value.some((note) => note.id === editing.value?.noteId)) return false
    const saved = { ...cloneNote(editing.value.draft), updatedAt: new Date().toISOString() }
    notes.value = notes.value.map((note) => note.id === saved.id ? saved : note)
    persistNotes()
    cancelEditing()
    return true
  }

  function cancelEditing(): void {
    clearTimeout(textTimer)
    clearTimeout(draftTimer)
    editing.value = null
    pendingText.value = null
    clearDraft()
  }

  return {
    notes, hydrated, editing, sortedNotes, canUndo, canRedo,
    hydrate, createNote, deleteNote, draftFor, startEditing,
    updateTitle, updateTodoText, setTodoDone, addTodo, removeTodo,
    undo, redo, saveEditing, cancelEditing, flushPendingText,
  }
})
