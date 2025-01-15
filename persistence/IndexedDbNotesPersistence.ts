import { IDBPDatabase, openDB } from 'idb'
import { Notebook } from 'src/notes/models/Notebook'
import { NotesPage } from 'src/notes/models/NotesPage'
import NotesPersistence from 'src/notes/persistence/NotesPersistence'

class IndexedDbNotesPersistence extends NotesPersistence {
  private STORE_IDENT = 'notebooks'

  private db: IDBPDatabase = null as unknown as IDBPDatabase

  async init() {
    this.db = await this.initDatabase()
    // console.debug(` ...initialized Note: ${this.getServiceName()}`, '✅')
    return Promise.resolve()
  }

  private async initDatabase(): Promise<IDBPDatabase> {
    const ctx = this
    return await openDB('notesDB', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(ctx.STORE_IDENT)) {
          console.log('creating db ' + ctx.STORE_IDENT)
          let store = db.createObjectStore(ctx.STORE_IDENT)
          store.createIndex('sourceId', 'sourceId', { unique: false })
        }
      },
    })
  }

  override compactDb(): Promise<any> {
    return Promise.resolve(undefined)
  }

  deleteNote(noteId: string): Promise<void> {
    return this.db.delete(this.STORE_IDENT, noteId)
  }

  getNotebookList(): Promise<Notebook[]> {
    if (this.db) {
      // TODO get only relevant parts, not the whole object
      return this.db.getAll(this.STORE_IDENT)
    }
    return Promise.reject('db not ready (yet)')
  }

  getNotebook(notebookId: string): Promise<Notebook> {
    if (this.db) {
      return this.db.get(this.STORE_IDENT, notebookId)
    }
    return Promise.reject('db not ready (yet)')
  }

  getNotesForSourceId(sourceId: string): Promise<NotesPage[]> {
    if (this.db) {
      return this.db.getAllFromIndex(this.STORE_IDENT, 'sourceId', sourceId)
    }
    return Promise.reject('db not ready (yet)')
  }

  getNotes(): Promise<NotesPage[]> {
    return this.db.getAll(this.STORE_IDENT)
  }

  async saveNotebook(notebook: Notebook): Promise<any> {
    console.log('saving notebook', notebook)
    return await this.db.put(this.STORE_IDENT, JSON.parse(JSON.stringify(notebook)), notebook.id)
  }
}

export default new IndexedDbNotesPersistence()
