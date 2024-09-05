import {IDBPDatabase, openDB} from "idb";
import NotesPersistence from "src/notes/persistence/NotesPersistence";
import {Note} from "src/notes/models/Note";

class IndexedDbNotesPersistence extends NotesPersistence {

  private STORE_IDENT = 'notes';

  private db: IDBPDatabase = null as unknown as IDBPDatabase

  async init() {
    this.db = await this.initDatabase()
    console.debug(` ...initialized Note: ${this.getServiceName()}`, '✅')
    return Promise.resolve()
  }

  private async initDatabase(): Promise<IDBPDatabase> {
    const ctx = this
    return await openDB("notesDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(ctx.STORE_IDENT)) {
          console.log("creating db " + ctx.STORE_IDENT)
          let store = db.createObjectStore(ctx.STORE_IDENT);
          store.createIndex("sourceId", "sourceId", {unique: false});
        }
      }
    });
  }

  override compactDb(): Promise<any> {
    return Promise.resolve(undefined);
  }

  deleteNote(noteId: string): Promise<void> {
    return this.db.delete(this.STORE_IDENT, noteId)
  }

  getNote(noteId: string): Promise<Note> {
    if (this.db) {
      return this.db.get(this.STORE_IDENT, noteId)
    }
    return Promise.reject("db not ready (yet)")
  }

  getNotesForSourceId(sourceId: string): Promise<Note[]> {
    if (this.db) {
      return this.db.getAllFromIndex(this.STORE_IDENT, 'sourceId', sourceId)
    }
    return Promise.reject("db not ready (yet)")
  }

  getNotes(): Promise<Note[]> {
    return this.db.getAll(this.STORE_IDENT);
  }

  async saveNote(note: Note): Promise<any> {
    console.log("saving note", note)
    return await this.db.put(this.STORE_IDENT, note, note.id)
  }

}

export default new IndexedDbNotesPersistence()
