import { defineConfig } from 'vite'
import { lib } from '@hey-amplify/vite-plugin-lib'

export default defineConfig({
  plugins: [
    lib({
      entry: './src/vite-plugin-copy-file.ts',
    }),
  ],
})
