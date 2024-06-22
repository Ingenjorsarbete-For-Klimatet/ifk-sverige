import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

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
