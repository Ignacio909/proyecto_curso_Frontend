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
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
    }
  },

  modules: ['@sidebase/nuxt-auth'],

  auth: {
    baseURL: `${process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'}/autenticacionRoutes`,
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
      session: {
        dataType: {
          id: 'string',
          usuario: 'string',
          correo: 'string',
          rol: '"paciente" | "especialista" | "admin"',
          imagen: 'string | null'
        }
      }
    }
  },
})