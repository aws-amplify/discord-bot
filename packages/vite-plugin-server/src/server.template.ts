import express from 'express'
// @ts-expect-error - this is a template
import { app } from '$server'

const server = express()
server.use(express.static('.'))
server.use(app)
