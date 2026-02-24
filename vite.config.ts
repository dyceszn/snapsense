import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const huggingFaceApiKey =
    env.HUGGING_FACE_API_KEY ??
    env.VITE_HUGGING_FACE_API_KEY ??
    env.VITE_APP_HUGGING_FACE_API_KEY;

  return {
    plugins: [vue()],
    server: {
      proxy: {
        "/api/huggingface": {
          target: "https://router.huggingface.co",
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/huggingface/, "/hf-inference"),
          headers: huggingFaceApiKey
            ? {
                Authorization: `Bearer ${huggingFaceApiKey}`,
              }
            : undefined,
        },
        "/api/huggingface-hub": {
          target: "https://huggingface.co",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/huggingface-hub/, ""),
        },
      },
    },
    preview: {
      proxy: {
        "/api/huggingface": {
          target: "https://router.huggingface.co",
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/huggingface/, "/hf-inference"),
          headers: huggingFaceApiKey
            ? {
                Authorization: `Bearer ${huggingFaceApiKey}`,
              }
            : undefined,
        },
        "/api/huggingface-hub": {
          target: "https://huggingface.co",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/huggingface-hub/, ""),
        },
      },
    },
  };
});
