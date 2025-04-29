import _ from 'lodash'
import { Notebook } from 'src/notes/models/Notebook'
import { NotesPage } from 'src/notes/models/NotesPage'

export default function useMainPanelNotePage() {
  const treeNodeFromNote = (n: NotesPage): object => {
    return {
      text: n.title,
      id: n.id,
      url:
        chrome && chrome.runtime ? chrome.runtime.getURL(`/www/index.html#/mainpanel/notes/${n.id}`) : `/xxx/${n.id}`,
      children: _.map(n.subPages, (subNote: NotesPage) => {
        return treeNodeFromNote(subNote)
      }),
    }
  }

  const executeOnSubPage = (
    subPageId: string | undefined,
    notebook: Notebook | undefined,
    fnc: (parent: Notebook | NotesPage, p: NotesPage) => NotesPage,
    tree: { parent: Notebook | NotesPage; pages: NotesPage[] } = {
      parent: notebook!,
      pages: notebook?.subPages ? notebook.subPages : [],
    },
  ): NotesPage | undefined => {
    for (const sn of tree.pages) {
      if (sn.id === subPageId) {
        return fnc(tree.parent, sn)
      }
      const found = executeOnSubPage(subPageId, notebook, fnc, { parent: sn, pages: sn.subPages })
      if (found) {
        return found
      }
    }
    console.log('not found')
    return undefined
  }

  return {
    treeNodeFromNote,
    executeOnSubPage,
  }
}
