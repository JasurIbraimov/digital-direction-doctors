import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    ssr: true,
    modules: ["@nuxt/eslint", "@pinia/nuxt"],
    css: ['./app/assets/css/main.css'],
    vite: {
        plugins: [tailwindcss()],
    },
    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://dd-tz-frontend.vercel.app',
        }
    }
});