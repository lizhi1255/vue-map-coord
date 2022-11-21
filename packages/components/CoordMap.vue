<script lang="ts">
export default {
  name: 'CoordMap'
}
</script>
<script setup lang="ts">
import { customRef, onMounted, ref, shallowReactive, shallowRef, toRaw, watch, watchEffect } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';

type SORN = string | number

interface Props {
  mapKey: string, //高德地图key
  mapConfig?: { //地图配置
    width?: string, //地图宽度
    height?: string, //地图高度
    center?: number[], //地图中心
    zoom?: number, //地图层级
    satellite?: boolean, //是否开启卫星图
  },
  position?: SORN[] //[lng,lat]
}

const props = withDefaults(defineProps<Props>(),
  {
    mapKey: '',
    mapConfig: () => ({
      width: '100%',
      height: '100%',
      satellite: false,
      zoom: 10
    }),
  },
)

interface Address {
  addressComponent: {
    citycode: string, adcode: string, businessAreas: string[], neighborhoodType: string, neighborhood: string, province
    : string, street: string, streetNumber: string, township: string
  },
  crosses: string[], formattedAddress: string, pois: string[], roads: string[]
}
const emits = defineEmits<{
  (e: 'onCoordChange', value: {
    lng: SORN,
    lat: SORN,
    position: SORN[],
    address: Address,
    formattedAddress: string
  }): void,
  (e: 'update:position', value: SORN[]): void
}>()

// 防抖
class Debounce {
  delay: number;
  timeout: NodeJS.Timeout | null;
  constructor(delay?: number) {
    this.delay = delay ? delay : 200;
    this.timeout = null;
  }
  debounceEnd() {
    return new Promise((resolve, reject) => {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        resolve('success');
      }, this.delay)
    })
  }
}

onMounted(() => {
  initMap()
});

const MapRef = shallowRef()
const AMapRef = shallowRef()
const AutoCompleteRef = shallowRef()
const PlaceSearchRef = shallowRef()
const initLoading = ref(false)
const initCenter = ref([])
const initMap = async () => {
  initLoading.value = true
  const AMap = await AMapLoader.load({
    key: props.mapKey,
    version: "2.0",
    plugins: [
      "AMap.Geocoder", //查询地址
      "AMap.AutoComplete",//自动填充
      "AMap.PlaceSearch", //搜索
    ]
  })
  const Map = new AMap.Map('map', {
    zoom: props.mapConfig.zoom || 10,
    center: props.position || props.mapConfig.center,
  });
  Map.on('click', mapClick)

  SatelliteRef.value = new AMap.TileLayer.Satellite()
  geoCoderRef.value = new AMap.Geocoder()
  AutoCompleteRef.value = new AMap.AutoComplete()
  PlaceSearchRef.value = new AMap.PlaceSearch()
  initCenter.value = Map.getCenter()

  AMapRef.value = AMap
  MapRef.value = Map
  initLoading.value = false
}

//卫星图 图层
const satellite = ref(props.mapConfig.satellite)
const SatelliteRef = shallowRef()
watchEffect(() => {
  if (!MapRef.value) return
  if (satellite.value) {
    MapRef.value.addLayer(SatelliteRef.value)
  } else {
    MapRef.value.removeLayer(SatelliteRef.value)
  }
})

// 点位标记
const position = ref<SORN[]>(['', ''])

const markerRef = shallowRef()

const mapClick = (e: { lnglat: { lng: number, lat: number } }) => {
  position.value = [e.lnglat.lng, e.lnglat.lat]
  createMarker(e.lnglat.lng, e.lnglat.lat)
}
const createMarker = (lng: SORN, lat: SORN) => {
  if (!markerRef.value) {
    const marker = new AMapRef.value.Marker({
      position: new AMapRef.value.LngLat(lng, lat),

      // 设置是否可以拖拽
      draggable: true,
    });
    marker.on('dragging', onMovingMaker)
    MapRef.value.add(marker)
    markerRef.value = marker
  } else {
    markerRef.value.setPosition(new AMapRef.value.LngLat(lng, lat))
  }
}
const onMovingMaker = (e: any) => {
  position.value = e.target._position
}

