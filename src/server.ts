import { createBot } from '$discord/client'
import { init } from '$lib/db'
// @ts-expect-error this file is externalized for build
import { handler } from './handler.js'
import express from 'express'

// export for e2e tests
export const app = express()
const PORT = process.env.PORT || 3000

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
  res.end('ok')
})

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler)

// export instance of server for e2e tests
export const server = app.listen(PORT, async () => {
  console.log(`listening on port ${PORT}`)
  await init()
  await createBot()
})
