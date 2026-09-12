import type { Note, StoredDraft, StoredNotes } from '~/types/note'

const NOTES_KEY = 'todo:notes'
const DRAFT_KEY = 'todo:draft'
const isBrowser = (): boolean => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

function read<T>(key: string): T | null {
  if (!isBrowser()) return null
  try { return JSON.parse(localStorage.getItem(key) || 'null') as T | null } catch { return null }
}

function isNote(value: unknown): value is Note {
  if (!value || typeof value !== 'object') return false
  const note = value as Partial<Note>
  return typeof note.id === 'string'
    && typeof note.title === 'string'
    && typeof note.createdAt === 'string'
    && typeof note.updatedAt === 'string'
    && Array.isArray(note.todos)
    && note.todos.every((todo) => todo && typeof todo.id === 'string' && typeof todo.text === 'string' && typeof todo.done === 'boolean')
}

export function loadNotes(): Note[] {
  const payload = read<StoredNotes>(NOTES_KEY)
  return payload?.version === 1 && Array.isArray(payload.notes) && payload.notes.every(isNote) ? payload.notes : []
}

export function saveNotes(notes: Note[]): void {
  if (isBrowser()) localStorage.setItem(NOTES_KEY, JSON.stringify({ version: 1, notes } satisfies StoredNotes))
}

export function loadDraft(): StoredDraft | null {
  const draft = read<StoredDraft>(DRAFT_KEY)
  return draft?.version === 1 && draft.noteId === draft.note?.id && isNote(draft.note) && typeof draft.savedAt === 'string' ? draft : null
}

export function saveDraft(draft: StoredDraft): void {
  if (isBrowser()) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export function clearDraft(): void {
  if (isBrowser()) localStorage.removeItem(DRAFT_KEY)
}

export const storageKeys = { NOTES_KEY, DRAFT_KEY }
