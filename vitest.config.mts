import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'nuxt',
    environmentOptions: {
        nuxt: {
            domEnvironment: 'jsdom',
        }
    },
    setupFiles: './vitest.setup.ts', // Optional setup file
  },
});
