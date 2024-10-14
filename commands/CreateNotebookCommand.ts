import Command from "src/core/domain/Command";
import {ExecutionResult} from "src/core/domain/ExecutionResult";
import NavigationService from "src/services/NavigationService";
import {Tabset} from "src/tabsets/models/Tabset";
import {uid} from "quasar";
import {useNotesStore} from "src/notes/stores/NotesStore";
import {Notebook, NotebookType} from "src/notes/models/Notebook";
import {NotesPage} from "src/notes/models/NotesPage";

export class CreateNotebookCommand implements Command<string> {

  constructor(
    public tabset: Tabset
  ) {
  }

  async execute(): Promise<ExecutionResult<string>> {
    const newNotebook = new Notebook(uid(), this.tabset.id, NotebookType.TABSET, "Notes for " + this.tabset.name);
    const firstNote = new NotesPage(uid(), "new note", {
      blocks: [{
        "data": {"text": "new note", "level": 5},
        "type": "header"
      }]
    })
    newNotebook.subPages.push(firstNote)
    await useNotesStore().saveNotebook(newNotebook)
    //sendMsg('note-changed', {})
    //if (chrome && chrome.runtime && chrome.runtime.getURL ?
    const url = chrome.runtime.getURL("www/index.html#/mainpanel/notes/" + newNotebook.id)
    NavigationService.openOrCreateTab([url])
    return Promise.resolve(new ExecutionResult("", ""))
  }
}

CreateNotebookCommand.prototype.toString = function cmdToString() {
  return `CreateNotebookCommand: {tabsetId=${this.tabset.id}}`;
};
