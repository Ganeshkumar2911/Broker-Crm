import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import vueDevTools from "vite-plugin-vue-devtools";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT || env.VITE_PORT || process.env.PORT || 60035);

  return {
    plugins: [vue(), tailwindcss(), vueDevTools()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    optimizeDeps: {
      include: ["leaflet"],
    },

    server: {
      host: "0.0.0.0",
      port: port,
      open: true,
      hmr: {
        overlay: true,
      },
    },
  };
});
