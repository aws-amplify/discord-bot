import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const path = resolve('package.json')
try {
  await access(path)
} catch (error) {
  throw new Error('package.json not found at cwd')
}

export const pkg = JSON.parse(await readFile(path, 'utf8'))
