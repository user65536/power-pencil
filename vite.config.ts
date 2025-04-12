import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "disable-hmr",
      handleHotUpdate({ server }) {
        server.ws.send({ type: "full-reload" }); // 量刷新
        return []; // 阻止默认 HMR 行为
      },
    },
  ],
});
