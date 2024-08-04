<template>
  <div class="row" style="border-bottom: 1px solid #efefef">
    <div class="col q-ma-sm text-h6">
      {{ tabset?.name }}
    </div>
    <div class="col text-right q-ma-sm">

      <div v-if="editMode">
        <template v-if="dirty">
          <q-btn class="cursor-pointer" @click="saveWork()"
                 icon="save" color="warning" size="sm" text-color="white" label="Save"/>
        </template>
        <template v-else>
          <!--          <q-btn  class="cursor-pointer q-mr-md" @click="newPage()"-->
          <!--                  icon="add" color="accent" size="sm" text-color="white" label="new Page..."/>-->
          <q-btn :disable="true" icon="save" color="warning" size="sm" text-color="white" label="Save"/>
        </template>
      </div>
      <div v-else>
        <!--        <q-btn class="cursor-pointer q-mr-md" @click="newPage()"-->
        <!--               icon="add" color="accent" size="sm" text-color="white" label="new Page..."/>-->
        <!--        <q-btn class="cursor-pointer q-mr-md" @click="newPage(true)"-->
        <!--               icon="add" color="accent" size="sm" text-color="white" label="new Sub-Page..."/>-->
        <q-btn class="cursor-pointer q-mr-md" @click="openInEditMode()"
               icon="edit" color="warning" size="sm" text-color="white" label="Edit"/>
        <q-btn class="cursor-pointer q-mr-md" @click="deleteNote()"
               icon="edit" color="negative" size="sm" text-color="white" label="Delete"/>
      </div>
    </div>
  </div>

  <!-- https://medium.com/code4mk-org/editorjs-vue-a78110c3fff8 -->
  <div class="q-mx-xl q-px-md">
    <div class="editorx_body">
      <div v-if="editMode">
        <q-input type="text" class="text-h6 q-ml-lg" borderless v-model="title" placeholder="title..." autofocus/>
      </div>
      <div class="text-h6 q-ml-lg" v-else>
        {{ note?.title }}
      </div>
      <div id="editorjs" ref="editorJsRef" @keyup="v => keyUpEvent()"/>
    </div>
  </div>

</template>

<script lang="ts" setup>

import 'regenerator-runtime/runtime'
import {onMounted, ref, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import {uid, useMeta} from "quasar";
import {useUtils} from "src/core/services/Utils";
import {Tabset} from "src/tabsets/models/Tabset";
//@ts-ignore
import EditorJS, {OutputData} from "@editorjs/editorjs";
//import 'regenerator-runtime/runtime'
import Analytics from "src/core/utils/google-analytics";

import EditorJsConfig from "src/notes/editorjs/EditorJsConfig";

import '../../editorjs/linkTool.css';
//@ts-ignore
import {v5 as uuidv5} from "uuid";
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";
import {Note, NoteType} from "src/notes/models/Note";
import {useNotesStore} from "src/notes/stores/NotesStore";
import {useSettingsStore} from "stores/settingsStore";

const {formatDate, sendMsg, sanitize} = useUtils()

const route = useRoute()
const router = useRouter()

const noteId = ref<string | undefined>(undefined)
const note = ref<Note | undefined>(undefined)
const tabsetId = ref<string | undefined>(route.query.tsId as string)
const tabset = ref<Tabset | undefined>(undefined)
const editMode = ref(false)
const closeOnSave = ref(false)
const title = ref('')
const originalTitle = ref('')
const editorJsRef = ref(null)
const dirty = ref(false)
const initialHash = ref<string | undefined>(undefined)

let editorJS2: EditorJS = undefined as unknown as EditorJS

useMeta(() => {
  console.debug("using meta...")
  return {
    // @ts-ignore
    title: 'Note: ' + title.value
  }
})

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelNotePage', document.location.href);
})

watchEffect(() => {
  dirty.value = dirty.value || (title.value !== originalTitle.value)
  //console.log("set to dirty", dirty.value)
  // dirty.value ? window.onbeforeunload = (e) => {
  //   return '';
  // } : window.onbeforeunload = null
})

