import { defineConfig } from 'vite'
import { lib } from './src/vite-plugin-lib'

export default defineConfig({
  plugins: [
    lib({
      entry: './src/vite-plugin-lib.ts',
    }),
  ],
})
