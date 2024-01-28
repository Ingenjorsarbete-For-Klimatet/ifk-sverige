import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
    commonjsOptions: {
      include: ["node_modules/**"],
    },
  },

  plugins: [react(), vanillaExtractPlugin()],
});
