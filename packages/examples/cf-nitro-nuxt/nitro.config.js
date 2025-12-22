export default defineNitroConfig({
  preset: "cloudflare-module",
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
})
