<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { CoordMap } from '../../src/index'

const onCoordChange = (value: any) => {
  console.log(value);
}
const position = ref([120.405985, 36.120701])
const show = ref(true)
const CoordMapRef = ref()
const switchShow = () => {
  show.value = !show.value
  if (!show.value) {
    CoordMapRef.value.resetMap()
  }
}
watchEffect(() => {
  console.log(position.value);
})
</script>

<template>
  <a-button @click="switchShow">切换</a-button>
  <div style="height:600px">
    <CoordMap v-show="show" ref="CoordMapRef" :mapKey="'92bf1b30d5d094e6a625fd046e52f2db'"
      @onCoordChange='onCoordChange' v-model:position="position" />
  </div>

</template>