const positionDe = new Debounce()
watch(() => position.value, async (newVal) => {
  if (!newVal[0] || !newVal[1]) return
  await positionDe.debounceEnd()
  address.value = ''
  createMarker(newVal[0], newVal[1])
  getAddress(newVal[0], newVal[1])
  MapRef.value.setCenter(newVal)
}, { deep: true, })

watchEffect(() => {
  if (!MapRef.value || !AMapRef.value) return
  if (props.position instanceof Array) {
    position.value = props.position
  }
})

// 地址
const address = ref()
const geoCoderRef = shallowRef()
const addressLoading = ref(false)

const getAddress = (lng: SORN, lat: SORN) => {
  addressLoading.value = true
  geoCoderRef.value.getAddress([lng, lat], (status: never, result: { info: string, regeocode: Address }) => {
    if (status === 'complete' && result.info === 'OK') {
      address.value = result.regeocode.formattedAddress
      addressLoading.value = false

      if (props.position?.[0] === position.value[0] && props.position?.[1] === position.value[1]) return
      emits('onCoordChange', {
        position: toRaw(position.value),
        lng: position.value[0],
        lat: position.value[1],
        address: result.regeocode,
        formattedAddress: result.regeocode.formattedAddress
      })
      emits("update:position", position.value)
    }
  })
}

// 搜索
const mode = ref<'search' | 'result'>("search")
const query = ref('')
const tips = shallowRef<{ value: string, label: string }[]>([])
const searching = ref(false)
const searchDe = new Debounce()
const autoComplete = async (searchText: string) => {
  await searchDe.debounceEnd()
  if (!searchText) {
    tips.value = [];
  } else {
    AutoCompleteRef.value.search(searchText, (status: string, result: { tips: any }) => {
      if (searchText !== query.value) return;
      if (status === 'complete' && result.tips) {
        const list: { value: string, label: string }[] = []
        result.tips.map((tip: { name: string }) => {
          if (list.find((v: any) => v.value === tip.name)) return
          list.push({ value: tip.name, label: tip.name })
        });
        tips.value = list
      } else {
        tips.value = [];
      }
    });
  }
}

const searchObj = shallowReactive<{
  results: string[],
  total: number,
  pageIndex: number,
  pageSize: number
}>({
  results: [],
  total: 0,
  pageIndex: 1,
  pageSize: 10
})

const search = (clear: boolean = false) => {
  mode.value = 'result';

  if (clear) {
    searchObj.results = [];
    searchObj.total = 0;
    searchObj.pageIndex = 1;
    PlaceSearchRef.value.setPageIndex(1);
  }

  searching.value = true;
  PlaceSearchRef.value.search(query.value, (status: string, result: { poiList: { pois: string[], count: number } }) => {
    searching.value = false;
    if (status === 'complete' && result.poiList) {
      searchObj.results = result.poiList.pois;
      searchObj.total = result.poiList.count;
    } else {
      searchObj.results = [];
      searchObj.total = 0;
    }
  });
}
const reset = () => {
  tips.value = []
  mode.value = 'search'
  searchObj.results = []
  searchObj.total = 0
  PlaceSearchRef.value?.setPageIndex(1);
}
const focus = (poi: { location: { lng: number, lat: number } }) => {
  const pos = [poi.location.lng, poi.location.lat];
  position.value = [...pos];
  MapRef.value.setCenter([...pos]);
}
watch(() => searchObj.pageIndex, (newVal) => {
  PlaceSearchRef.value.setPageIndex(newVal);
  search(false);
})

// 是否是手机端
const isMobileIphone = ref(document.body.clientWidth < 640)
window.onresize = () => {
  isMobileIphone.value = document.body.clientWidth < 640
}

// 重置地图
const resetMap = (posClear = false) => {
  reset()
  query.value = ''
  searching.value = false
  addressLoading.value = false
  initLoading.value = false
  satellite.value = props.mapConfig.satellite
  if (props.position && !posClear) return
  MapRef.value?.setCenter(initCenter.value)
  markerRef.value = null
  MapRef.value?.clearMap()
  address.value = ''
  position.value = ['', '']
}

// 卸载地图
const destroyMap = () => {
  resetMap()
  MapRef.value?.destroy()
}
defineExpose({ resetMap, destroyMap })

</script>

