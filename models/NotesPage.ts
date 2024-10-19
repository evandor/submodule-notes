import sanitize from "sanitize-html";
import {OutputData} from "@editorjs/editorjs";

export class NotesPage {
  created: number
  sharedById: string | undefined = undefined
  sharedId: string | undefined = undefined

  constructor(
    public id: string,
    public title: string,
    public content: OutputData = {blocks: []},
    public subPages: NotesPage[] = []
  ) {
    this.created = new Date().getTime()
    this.title = sanitize(title)
  }

}