import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function readJSON(path) {
  if (!exists(path)) throw new Error(`File ${path} does not exist`)
  const content = await readFile(path, 'utf8')
  return JSON.parse(content)
}

export * from './secrets'
