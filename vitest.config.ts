import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
    test: {
        environment: 'nuxt',
        environmentOptions: {
            nuxt: {
                domEnvironment: 'happy-dom'
            }
        },
        exclude: ['**/tests/e2e/**', 'node_modules/**'],
        globals: true
    }
})