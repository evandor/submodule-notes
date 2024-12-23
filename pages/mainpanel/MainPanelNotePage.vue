<template>
  <!-- MainPanelNotePage -->
  <q-page style="padding-top: 50px">
    <div class="row">
      <div class="col-2 q-mt-lg">
        <Draggable
          v-if="treeData"
          class="mtl-tree q-pl-md"
          v-model="treeData"
          treeLine
          :tree-line-offset="0"
        >
          <template #default="{ node, stat }">
            <OpenIcon
              v-if="stat.children.length"
              :open="stat.open"
              class="mtl-mr"
              @click.native="stat.open = !stat.open"
            />
            <span class="mtl-ml cursor-pointer" @click="openSubNote(node)">{{ node.text }}</span>
          </template>
        </Draggable>
      </div>
      <div class="col-8">
        <div class="editorx_body">
          <!-- https://medium.com/code4mk-org/editorjs-vue-a78110c3fff8 -->
          <div id="editorjs" ref="editorJsRef" @keyup="(v) => keyUpEvent()" />
        </div>
        <div>
          <Transition
            appear
            enter-active-class="animated fadeIn slower delay-5s"
            leave-active-class="animated fadeOut"
          >
            <div>
              <q-btn v-if="dirty" label="save" class="q-mr-sm q-px-sm" dense @click="saveWork()" />
              <q-btn
                v-if="!dirty"
                label="new Subpage"
                class="q-mr-sm q-px-sm"
                dense
                @click="newSubPage()"
              />
              <q-btn label="Delete this page" class="q-mr-sm q-mx-sm" dense @click="deletePage()" />
            </div>
          </Transition>
        </div>

        <!--        <ul>-->
        <!--          <li v-for="p of notebook?.subPages">{{ p }}</li>-->
        <!--        </ul>-->
      </div>
      <div class="col-2"></div>
    </div>

    <q-page-sticky
      expand
      position="top"
      class="darkInDarkMode brightInBrightMode"
      style="width: 100%"
    >
      <div class="row" style="border-bottom: 1px solid #efefef; width: 100%">
        <div class="col q-ma-sm text-h5 cursor-pointer">
          {{ notebook?.title }}
          <q-popup-edit
            :model-value="notebook?.title"
            v-slot="scope"
            @update:model-value="(val: string) => setNotebookTitle(val)"
          >
            <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
          </q-popup-edit>
        </div>
        <div class="col text-right q-ma-sm">
          <q-btn v-if="dirty" class="q-mr-md" label="save" size="sm" @click="saveWork()" />
          <q-btn
            class="cursor-pointer"
            @click="newPage()"
            :disable="dirty"
            icon="add"
            size="sm"
            label="New Page"
          />
        </div>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts" setup>
