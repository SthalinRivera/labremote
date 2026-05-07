// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/content'
  ],
  devtools: {
    enabled: true
  },
  
  css: ['~/assets/css/main.css'],
  content: {
    build: {
      markdown: {
        toc: {
          depth: 3, // include h3 headings
        }
      }
    }
  },
  routeRules: {
    '/api/**': { cors: true, },
    '/docs': { redirect: '/docs/getting-started', prerender: false }
  },
  runtimeConfig: {
    public: {
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000'
    }
  },
  compatibilityDate: '2024-07-11',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
