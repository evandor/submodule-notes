import { defineStore } from 'pinia'
import { Notebook } from 'src/notes/models/Notebook'
import NotesPersistence from 'src/notes/persistence/NotesPersistence'
import { ref } from 'vue'

export const useNotesStore = defineStore('notes', () => {
  let storage: NotesPersistence = null as unknown as NotesPersistence

  const lastUpdate = ref(0)

  async function initialize(ps: NotesPersistence) {
    storage = ps
    await storage.init()
    //metadata.value = await storage.getMetadata()
    lastUpdate.value = new Date().getTime()
    // console.debug(' ...initialized notes: Store', '✅')
  }

  async function saveNotebook(notebook: Notebook) {
    return storage.saveNotebook(notebook)
  }

  // async function getNotes(): Promise<NotesPage[]> {
  //   return storage.getNotes()
  // }

  async function getNotesFor(sourceId: string) {
    //console.log('getting notes for ', storage, sourceId)
    if (storage) {
      return storage.getNotesForSourceId(sourceId)
    }
    return Promise.resolve([])
  }

  async function getNotebookList() {
    return storage.getNotebookList()
  }

  async function getNotebook(notebookId: string) {
    return storage.getNotebook(notebookId)
  }

  async function deleteNote(noteId: string) {
    return storage.deleteNote(noteId)
  }

  return {
    initialize,
    lastUpdate,
    saveNotebook,
    getNotesFor,
    getNotebook,
    deleteNote,
    getNotebookList,
    // getNotes,
  }
})
