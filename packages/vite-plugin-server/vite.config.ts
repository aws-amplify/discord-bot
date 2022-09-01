import { defineConfig } from 'vite'
import { lib } from '@hey-amplify/vite-plugin-lib'
import { VitePluginCopyFile } from '@hey-amplify/vite-plugin-copy-file'

export default defineConfig({
  plugins: [
    lib({
      entry: './src/vite-plugin-server.ts',
    }),
    VitePluginCopyFile('./src/server.template.ts'),
  ],
})
