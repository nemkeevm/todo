import { beforeEach, describe, expect, it } from 'vitest'
import type { Note } from '~/types/note'
import { clearDraft, loadDraft, loadNotes, saveDraft, saveNotes, storageKeys } from '~/utils/storage'

const note: Note = {
  id: 'n1', title: 'План', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  todos: [{ id: 't1', text: 'Сделать', done: false }],
}

describe('browser storage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips versioned notes', () => {
    saveNotes([note])
    expect(loadNotes()).toEqual([note])
    expect(JSON.parse(localStorage.getItem(storageKeys.NOTES_KEY) || '{}')).toMatchObject({ version: 1 })
  })

  it('safely ignores corrupt and incompatible note payloads', () => {
    localStorage.setItem(storageKeys.NOTES_KEY, '{not valid JSON')
    expect(loadNotes()).toEqual([])
    localStorage.setItem(storageKeys.NOTES_KEY, JSON.stringify({ version: 2, notes: [note] }))
    expect(loadNotes()).toEqual([])
    localStorage.setItem(storageKeys.NOTES_KEY, JSON.stringify({ version: 1, notes: [{ id: 'incomplete' }] }))
    expect(loadNotes()).toEqual([])
  })

  it('persists and clears a valid editing draft', () => {
    saveDraft({ version: 1, noteId: note.id, note, savedAt: '2026-01-01T00:01:00.000Z' })
    expect(loadDraft(note.id)?.note.title).toBe('План')
    clearDraft(note.id)
    expect(loadDraft(note.id)).toBeNull()
  })

  it('rejects a draft belonging to a different note', () => {
    localStorage.setItem(storageKeys.draftKey('other'), JSON.stringify({ version: 1, noteId: 'other', note, savedAt: '2026-01-01T00:01:00.000Z' }))
    expect(loadDraft(note.id)).toBeNull()
  })

  it('keeps independent drafts for different notes', () => {
    const second = { ...note, id: 'n2', title: 'Вторая заметка' }
    saveDraft({ version: 1, noteId: note.id, note, savedAt: '2026-01-01T00:01:00.000Z' })
    saveDraft({ version: 1, noteId: second.id, note: second, savedAt: '2026-01-01T00:02:00.000Z' })

    expect(loadDraft(note.id)?.note.title).toBe('План')
    expect(loadDraft(second.id)?.note.title).toBe('Вторая заметка')
    clearDraft(note.id)
    expect(loadDraft(second.id)).not.toBeNull()
  })

  it('migrates a matching legacy draft once', () => {
    const legacy = { version: 1 as const, noteId: note.id, note, savedAt: '2026-01-01T00:01:00.000Z' }
    localStorage.setItem(storageKeys.LEGACY_DRAFT_KEY, JSON.stringify(legacy))

    expect(loadDraft(note.id)).toEqual(legacy)
    expect(localStorage.getItem(storageKeys.LEGACY_DRAFT_KEY)).toBeNull()
    expect(localStorage.getItem(storageKeys.draftKey(note.id))).not.toBeNull()
  })
})
