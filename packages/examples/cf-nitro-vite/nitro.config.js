import { defineNitroConfig } from 'nitropack/config'
import { openhubModule } from '@openhub2/runtime-nitro'

export default defineNitroConfig({
  preset: "cloudflare-module",
  srcDir: 'server',
  compatibilityDate: "2025-12-23",
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
  },
  experimental: {
    openAPI: true,
  },
  prerender: {
    routes: [], // Disable prerendering for all routes, including /api/*
    crawlLinks: false, // Prevent automatic prerendering of linked routes
  },
  runtimeConfig: {
    openhub: {
      provider: '@openhub2/provider-cloudflare',
      remote: process.env.OPENHUB_REMOTE === 'true',
      remoteUrl: process.env.OPENHUB_REMOTE_URL,
      remoteSecret: process.env.OPENHUB_REMOTE_SECRET,
    },
  },
  modules: [openhubModule],
  devProxy: {
    '/': {
      target: 'http://localhost:5173',
      changeOrigin: true,
      ws: true,
    },
  },
})
