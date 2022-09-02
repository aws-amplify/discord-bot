import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as url from 'node:url'
import type { Plugin, ResolvedConfig } from 'vite'

export const VitePluginCopyFile = (files: string | string[]): Plugin => {
  let config: ResolvedConfig

  return {
    name: 'vite-plugin-copy-file',
    configResolved: (c) => {
      config = c
    },
    writeBundle: async () => {
      const base = url.pathToFileURL(path.join(config.root, 'package.json'))
      const srcRegex = /(?!\.\/)src/
      const filesToCopy = Array.isArray(files) ? files : [files]
      for (const fileToCopy of filesToCopy) {
        // path relative to the "src" directory or package
        let relativePath = fileToCopy
        if (srcRegex.test(fileToCopy)) {
          // remove `src` from file directory, assume `src` is base
          relativePath = fileToCopy.replace(/\/src/, '')
        }
        const from = url.fileURLToPath(new URL(fileToCopy, base))
        const to = path.join(config.root, config.build.outDir, relativePath)
        // copy the file
        await fs.copyFile(from, to)
      }
    },
  }
}

export const copy = VitePluginCopyFile
export default copy
