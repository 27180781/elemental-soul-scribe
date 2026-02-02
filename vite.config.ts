import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./", // For Electron
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // הסרנו את componentTagger כדי לאפשר בנייה ל-Electron
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
