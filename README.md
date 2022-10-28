# vue-map-coord

基于vue3和高德地图的坐标拾取工具，具有坐标查询，地址查询，坐标拾取等功能、

## 效果展示



## 安装

-  `NPM`


```shell
npm install vue-map-coord --save
```

- `Yarn`


```shell
yan add element-plus
```

- `browser`


```html
<script src="https://unpkg.com/browse/vue-map-coord/coord-map.umd.js"></script>
```

## 组件配置

### 属性

- `mapKey`

  > 高德地图key
  >
  > ```json
  > type:string;
  > required:true;
  > ```

- `position`

  > 默认经纬度坐标

  ```json
  type:string|number[]; //[lng,lat]
  required:false;
  ```

  

- `mapConfig`

  > 地图组件配置项

  ```json
  type:{
      width?:string, //地图宽度
      height?:string, //地图高度
      center?:number[], //地图中心
      zoom?:number, //地图层级
      satellite?:boolean, //是否开启卫星图
  };
  default:{
      width:'100%', 
      height:'100%',
      satellite:false,
      zoom:10
  };
  required:false;
  ```

### 事件

- `onCoordChange`

  > 当点位地址变化时触发的事件

  ```json
   //回调参数
  {
  	lng:string|number, //经度
  	lat:string|number, //纬度
  	position:string|number[], //经纬度数组[经度，纬度]
  	address:Address, //地址对象
  	formattedAddress:string //地址
  }
  
  interface Address{ //address类型
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

  ```json
  // 参数
  posClear?:boolean //是否强行清除所有状态，如果组件传入position属性，默认不重置点位及地址数据
  ```

- `destroyMap`

  > 重置并销毁地图


## 注意项

> 组件所在容器需设置高度，或者在配置项属性里设置组件的高度，如 :mapCofing="{height:'600px'}"

## 使用

### 注册组件

- 全局组件注册`install`

```json
// **main.js**
import { createApp } from "vue";
import App from "./App.vue";
import CoordMap from "vue-map-coord-pickup";
import "vue-map-coord-pickup/style.css";
const app = createApp(App);
app.use(CoordMap)
app.mount("#app");
```

- 单个.vue文件局部注册

```vue
//Options API
<script>
    import { CoordMap } from 'vue-map-coord-pickup'
	import 'vue-map-coord-pickup/style.css'
    export default {
        components: {
            CoordMap
        }
    }
</script>

//Composition API
<script setup>
	import { CoordMap } from 'vue-map-coord-pickup'
	import 'vue-map-coord-pickup/style.css'
</script>
```

### 使用组件

```vue
<script setup>
import { ref,watchEffect } from 'vue';
import CoordMap from 'vue-map-coord-pickup'

const onCoordChange = (value: any) => {
  console.log(value);
}
const position = ref([120.405985, 36.120701])
const CoordMapRef = ref()
watchEffect(() => {
  console.log(position.value);
})
</script>

<template>
  <div style="height:600px">
    <CoordMap ref="CoordMapRef" mapKey="高德地图key" @onCoordChange='onCoordChange'
      v-model:position="position" />
  </div>
</template>
```

