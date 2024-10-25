import sanitize from "sanitize-html";
import {OutputData} from "@editorjs/editorjs";
import {NotesPage} from "src/notes/models/NotesPage";

export enum NotebookType {
  TABSET = "TABSET"
}

export class Notebook {
  created: number
  sharedById: string | undefined = undefined
  sharedId: string | undefined = undefined

  constructor(
    public id: string,
    public sourceId: string,
    public type: NotebookType,
    public title: string,
    public subPages: NotesPage[] = []
  ) {
    this.created = new Date().getTime()
    this.title = sanitize(title)
  }

}
