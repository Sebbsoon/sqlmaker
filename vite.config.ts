import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-webview",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidebar: path.resolve(__dirname, "src/webview/main.tsx"),
        results: path.resolve(
          __dirname,
          "src/webview/Resultpanel/results-main.tsx",
        ),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});