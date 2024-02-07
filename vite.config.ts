import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
    commonjsOptions: {
      include: ["node_modules/**"],
    },
  },

  plugins: [react()],
});
