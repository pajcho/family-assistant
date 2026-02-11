// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  ssr: false,
  devtools: { enabled: true },
  devServer: {
    port: 3001,
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/family-assistant/',
    head: {
      title: 'Porodični asistent',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  modules: ['@nuxtjs/tailwindcss', '@peterbud/nuxt-query', 'shadcn-nuxt'],
  build: {
    transpile: ['@vuepic/vue-datepicker'],
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
  },
});
