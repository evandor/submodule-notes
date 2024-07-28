import sanitize from "sanitize-html";

export enum NoteType {
  TABSET = "TABSET"
}

export class Note {
  created: number
  sharedById: string | undefined = undefined

  constructor(
    public id: string,
    public sourceId: string,
    public type: NoteType,
    public title: string,
    public content: string
  ) {
    this.created = new Date().getTime()
    this.title = sanitize(title)
  }

}
