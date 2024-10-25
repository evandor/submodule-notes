<template>

  <div v-for="note in notes">
    <div class="q-ml-md cursor-pointer" @click="openNote(note)">{{note.title}}</div>
  </div>

</template>

<script lang="ts" setup>

import {PropType, ref, watchEffect} from "vue";
import {Tabset} from "src/tabsets/models/Tabset";
import {useNotesStore} from "src/notes/stores/NotesStore";
import {NotesPage} from "src/notes/models/NotesPage";
import '@he-tree/vue/style/default.css'
import '@he-tree/vue/style/material-design.css'
import _ from "lodash"
import NavigationService from "src/services/NavigationService";

const props = defineProps({
  tabset: {type: Object as PropType<Tabset>, required: true}
})

const notes = ref<NotesPage[]>([])
const treeData = ref<object[]>()

function treeNodeFromNote(n: NotesPage) {
  return {
    text: n.title,
    url: chrome.runtime.getURL(`/www/index.html#/mainpanel/notes/${n.id}`),
    children: _.map(n.subPages, (subNote: NotesPage) => {
      return treeNodeFromNote(subNote)
    })
  }
}

watchEffect(async () => {
  notes.value = await useNotesStore().getNotesFor(props.tabset.id)
  treeData.value = _.map(notes.value, (n: NotesPage) => {
    return treeNodeFromNote(n)
  })
})

const openNote = (n: NotesPage) =>
  NavigationService.openOrCreateTab([chrome.runtime.getURL(`/www/index.html#/mainpanel/notes/${n.id}`)])


</script>
