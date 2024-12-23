<template>
  <div @click.stop="clicked()">
    <span>{{ item.name }}</span>
  </div>
</template>

<script lang="ts" setup>
// const props = defineProps(['item', 'depth', 'expanded'])

const props = defineProps({
  item: { type: Object, required: true },
  depth: { type: Number, required: true },
  expanded: { type: Boolean, default: true },
})

const clicked = () => {
  console.log('clicked')
}
// defineEmits(['setExpanded'])
// const delete = () => {
//   const deleteHandler = inject('delete')
//   deleteHandler(props.item.id)
// }
</script>
