import { createBot } from '@hey-amplify/discord'
import { init } from '$lib/db'
// @ts-expect-error this file is externalized for build
import { handler } from '$sveltekit_handler'
import express from 'express'

// export for e2e tests
export const app = express()
const PORT = process.env.PORT || 3000

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
  res.end('ok')
})

app.use((req, res, next) => {
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.header('X-Frame-Options', 'SameOrigin')
  res.header('X-XSS-Protection', '1; mode=block')
  res.header('X-Content-Type-Options', 'nosniff')
  next()
})

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler)

// export instance of server for e2e tests
export const server = app.listen(PORT, async () => {
  console.log(`listening on port ${PORT}`)
  await init()
  await createBot()
})
