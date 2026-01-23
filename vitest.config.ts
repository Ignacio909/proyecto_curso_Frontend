import { defineVitestConfig} from '@nuxt/test-utils/config'
import test from 'node:test'

export default defineVitestConfig({
    test: {
        enviroment: 'nuxt',

        enviromentOption: {
            nuxt: {
                domEnviroment: 'happy-dom'
            }
        },
        globals: true
    }
})