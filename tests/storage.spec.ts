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
    expect(loadDraft()?.note.title).toBe('План')
    clearDraft()
    expect(loadDraft()).toBeNull()
  })

  it('rejects a draft belonging to a different note', () => {
    localStorage.setItem(storageKeys.DRAFT_KEY, JSON.stringify({ version: 1, noteId: 'other', note, savedAt: '2026-01-01T00:01:00.000Z' }))
    expect(loadDraft()).toBeNull()
  })
})
