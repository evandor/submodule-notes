import { Notebook } from 'src/notes/models/Notebook'
import { NotesPage } from 'src/notes/models/NotesPage'
import useMainPanelNotePage from 'src/notes/pages/mainpanel/mainPanelNotePage'
import { useNotesStore } from 'src/notes/stores/NotesStore'

export default function useNotesServices() {
  const { executeOnSubPage } = useMainPanelNotePage()

  const loadNotebookAndPage = async (
    notebookId: string,
    subNoteId: string | undefined,
  ): Promise<{ nb: Notebook; title: string; subNote: NotesPage | undefined }> => {
    const n: Notebook = await useNotesStore().getNotebook(notebookId)
    console.log('got noteId', n)
    let subNote = undefined
    if (subNoteId) {
      subNote = getSubNote(subNoteId, n)
      // console.log('got subnote from ', subNoteId, subNote)
    } else {
      subNote = n.subPages[0]
      // console.log('got first entry', n!.subPages, subNote)
    }

    // notebook.value = n!
    const title = subNote?.title || 'unknown'
    return Promise.resolve({ nb: n, title, subNote })
  }

  const getSubNote = (snId: string | undefined, notebook: Notebook | undefined): NotesPage | undefined => {
    if (snId) {
      console.log('got subNoteId', snId)
      return executeOnSubPage(snId, notebook, (parent: Notebook | NotesPage, p: NotesPage) => p)
    }
    return undefined
  }

  return {
    loadNotebookAndPage,
    getSubNote,
  }
}
