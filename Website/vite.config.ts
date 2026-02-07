import { defineConfig, type ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";
import react from "@vitejs/plugin-react";

const embyProxy = () => ({
  name: "emby-proxy",
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (!req.url || !req.url.startsWith("/emby-proxy")) {
        return next();
      }

      try {
        const url = new URL(req.url, "http://localhost");
        const target = url.searchParams.get("url");

        if (!target) {
          res.statusCode = 400;
          res.end("Missing url parameter");
          return;
        }

        const targetUrl = decodeURIComponent(target);
        const response = await fetch(targetUrl);

        res.statusCode = response.status;
        const contentType = response.headers.get("content-type");
        if (contentType) {
          res.setHeader("Content-Type", contentType);
        }
        res.setHeader("Cache-Control", "no-store");

        const buffer = Buffer.from(await response.arrayBuffer());
        res.end(buffer);
      } catch (error) {
        res.statusCode = 502;
        res.end("Proxy error");
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), embyProxy()],
  server: {
    host: "0.0.0.0",   // 👈 REQUIRED for Android / emulator access
    port: 5173,        // 👈 Match what Tauri is waiting for
    strictPort: true,  // 👈 Prevents silent port switching
  },
});
