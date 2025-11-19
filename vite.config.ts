import devServer, { defaultOptions } from "@hono/vite-dev-server";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  if (process.env.QUESTS_INSIDE_STUDIO !== "true") {
    // When app is run outside Quests, this ensure .env* files are loaded
    // Removes need for VITE_ prefix in .env files for the server as well
    const env = loadEnv(mode, process.cwd(), "");
    process.env = env;
  }
  
  const isDev = mode === 'development';
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isDev ? [devServer({
        // Exclude client folder from server because we only client render and
        // it interferes with image imports.
        exclude: [/src\/client\/.*/, ...defaultOptions.exclude],
        entry: "./src/server/index.ts",
      })] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist/static',
      emptyOutDir: true,
      rollupOptions: {
        input: './src/client/main.tsx',
        output: {
          entryFileNames: 'main.js',
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
    ssr: {
      noExternal: true,
    },
  };
});
