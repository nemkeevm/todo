export interface Todo {
  id: string
  text: string
  done: boolean
}

export interface Note {
  id: string
  title: string
  todos: Todo[]
  createdAt: string
  updatedAt: string
}

export interface StoredNotes {
  version: 1
  notes: Note[]
}

export interface StoredDraft {
  version: 1
  noteId: string
  note: Note
  savedAt: string
}

export type Change =
  | { type: 'title'; before: string; after: string }
  | { type: 'todo-text'; todoId: string; before: string; after: string }
  | { type: 'todo-done'; todoId: string; before: boolean; after: boolean }
  | { type: 'add-todo'; todo: Todo; index: number }
  | { type: 'remove-todo'; todo: Todo; index: number }

export interface EditingSession {
  noteId: string
  draft: Note
  undoStack: Change[]
  redoStack: Change[]
}
