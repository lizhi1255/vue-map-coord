<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import CoordMap from './plugins/components/CoordMap.vue'

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
  <CoordMap v-show="show" ref="CoordMapRef" :mapKey="'高德地图key'" :map-config="{ height: '600px' }"
    @onCoordChange='onCoordChange' v-model:position="position" />
</template>
