import NotesPersistence from 'src/notes/persistence/NotesPersistence'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import FirebaseServices from 'src/services/firebase/FirebaseServices'
import { useAuthStore } from 'stores/authStore'
import { Notebook } from 'src/notes/models/Notebook'
import { NotesPage } from 'src/notes/models/NotesPage'

const STORE_IDENT = 'notes'

function noteDoc(noteId: string) {
  return doc(FirebaseServices.getFirestore(), 'users', useAuthStore().user.uid, STORE_IDENT, noteId)
}

class FirestoreNotesPersistence extends NotesPersistence {
  async init() {
    console.debug(` ...initialized notes: ${this.getServiceName()}`, '✅')
    return Promise.resolve('')
  }

  deleteNote(noteId: string): Promise<void> {
    return deleteDoc(noteDoc(noteId))
  }

  async getNotebook(notebookId: string): Promise<Notebook> {
    const note = await getDoc(noteDoc(notebookId))
    return note.data() as Notebook
  }

  getNotes(): Promise<NotesPage[]> {
    return Promise.resolve([])
  }

  async getNotesForSourceId(sourceId: string): Promise<NotesPage[]> {
    const res: NotesPage[] = []
    const cr = collection(
      FirebaseServices.getFirestore(),
      'users',
      useAuthStore().user?.uid || 'x',
      STORE_IDENT,
    )
    const r = query(cr, where('sourceId', '==', sourceId))
    const querySnapshot = await getDocs(r)
    querySnapshot.forEach((doc) => {
      //let newItem = doc.data() as Notebook
      console.warn('not yet impelmented')
      //res.push(newItem)
    })
    return res
  }

  async saveNotebook(notebook: Notebook): Promise<any> {
    await setDoc(noteDoc(notebook.id), JSON.parse(JSON.stringify(notebook)))
  }
}

export default new FirestoreNotesPersistence()
