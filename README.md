# vue-map-coord

基于 vue3 和高德地图的坐标拾取工具，具有坐标查询，地址查询，坐标拾取等功能、

## 效果展示

![image](/example/images/example.gif)

## 安装

- `NPM`

```shell
npm install vue-map-coord --save
```

- `Yarn`

```shell
yan add element-plus
```

- `browser`

```html
<script src="https://unpkg.com/browse/vue-map-coord/dist/coord-map.umd.js"></script>
```

## 组件配置

### 属性

- `mapKey`

  > 高德地图 key

  ```js
  // 类型
  type: string;
  // 是否必选
  required: true;
  ```

- `position`

  > 默认经纬度坐标

  ```js
  // 类型
  type:string|number[]; //[lng,lat]
  // 是否必选
  required:false;
  ```

- `mapConfig`

  > 地图组件配置项

  ```js
  // 类型
  type:{
      width?:string, //地图宽度
      height?:string, //地图高度
      center?:number[], //地图中心 如传入position属性 则默认以position为地图中心坐标
      zoom?:number, //地图层级
      satellite?:boolean, //是否开启卫星图
  };
  // 默认值
  default:{
      width:'100%',
      height:'100%',
      satellite:false,
      zoom:10
  };
  // 是否必选
  required:false;
  ```

### 事件

- `onCoordChange`

  > 当点位地址变化时触发的事件

  ```js
  // 回调参数
  {
      lng:string|number, //经度
      lat:string|number, //纬度
      position:string|number[], //经纬度数组[经度，纬度]
      address:Address, //地址对象
      formattedAddress:string //地址
  };
  // address类型
  interface Address{
      addressComponent: {
          citycode:string,
          adcode:string,
          businessAreas:string[],
          neighborhoodType:string,
          neighborhood: string,
          province: string,
          street: string,
          streetNumber: string,
          township: string
      },
      crosses: string[],
      formattedAddress: string,
      pois: string[],
      roads: string[]
  };
  ```

### 方法

- `resetMap`

  > 重置地图状态

  ```js
  // 参数
  posClear?:boolean //default:false 是否强行清除所有状态，如果组件传入position属性，默认不重置点位及地址数据
  ```

- `destroyMap`

  > 重置并销毁地图

## 注意项

> 组件所在容器需设置高度，或者在配置项属性里设置组件的高度

## 使用

### 注册组件

- 全局组件注册`install`

```js
// main.js
import { createApp } from "vue";
import App from "./App.vue";
import CoordMap from "vue-map-coord";
const app = createApp(App);
app.use(CoordMap);
app.mount("#app");
```

- 单个.vue 文件局部注册

```vue
// Options API 方式
<script>
import { CoordMap } from "vue-map-coord";
export default {
  components: {
    CoordMap,
  },
};
</script>
```

```vue
// Composition API 方式
<script setup>
import { CoordMap } from "vue-map-coord";
</script>
```

### 使用组件

```vue
<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { CoordChangeProps, CoordMapExpose, CoordMap } from "../packages";

const MAP_KEY = "高德地图key"; //更换为你的高德地图key
const SECURITY_JS_CODE = "高德地图安全码"; //更换为你的高德地图安全码

const onCoordChange = (value: CoordChangeProps) => {
  console.log(value);
};
const position = ref([120.382665, 36.066938]);
const show = ref(true);
const CoordMapRef = ref<CoordMapExpose>();
const switchShow = () => {
  show.value = !show.value;
  if (!show.value) {
    CoordMapRef.value?.resetMap();
  }
};
watchEffect(() => {
  console.log(position.value);
});
</script>

<template>
  <a-button @click="switchShow">切换</a-button>
  <div style="height:600px">
    <CoordMap
      v-show="show"
      ref="CoordMapRef"
      :mapKey="MAP_KEY"
      :securityJsCode="SECURITY_JS_CODE"
      @onCoordChange="onCoordChange"
      v-model:position="position"
    />
  </div>
</template>
```
