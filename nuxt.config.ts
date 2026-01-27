// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: [
    '~/assets/css/main.css'
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    }
  },

  modules: [
    '@sidebase/nuxt-auth',
    '@nuxtjs/seo',
    '@nuxtjs/google-fonts'
  ],
  googleFonts: {
    families: {
      Nunito: [400, 600, 700], // Las versiones que ya usas
    },
    display: 'swap',  // Evita que el texto desaparezca mientras carga la fuente
    download: true,   // Descarga las fuentes localmente (mejor para privacidad y SEO)
    inject: true      // Inyecta el CSS automáticamente
  },

  site: {
    url: 'https://tu-dominio.com', // REEMPLAZAR con tu dominio real cuando lo tengas
    name: 'Proyecto Curso',
    description: 'Sistema de gestión de historias clínicas y citas médicas.',
    defaultLocale: 'es',
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'es'
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },

  auth: {
    baseURL: `${process.env.NUXT_PUBLIC_API_BASE}/autenticacionRoutes`,
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'post' },
        signUp: false,
        getSession: { path: '/user/profile', method: 'get' }
      },

      token: {
        signInResponseTokenPointer: '/token',
        type: 'Bearer',
        headerName: 'Authorization',
        maxAgeInSeconds: 60 * 60
      },

      refresh: {
        isEnabled: true,
        endpoint: { path: '/user/refreshtoken', method: 'post' },
        refreshOnlyToken: true,
        token: {
          signInResponseRefreshTokenPointer: '/refreshToken',
          refreshResponseTokenPointer: '/token',
          refreshRequestTokenPointer: '/refreshToken',
          maxAgeInSeconds: 60 * 60 * 24 * 7
        }
      },

      globalAppMiddleware: true,

      sessionDataType: {
        dataType: {
          id: 'string',
          usuario: 'string',
          correo: 'string',
          rol: '"paciente" | "especialista" | "admin"',
          imagen: 'string | null'
        }
      },

      session: {
        enableRefreshOnWindowFocus: true,
      }
    }
  },
})