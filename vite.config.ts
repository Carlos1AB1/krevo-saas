import { defineConfig, loadEnv } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = env.VITE_DEV_API_PROXY_TARGET || "http://127.0.0.1:3100";

  return {
    server: {
      allowedHosts: true,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tanstackStart({
        server: {
          entry: "server",
        },
      }),
      nitro({
        preset: "cloudflare_module",
        devProxy: {
          "/api/**": {
            target: apiProxyTarget,
            changeOrigin: true,
          },
          "/uploads/**": {
            target: apiProxyTarget,
            changeOrigin: true,
          },
        },
        routeRules: {
          "/api/**": {
            proxy: `${apiProxyTarget}/api/**`,
          },
          "/uploads/**": {
            proxy: `${apiProxyTarget}/uploads/**`,
          },
        },
      }),
      tailwindcss(),
      react(),
      tsconfigPaths(),
    ],
  };
});
