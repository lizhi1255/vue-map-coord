import { App } from "vue";
import CoordMap from "./components/CoordMap.vue";
import { CoordChangeProps, CoordMapExpose } from "./types";

export { CoordMap }; //按需引入

export type { CoordChangeProps, CoordMapExpose }; //类型导出

const components = [CoordMap];
const install = (app: App, options: any) => {
  components.forEach((comp) => app.component(comp.name || "CoordMap", comp));
};
export default { install };