import 'regenerator-runtime/runtime'
import { onMounted, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { uid, useMeta } from 'quasar'
import { useUtils } from 'src/core/services/Utils'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import Analytics from 'src/core/utils/google-analytics'

import EditorJsConfig from 'src/notes/editorjs/EditorJsConfig'

import '../../editorjs/linkTool.css'
import { NotesPage } from 'src/notes/models/NotesPage'
import { useNotesStore } from 'src/notes/stores/NotesStore'
import { useSettingsStore } from 'src/stores/settingsStore'
import { Draggable, OpenIcon } from '@he-tree/vue'
import '@he-tree/vue/style/default.css'
import _ from 'lodash'
import { Notebook } from 'src/notes/models/Notebook'

const { sendMsg, sanitize } = useUtils()

const route = useRoute()

const notebookId = ref<string>(route.params.notebookId as unknown as string)
const notebook = ref<Notebook | undefined>(undefined)

const subNoteId = ref<string | undefined>(route.params.subNoteId as unknown as string)
const subNote = ref<NotesPage | undefined>(undefined)

const editMode = ref(true)
const title = ref('')
const editorJsRef = ref(null)
const dirty = ref(false)
const treeData = ref<object[]>()

let editorJS2: EditorJS = undefined as unknown as EditorJS

function treeNodeFromNote(n: NotesPage): object {
  return {
    text: n.title,
    id: n.id,
    url: chrome.runtime.getURL(`/www/index.html#/mainpanel/notes/${n.id}`),
    children: _.map(n.subPages, (subNote: NotesPage) => {
      return treeNodeFromNote(subNote)
    }),
  }
}

function executeOnSubPage(
  subPageId: string | undefined,
  fnc: (parent: Notebook | NotesPage, p: NotesPage) => NotesPage,
  tree: { parent: Notebook | NotesPage; pages: NotesPage[] } = {
    parent: notebook.value!,
    pages: notebook.value!.subPages,
  },
): NotesPage | undefined {
  for (const sn of tree.pages) {
    if (sn.id === subPageId) {
      return fnc(tree.parent, sn)
    }
    const found = executeOnSubPage(subPageId, fnc, { parent: sn, pages: sn.subPages })
    if (found) {
      return found
    }
  }
  console.log('not found')
  return undefined
}

watchEffect(async () => {
  if (notebook.value) {
    treeData.value = _.map(notebook.value.subPages, (n: NotesPage) => {
      return treeNodeFromNote(n)
    })
  }
})

useMeta(() => {
  return {
    title: 'Note: ' + title.value,
  }
})

onMounted(() => {
  Analytics.firePageViewEvent('MainPanelNotePage', document.location.href)
})

watchEffect(() => (dirty.value = editMode.value && dirty.value))

const loadNotebookAndPage = (notebookId: string, subNoteId: string | undefined) => {
  useNotesStore()
    .getNotebook(notebookId)
    .then((n: Notebook) => {
      console.log('got noteId', n)
      if (subNoteId) {
        subNote.value = getSubNote(subNoteId)
        console.log('got subnote from ', subNoteId, subNote.value)
      } else {
        subNote.value = n.subPages[0]
        console.log('got first entry', n.subPages, subNote.value)
      }

      notebook.value = n
      //tabset.value = useTabsetsStore().getTabset(n.sourceId) as Tabset | undefined
      title.value = subNote.value?.title || 'unknown'

      if (!editorJS2) {
        console.log('hier', useSettingsStore().isEnabled('localMode'))
        editorJS2 = new EditorJS({
          holder: 'editorjs',
          readOnly: !editMode.value,
          data: (subNote.value!.content || { blocks: [] }) as OutputData,
          tools: useSettingsStore().isEnabled('localMode')
            ? EditorJsConfig.toolsconfigLocal
            : EditorJsConfig.toolsconfig,
        })
      } else {
        if (editorJS2 && editorJS2.readOnly) {
          editorJS2.readOnly.toggle(!editMode.value)
        }
      }
    })
    .catch((err: any) => {
      console.log('db not ready yet, reloading...', err)
      setTimeout(() => loadNotebookAndPage(notebookId, subNoteId), 500)
    })
}

console.log('route.params.noteId as unknown as string', route.params.noteId as unknown as string)
loadNotebookAndPage(notebookId.value!, subNoteId.value)

watchEffect(async () => {
  if (!notebookId.value) {
    console.log('new Note')

    if (!editorJS2) {
      // && !editorJS2.isReady) {
      console.log('hier2', useSettingsStore().isEnabled('localMode'))
      editorJS2 = new EditorJS({
        holder: 'editorjs',
        autofocus: true,
        readOnly: false,
        data: { blocks: [] } as OutputData,
        tools: useSettingsStore().isEnabled('localMode')
          ? EditorJsConfig.toolsconfigLocal
          : EditorJsConfig.toolsconfig,
      })
    }
  }
})

const newPage = async () => {
  const newPage = new NotesPage(uid(), 'new page', { blocks: [] } as unknown as OutputData)
  //addSubNote(newSubNote)
  notebook.value!.subPages.push(newPage)
  await useNotesStore().saveNotebook(notebook.value!)
}

const newSubPage = async () => {
  executeOnSubPage(subNote.value?.id, (parent: Notebook | NotesPage, p: NotesPage) => {
    p.subPages.push(
      new NotesPage(uid(), 'subpage', {
        blocks: [
          {
            data: { text: 'subpage', level: 5 },
            type: 'header',
          },
        ],
      }),
    )
    return p
  })
  await useNotesStore().saveNotebook(notebook.value!)
}

const deletePage = async () => {
  executeOnSubPage(subNote.value?.id, (parent: Notebook | NotesPage, p: NotesPage) => {
    parent.subPages = _.filter(parent.subPages, (sp: NotesPage) => sp.id !== subNote.value?.id)
    return p
  })
  await useNotesStore().saveNotebook(notebook.value!)
}

const saveWork = async () => {
  console.log('saving note in tabset', notebookId.value, subNote.value?.id)

  const outputData: OutputData = await editorJS2.save()

  const subpage = executeOnSubPage(
    subNote.value?.id,
    (parent: Notebook | NotesPage, p: NotesPage) => p,
  )
  if (subpage) {
    subpage.content = outputData
    if (subpage.content && subpage.content.blocks.length > 0) {
      if (subpage.content.blocks[0]!.type === 'header') {
        subpage.title = sanitize(subpage.content.blocks[0]!.data.text)
      }
    }
  }

  //console.log("setting original", title.value, sanitize(title.value))

  //const n: Notebook = await useNotesStore().getNotebook(notebookId.value)
  // if (subNote.value) {
  //   subNote.value.title = title.value
  //   subNote.value.content = outputData
  // } else {
  //   .title = title.value
  //   //n.content = outputData
  //   //notebook.value = n
  // }
  await useNotesStore().saveNotebook(notebook.value!)
  sendMsg('note-changed', {})
  dirty.value = false
}

// const deleteNote = async () => {
//   await useNotesStore().deleteNote(note.value!.id)
//   sendMsg('note-changed', {})
//   setTimeout(() => window.close(), 500)
// }

const keyUpEvent = () => {
  dirty.value = true
}

const openSubNote = (n: { text: string; id: string; url: string; children: object[] }) => {
  subNoteId.value = n.id
  subNote.value = getSubNote(n.id)
  if (subNote.value) {
    var newContent = (subNote.value.content || { blocks: [] }) as OutputData
    console.log('newContent', newContent)
    //editorJS2.data = newContent
    title.value = subNote.value.title
    editorJS2.render(newContent)
  }
}

const getSubNote = (snId: string | undefined): NotesPage | undefined => {
  if (snId) {
    console.log('got subNoteId', snId)
    const subPage = executeOnSubPage(snId, (parent: Notebook | NotesPage, p: NotesPage) => p)
    return subPage // findSubPage(notebook.value!.subPages, snId)
  }
  return undefined
}

const setNotebookTitle = (newTitle: string) => {
  if (notebook.value) {
    notebook.value.title = sanitize(newTitle)
    useNotesStore().saveNotebook(notebook.value)
    sendMsg('note-changed', { notebookId: notebookId.value, tabsetId: notebook.value.sourceId })
  }
}
</script>

<style src="./mainpanelnotepage.css"></style>