<template>
  <a-spin :spinning="initLoading" size="large" wrapperClassName="spinWrap">
    <div class="map-container" id="map"
      :style="{ width: mapConfig.width || '100%', height: mapConfig.height || '100%' }">
      <div class="toolbar">
        <div>
          <a-card :body-style="{
            'max-height': '450px',
            'overflow-y': 'scroll',
            'padding-top': 0,
          }" class="result-panel">
            <template v-slot:title>
              <template v-if="mode === 'search'">
                <a-input-group compact style="display: flex">
                  <a-auto-complete v-model:value="query" :options="tips" placeholder="输入关键词" style="flex: 1"
                    @search="autoComplete" @select="search(true)" allowClear />
                  <a-button @click="search(true)" :disabled="!query" type="primary">
                    搜索
                  </a-button>
                </a-input-group>
              </template>
              <template v-if="mode === 'result'">
                <div class="search-bar">
                  <a-button @click="reset" style="margin-right: 6px;">
                    返回
                  </a-button>
                  <span class="text">搜索 {{ query }} 共
                    {{ searching ? '...' : searchObj.total }} 条结果</span>
                </div>
              </template>
            </template>

            <a-list v-if="mode === 'result'" :data-source="searchObj.results" :loading="searching"
              item-layout="vertical" size="small" class="result-list">
              <template #header>
                <a-pagination v-if="searchObj.total > 0" v-model:current="searchObj.pageIndex"
                  :page-size="searchObj.pageSize" :total="searchObj.total" size="small" :showSizeChanger="false" />
              </template>

              <template #renderItem="{ item }">
                <a-list-item :key="item.id">
                  <a-list-item-meta :description="item.address">
                    <template #title>
                      <span @click="focus(item)" style="cursor: pointer;">{{ item.name }}</span>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>

              <template #footer>
                <a-pagination v-if="searchObj.total > 0" v-model:current="searchObj.pageIndex"
                  :page-size="searchObj.pageSize" :total="searchObj.total" size="small" :showSizeChanger="false" />
              </template>
            </a-list>
          </a-card>

        </div>
        <div>
          <div class="info ant-card ant-card-bordered" v-if="(mode === 'search' && isMobileIphone) || !isMobileIphone">
            <div class="item">
              <div class="label">坐标：</div>
              <div>
                <a-input v-model:value="position[0]" style="width: 100px;" placeholder="lng" type='number' />
                ,
                <a-input v-model:value="position[1]" style="width: 100px;" placeholder="lat" type='number' />
              </div>

            </div>
            <div class="item">
              <div class="label">地址：</div>
              <a-spin :spinning="addressLoading">
                <p class="addressText">{{ address || '--' }}</p>
              </a-spin>
            </div>
            <div class="item">
              <div class="label">卫星图：</div>
              <a-switch v-model:checked="satellite" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </a-spin>
</template>

<style scoped lang="less">
.spinWrap {
  width: 100%;
  height: 100%;

  :deep(.ant-spin-container) {
    width: 100%;
    height: 100%;
  }
}

.map-container {
  height: 100%;
  width: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    flex-wrap: wrap;
    z-index: 1;
    position: relative;
    align-content: flex-start;
    pointer-events: none;

    .result-panel {
      width: 320px;
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
      pointer-events: all;

      &.ant-card {
        background-color: rgba(255, 255, 255, 0.6);

        :deep(.ant-select-selector) {
          background-color: rgba(255, 255, 255, 0.7);
        }

        :deep(.ant-card-head) {
          padding: 0 12px;
        }

        :deep(.ant-card-head-title) {
          padding: 12px 0;
        }
      }

      .search-bar {
        display: flex;
        align-items: center;

        .text {
          text-overflow: ellipsis;
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
        }
      }

      .result-list.ant-list-loading {
        min-height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .info {
      padding: 12px 12px 0 12px;
      background-color: rgba(255, 255, 255, 0.6);
      border-radius: 2px;
      pointer-events: all;

      .item {
        margin-bottom: 12px;
        display: flex;
        align-items: center;
      }

      .ant-input {
        background-color: rgba(255, 255, 255, 0.7);
      }

      .addressText {
        margin-bottom: 0;
        color: rgba(0, 0, 0, 0.85);
        max-width: 210px;
      }

      input[type=number] {
        -moz-appearance: textfield;
        appearance: textfield;
      }

      input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
      }
    }
  }


}
</style>
