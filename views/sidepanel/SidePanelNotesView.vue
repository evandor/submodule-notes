<template>
  <q-list :separator="false">
    <q-item v-for="note in notes" @click="openNote(note)" clickable v-ripple class="q-ma-none q-pa-sm">
      <q-item-section class="q-mx-sm" style="justify-content: start; width: 25px; max-width: 25px">
        <div class="q-pa-none q-pl-none">
          <q-icon name="o_note_alt" color="primary" size="sm" />
        </div>
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <div class="text-subtitle2 ellipsis">
            {{ note.title }}
          </div>
        </q-item-label>
        <q-item-label class="text-caption text-grey-5"> </q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label>
          <!--          <q-icon class="cursor-pointer" name="more_vert" size="16px"/>-->
          <!--          <SidePanelSubfolderContextMenu :tabset="currentTabset" :folder="folder"/>-->
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts" setup>
import { NotesPage } from 'src/notes/models/NotesPage'
import { useNotesStore } from 'src/notes/stores/NotesStore'
import { Tabset } from 'src/tabsets/models/Tabset'
import { PropType, ref, watchEffect } from 'vue'
import '@he-tree/vue/style/default.css'
import '@he-tree/vue/style/material-design.css'
import _ from 'lodash'
import { useNavigationService } from 'src/core/services/NavigationService'
import { useUtils } from 'src/core/services/Utils'
import { useRouter } from 'vue-router'

const { inBexMode } = useUtils()

const router = useRouter()

const props = defineProps({
  tabset: { type: Object as PropType<Tabset>, required: true },
})

const notes = ref<NotesPage[]>([])
const treeData = ref<object[]>()

function treeNodeFromNote(n: NotesPage): object {
  return {
    text: n.title,
    url: chrome.runtime ? chrome.runtime.getURL(`/www/index.html#/mainpanel/notes/${n.id}`) : 'https://skysail.io',
    children: _.map(n.subPages, (subNote: NotesPage) => {
      return treeNodeFromNote(subNote)
    }),
  }
}

watchEffect(async () => {
  notes.value = await useNotesStore().getNotesFor(props.tabset.id)
  //  console.log(`got notes from ${props.tabset.id}`, notes.value.length)
  treeData.value = _.map(notes.value, (n: NotesPage) => {
    return treeNodeFromNote(n)
  })
})

const openNote = (n: NotesPage) => {
  if (inBexMode()) {
    useNavigationService().browserTabFor(chrome.runtime.getURL(`/www/index.html#/mainpanel/notes/${n.id}`))
  } else {
    //useUiStore().setActiveTab(undefined)
    router.push(`/p/notes/${n.id}`)
  }
}
</script>
