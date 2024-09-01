import {defineStore} from 'pinia';
import {ref} from "vue";
import {BlobMetadata, BlobType} from "src/snapshots/models/BlobMetadata";
import NotesPersistence from "src/notes/persistence/NotesPersistence";
import {Note} from "src/notes/models/Note";

export const useNotesStore = defineStore('notes', () => {

  let storage: NotesPersistence = null as unknown as NotesPersistence

  const metadata = ref<BlobMetadata[]>([])

  const lastUpdate = ref(0)

  async function initialize(ps: NotesPersistence) {
    storage = ps
    await storage.init()
    //metadata.value = await storage.getMetadata()
    lastUpdate.value = new Date().getTime()
    console.debug(" ...initialized notes: Store",'✅')
  }

  async function saveNote(note: Note) {
    return storage.saveNote(note)
  }

  async function getNotesFor(sourceId: string) {
    if (storage) {
      return storage.getNotesForSourceId(sourceId)
    }
    return Promise.resolve([])
  }

  async function getNote(noteId: string) {
    return storage.getNote(noteId)
  }

  async function deleteNote(noteId: string) {
    return storage.deleteNote(noteId)
  }

  return {
    initialize,
    lastUpdate,
    saveNote,
    getNotesFor,
    getNote,
    deleteNote
  }
})
