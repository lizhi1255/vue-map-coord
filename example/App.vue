<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { CoordChangeProps, CoordMapExpose, CoordMap } from '../packages';

const MAP_KEY = '高德地图key' //更换为你的高德地图key
const SECURITY_JS_CODE = '高德地图安全码' //更换为你的高德地图安全码

const onCoordChange = (value: CoordChangeProps) => {
  console.log(value);
}
const position = ref([120.382665, 36.066938])
const show = ref(true)
const CoordMapRef = ref<CoordMapExpose>()
const switchShow = () => {
  show.value = !show.value
  if (!show.value) {
    CoordMapRef.value?.resetMap()
  }
}
watchEffect(() => {
  console.log(position.value);
})
</script>

<template>
  <a-button @click="switchShow">切换</a-button>
  <div style="height:600px">
    <CoordMap v-show="show" ref="CoordMapRef" :mapKey="MAP_KEY" :securityJsCode="SECURITY_JS_CODE"
      @onCoordChange='onCoordChange' v-model:position="position" />
  </div>
</template>
