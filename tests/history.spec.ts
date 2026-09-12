import { describe, expect, it } from 'vitest'
import { applyChange, HISTORY_LIMIT, pushHistory } from '~/utils/history'
import type { Change, Note } from '~/types/note'

const note: Note = {
  id: 'note', title: 'Original', createdAt: '', updatedAt: '',
  todos: [{ id: 'todo', text: 'Read', done: false }],
}

describe('history operations', () => {
  it('applies and reverses scalar changes immutably', () => {
    const change: Change = { type: 'todo-text', todoId: 'todo', before: 'Read', after: 'Write' }
    const changed = applyChange(note, change, 'forward')
    expect(changed.todos[0]?.text).toBe('Write')
    expect(applyChange(changed, change, 'backward')).toEqual(note)
    expect(note.todos[0]?.text).toBe('Read')
  })

  it('reverses add and removal operations', () => {
    const change: Change = { type: 'add-todo', todo: { id: 'new', text: 'Ship', done: false }, index: 1 }
    const afterAdd = applyChange(note, change, 'forward')
    expect(afterAdd.todos).toHaveLength(2)
    expect(applyChange(afterAdd, change, 'backward')).toEqual(note)
  })

  it('keeps only the last 50 operations', () => {
    const changes = Array.from({ length: HISTORY_LIMIT + 4 }, (_, index) => ({ type: 'title' as const, before: `${index}`, after: `${index + 1}` }))
    const history = changes.reduce(pushHistory, [] as Change[])
    expect(history).toHaveLength(HISTORY_LIMIT)
    expect(history[0]).toMatchObject({ type: 'title', before: '4' })
  })
})
