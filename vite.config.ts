import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Allows external access
    port: 8080,
    open: true, // Automatically open browser
  },
  plugins: [
    react({
      // Optional: Configure SWC for better JSX handling
      jsxImportSource: "@emotion/react", // If using emotion, adjust accordingly
      devTarget: "esnext", // Ensures compatibility with modern JS
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx"], // Explicitly include TS/TSX
  },
  esbuild: {
    charset: "utf8", // Ensure UTF-8 encoding for Arabic characters
  },
  build: {
    target: "esnext", // Match modern JS features
  },
}));