watchEffect(async () => {
  noteId.value = route.params.noteId as unknown as string
  editMode.value = route.query.edit ? route.query.edit === "true" : false
  closeOnSave.value = route.query.closeOnSave ? route.query.edit === "true" : false

  if (noteId.value) {
    console.log("got noteId", noteId.value)

    useNotesStore().getNote(noteId.value)
      .then((n: Note) => {
        console.log("got noteId", n)
        note.value = n
        tabset.value = useTabsetsStore().getTabset(n.sourceId) as Tabset | undefined
        title.value = n.title || 'unknown'
        const json = JSON.stringify(n.content)
        console.log("tab.value.longDescription", json)
        initialHash.value = uuidv5(json, 'da42d8e8-2afd-446f-b72e-8b437aa03e46')
        console.log("initialHash", initialHash.value)
        if (!editorJS2) {
          console.log("hier", useSettingsStore().isEnabled('localMode'))
          // @ts-ignore
          editorJS2 = new EditorJS({
            holder: "editorjs",
            readOnly: !editMode.value,
            data: (n.content || {}) as OutputData,
            tools:  useSettingsStore().isEnabled('localMode') ? EditorJsConfig.toolsconfigLocal : EditorJsConfig.toolsconfig
          });
        } else {
          if (editorJS2 && editorJS2.readOnly) {
            editorJS2.readOnly.toggle(!editMode.value)
          }
        }

      })
      .catch((err: any) => {
        console.log("db not ready yet")
      })


    const tabObject = useTabsetsStore().getTabAndTabsetId(noteId.value)
    //.then((tabObject: TabAndTabsetId | undefined) => {

    //   })
  } else {
    console.log("new Note")

    if (!editorJS2) { // && !editorJS2.isReady) {
      console.log("hier2", useSettingsStore().isEnabled('localMode'))
      // @ts-ignore
      editorJS2 = new EditorJS({
        holder: "editorjs",
        autofocus: true,
        readOnly: false,
        data: {} as OutputData,
        tools:  useSettingsStore().isEnabled('localMode') ? EditorJsConfig.toolsconfigLocal : EditorJsConfig.toolsconfig
      });
    }
  }

})

const saveWork = async () => {

  console.log("saving note in tabset", tabsetId.value)

  const outputData: any = await editorJS2.save()
  //.then((outputData: any) => {
  console.log("setting original", title.value, sanitize(title.value))
  originalTitle.value = sanitize(title.value)
  if (tabsetId.value) {
    const tabset = useTabsetsStore().getTabset(tabsetId.value) as Tabset | undefined
    //console.log("tabset", tabset)
    if (tabset) { // new note

      const note = new Note(uid(), tabsetId.value, NoteType.TABSET, title.value, outputData)
      await useNotesStore().saveNote(note)
      sendMsg('note-changed', {})
      // // redirect after save
      router.push("/mainpanel/notes/" + note.id)
    }
  } else {
    //console.warn
    if (noteId.value) {
      const n: Note = await useNotesStore().getNote(noteId.value)
      n.title = title.value
      n.content = outputData
      await useNotesStore().saveNote(n)
      sendMsg('note-changed', {})

    }

  }
  // }).catch((error: any) => {
  //   console.log('Saving failed: ', error)
  // });

}

const openInEditMode = () => router.push('./' + note.value?.id + '?edit=true&tsId=' + tabsetId.value)

const deleteNote = async () => {
  await useNotesStore().deleteNote(note.value!.id)
  sendMsg('note-changed', {})
  setTimeout(() => window.close(), 500)
}

const keyUpEvent = () => {
  // editorJS2.save().then((outputData: any) => {
  //   console.log("outputData", outputData)
  //   console.log("outputData", uuidv5(JSON.stringify(outputData), 'da42d8e8-2afd-446f-b72e-8b437aa03e46'))
  //   dirty.value = uuidv5(JSON.stringify(outputData), 'da42d8e8-2afd-446f-b72e-8b437aa03e46') !== initialHash.value
  // })
  dirty.value = true
}
</script>

<style>
.editorx_body {
  max-width: 1000px;
  margin: 0px auto;
  height: 200px;
  box-sizing: border-box;
  border: 0 solid #eee;
  border-radius: 5px;
  padding: 10px;
  /* box-shadow: 0 6px 18px #e8edfa80; */
}

.ce-block__content,
.ce-toolbar__content {
  max-width: none;
}

.ce-paragraph {
  font-size: 16px;
}

/* editorjsColumns */

.ce-editorjsColumns_col {
  border: 1px solid #eee;
  border-radius: 5px;
  gap: 10px;
  padding-top: 10px;
}

.ce-editorjsColumns_col:focus-within {
  box-shadow: 0 6px 18px #e8edfa80;
}

@media (max-width: 800px) {
  .ce-editorjsColumns_wrapper {
    flex-direction: column;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}

.ce-inline-toolbar {
  z-index: 1000
}

.ce-block__content,
.ce-toolbar__content {
  max-width: calc(100% - 50px); /* example value, adjust for your own use case */
}

/*   */
.ce-toolbar__actions {
  right: calc(100% + 30px);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

/* Would be better to remove --narrow mode */
/* Issue Raised */
/* // This causes an error which is good i think? */
.codex-editor--narrow .codex-editor__redactor {
  margin: 0;
}

/* Required to prevent clipping */
.ce-toolbar {
  z-index: 4;
}

.codex-editor {
  /* background:#f00 !important; */
  z-index: auto !important;
}


</style>
