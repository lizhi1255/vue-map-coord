import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import path, { resolve } from "path";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ["packages"],
      outputDir: path.resolve("dist", "types"),
    }),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
    cssInjectedByJsPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "packages/index.ts"),
      name: "coordMap",
      fileName: (format) => `coord-map.${format}.js`,
    },
    rollupOptions: {
      // 外部化处理不打包进库的依赖
      external: ["vue"],
      output: {
        // 在 UMD 构建模式下为外部化的依赖提供一个全局变量
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
