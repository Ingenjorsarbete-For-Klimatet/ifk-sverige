import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    commonjsOptions: {
      include: ["tailwind-config.js", "node_modules/**"],
    },
  },

  optimizeDeps: {
    include: ["tailwind-config"],
  },

  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "tailwind-config": path.resolve(__dirname, "./tailwind.config.js"),
    },
  },
});
