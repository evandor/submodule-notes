import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { Notebook } from 'src/notes/models/Notebook'
import { NotesPage } from 'src/notes/models/NotesPage'
import NotesPersistence from 'src/notes/persistence/NotesPersistence'
import FirebaseServices from 'src/services/firebase/FirebaseServices'
import { useTabsetsStore } from 'src/tabsets/stores/tabsetsStore'
import { useAuthStore } from 'stores/authStore'

const STORE_IDENT = 'notes'

function noteDoc(noteId: string, sharedById: string | undefined = undefined) {
  const notePath = `users/${sharedById ? sharedById : useAuthStore().user.uid}/${STORE_IDENT}/${noteId}`
  console.log('notePath', notePath)
  return doc(FirebaseServices.getFirestore(), notePath)
}

class FirestoreNotesPersistence extends NotesPersistence {
  async init() {
    // console.debug(` ...initialized notes: ${this.getServiceName()}`, '✅')
    return Promise.resolve('')
  }

  deleteNote(noteId: string): Promise<void> {
    return deleteDoc(noteDoc(noteId))
  }

  async getNotebook(notebookId: string): Promise<Notebook> {
    const sharedById = useTabsetsStore().getCurrentTabset?.sharing.sharedById
    console.log('firebase: get note for', useTabsetsStore().getCurrentTabset?.id, sharedById)
    const note = await getDoc(noteDoc(notebookId, sharedById))
    return note.data() as Notebook
  }

  getNotes(): Promise<NotesPage[]> {
    return Promise.resolve([])
  }

  async getNotesForSourceId(sourceId: string): Promise<NotesPage[]> {
    const sharedById = useTabsetsStore().getTabset(sourceId)?.sharing.sharedById
    const userId: string = sharedById ? sharedById : useAuthStore().user?.uid
    const res: NotesPage[] = []
    const cr = collection(FirebaseServices.getFirestore(), `users/${userId}/${STORE_IDENT}`)
    const r = query(cr, where('sourceId', '==', sourceId))
    const querySnapshot = await getDocs(r)
    //console.log('querying', querySnapshot)
    querySnapshot.forEach((doc) => {
      let newItem = doc.data() as NotesPage
      //console.warn('not yet impelmented', doc.data())
      res.push(newItem)
    })
    return res
  }

  async saveNotebook(notebook: Notebook): Promise<any> {
    await setDoc(noteDoc(notebook.id), JSON.parse(JSON.stringify(notebook)))
  }

  getNotebookList(): Promise<Notebook[]> {
    console.log('not implemented')
    return Promise.resolve([])
  }
}

export default new FirestoreNotesPersistence()
