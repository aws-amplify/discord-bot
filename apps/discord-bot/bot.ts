import { createClient } from '@hey-amplify/discord'
import { loadEnv } from 'vite'

if (import.meta.env.DEV) {
  loadEnv(import.meta.url, 'development')
}

createClient()
