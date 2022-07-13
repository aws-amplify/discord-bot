import { createBot } from '$discord/client'
// @ts-expect-error this file is externalized for build
import { handler } from './handler.js'
import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
  res.end('ok')
})

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler)

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
  createBot()
})
