import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.png", "icon.png", "adaptive-icon.png"],
      manifest: {
        name: "AgriConnect Market",
        short_name: "AgriConnect",
        description:
          "A verified produce marketplace for farmers and buyers across African markets.",
        theme_color: "#166534",
        background_color: "#faf8f1",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/adaptive-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkFirst",
            options: {
              cacheName: "agriconnect-api",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 10,
              },
              networkTimeoutSeconds: 8,
            },
          },
        ],
      },
    }),
  ],
});
