import type { Note, StoredDraft, StoredNotes } from '~/types/note'

const NOTES_KEY = 'todo:notes'
const DRAFT_KEY_PREFIX = 'todo:draft:'
const LEGACY_DRAFT_KEY = 'todo:draft'
const isBrowser = (): boolean => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

const draftKey = (noteId: string): string => `${DRAFT_KEY_PREFIX}${noteId}`

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

function isDraft(value: StoredDraft | null, noteId: string): value is StoredDraft {
  return value?.version === 1 && value.noteId === noteId && value.noteId === value.note?.id && isNote(value.note) && typeof value.savedAt === 'string'
}

export function loadDraft(noteId: string): StoredDraft | null {
  const stored = read<StoredDraft>(draftKey(noteId))
  if (isDraft(stored, noteId)) return stored

  const legacy = read<StoredDraft>(LEGACY_DRAFT_KEY)
  if (!isDraft(legacy, noteId)) return null
  saveDraft(legacy)
  if (isBrowser()) localStorage.removeItem(LEGACY_DRAFT_KEY)
  return legacy
}

export function saveDraft(draft: StoredDraft): void {
  if (isBrowser()) localStorage.setItem(draftKey(draft.noteId), JSON.stringify(draft))
}

export function clearDraft(noteId: string): void {
  if (isBrowser()) localStorage.removeItem(draftKey(noteId))
}

export const storageKeys = { NOTES_KEY, LEGACY_DRAFT_KEY, draftKey }
