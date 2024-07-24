import Persistence from "src/core/persistence/Persistence";
import {Note} from "src/notes/models/Note";

interface NotesPersistence extends Persistence {

  getNote(noteId: string): Promise<Note>

  getNotesForSourceId(sourceId: string): Promise<Note[]>

  deleteNote(noteId: string): Promise<void>

  saveNote(Note: Note): Promise<any>

  getNotes(): Promise<Note[]>

}

export default NotesPersistence;
