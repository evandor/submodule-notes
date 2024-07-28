import Persistence from "src/core/persistence/Persistence";
import {Note} from "src/notes/models/Note";

abstract class NotesPersistence implements Persistence {

  getServiceName(): string {
    return this.constructor.name
  }

  abstract init(): Promise<any>

  abstract getNote(noteId: string): Promise<Note>

  abstract getNotesForSourceId(sourceId: string): Promise<Note[]>

  abstract deleteNote(noteId: string): Promise<void>

  abstract saveNote(Note: Note): Promise<any>

  abstract getNotes(): Promise<Note[]>

  compactDb(): Promise<any> {
    return Promise.resolve("noOp");
  }

}

export default NotesPersistence;
