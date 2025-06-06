import Persistence from 'src/core/persistence/Persistence'
import { Notebook } from 'src/notes/models/Notebook'
import { NotesPage } from 'src/notes/models/NotesPage'

abstract class NotesPersistence implements Persistence {
  getServiceName(): string {
    return this.constructor.name
  }

  abstract init(): Promise<any>

  abstract getNotebookList(): Promise<Notebook[]>

  abstract getNotebook(notebookId: string): Promise<Notebook>

  abstract getNotesForSourceId(sourceId: string): Promise<NotesPage[]>

  abstract deleteNote(noteId: string): Promise<void>

  abstract saveNotebook(notebook: Notebook): Promise<any>

  abstract getNotes(): Promise<NotesPage[]>

  compactDb(): Promise<any> {
    return Promise.resolve('noOp')
  }
}

export default NotesPersistence
