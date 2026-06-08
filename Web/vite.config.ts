import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: "css",
        }),
      ],
      dts: "src/components.d.ts",
    }),
    AutoImport({
      imports: ["vue", "vue-router"],
      dts: "src/auto-imports.d.ts",
      resolvers: [ElementPlusResolver()],
    }),
  ],

  optimizeDeps: {
    include: ["@tauri-apps/api/window", "@tauri-apps/api"],
    exclude: ["__TAURI__"],
  },
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/components",
    },
  },
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: false,
  },
});
