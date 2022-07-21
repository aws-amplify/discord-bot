import { resolve } from 'node:path'
import { EOL } from 'node:os'
import { installPolyfills } from '@sveltejs/kit/node/polyfills'
import glob from 'fast-glob'
import request from 'supertest'
import { beforeAll } from 'vitest'
import type { Server } from 'node:http'
import type { Session } from 'next-auth'

let app: Express.Application
const session: Session = {
  expires: '1',
  user: { email: 'hello@fake.com', name: 'Bob', image: 'llama.jpg' },
}

beforeAll(async () => {
  installPolyfills() // we're in Node, so we need to polyfill `fetch` and `Request` etc
  try {
    const build = await import('../../build/server')
    // instead of adding a condition to open the server in the source code, we'll just close it here.
    // TODO: instead of "supertest", should we make actual requests to the server?
    ;(build.server as Server).close()
    app = build.app
  } catch (error) {
    throw new Error(
      `Unable to import server application, has it been built?${EOL}${EOL}Run "pnpm build"`
    )
  }
})

const ROUTES_PATH = resolve('src/routes')

const routes = await glob('**/*.(js|ts)', {
  absolute: true,
  cwd: ROUTES_PATH,
  ignore: ['**/_*'],
})

function routify(path: string) {
  return `${path
    .replace(ROUTES_PATH, '')
    .replace(/\.(js|ts)/, '')
    .replace(/index$/, '')}`
}

function isDynamicRoute(route: string) {
  return /\[.*?\]/.test(route)
}

// TODO: do we _need_ this?
describe('Routes defined in Svelte-Kit app', async () => {
  for await (const [route, mod] of routes.map(
    (r) => <[string, Promise<any>]>[routify(r), import(r)]
  )) {
    if (!isDynamicRoute(route)) {
      it(`should respond ${route}`, async () => {
        const response = await request(app).get(route)
        expect(response.status).toBeTruthy()
        expect(response.status).not.toBe(404)
      })
      // TODO: `await mod()` to check for exposed methods, test exposed methods
    }
  }
})

describe('GET /healthcheck', () => {
  it('should return 200', async () => {
    const response = await request(app).get('/healthcheck')
    expect(response.status).toBe(200)
  })
})

describe('Admin Routes', () => {
  describe('GET /admin', () => {
    it('should redirect to /restricted', async () => {
      const response = await request(app).get('/admin')
      expect(response.status).toBe(302)
      expect(response.headers.location).toBe('/restricted')
    })
  })
  describe('GET /admin/configure', () => {
    it('should redirect to /restricted', async () => {
      const response = await request(app)
        .get('/admin/configure')
        .query('guildId=123')
      expect(response.status).toBe(302)
      expect(response.headers.location).toBe('/restricted')
    })
  })
  describe('POST /api/admin/commands/sync', () => {
    it('should return 401', async () => {
      const response = await request(app).post('/api/admin/commands/sync')
      expect(response.status).toBe(401)
    })
  })
})
