import NotesPersistence from "src/notes/persistence/NotesPersistence";
import {Note} from "src/notes/models/Note";
import {collection, doc, getDoc, getDocs, query, setDoc, where, deleteDoc} from "firebase/firestore";
import FirebaseServices from "src/services/firebase/FirebaseServices";
import {useAuthStore} from "stores/authStore";
import {BlobMetadata} from "src/snapshots/models/BlobMetadata";

const STORE_IDENT = 'notes';

function noteDoc(noteId: string) {
  return doc(FirebaseServices.getFirestore(), "users", useAuthStore().user.uid, STORE_IDENT, noteId)
}

class FirestoreNotesPersistence extends NotesPersistence {

  async init() {
    console.debug(` ...initialized notes: ${this.getServiceName()}`,'✅' )
    return Promise.resolve("")
  }

  deleteNote(noteId: string): Promise<void> {
    return deleteDoc(noteDoc(noteId))
  }

  async getNote(noteId: string): Promise<Note> {
    const note = await getDoc(noteDoc(noteId))
    return note.data() as Note
  }

  getNotes(): Promise<Note[]> {
    return Promise.resolve([]);
  }

  async getNotesForSourceId(sourceId: string): Promise<Note[]> {
    const res: Note[] = []
    const cr = collection(FirebaseServices.getFirestore(), "users", useAuthStore().user?.uid || 'x', STORE_IDENT)
    const r = query(cr, where("sourceId", "==", sourceId))
    const querySnapshot = await getDocs(r);
    querySnapshot.forEach((doc) => {
      let newItem = doc.data() as Note
      res.push(newItem)
    });
    return res
  }

  async saveNote(note: Note): Promise<any> {
    await setDoc(noteDoc(note.id), JSON.parse(JSON.stringify(note)))
  }

}

export default new FirestoreNotesPersistence()
