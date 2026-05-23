import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const groqApiKey = env.GROQ_API_KEY ?? env.VITE_GROQ_API_KEY;

  const groqProxy = {
    target: "https://api.groq.com",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/groq/, ""),
    headers: groqApiKey ? { Authorization: `Bearer ${groqApiKey}` } : undefined,
  };

  return {
    plugins: [vue()],
    server: { proxy: { "/api/groq": groqProxy } },
    preview: { proxy: { "/api/groq": groqProxy } },
  };
});
