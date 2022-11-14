import { App } from "vue";
import CoordMap from "./components/CoordMap.vue";

export { CoordMap }; //按需引入

const components = [CoordMap];
const install = (app: App, options: any) => {
  components.forEach((comp) => app.component(comp.name, comp));
};
export default { install };
