// @vitest-environment node
import { EOL } from 'node:os'
import { installPolyfills } from '@sveltejs/kit/node/polyfills'
import request from 'supertest'
import prettier from 'prettier'
import { prisma } from '$lib/db'
import {
  mockedPublished,
  mockedCreated,
  mockedPreReleased,
  mockedReleased,
  addedPayload1,
  addedPayload2,
  addedPayloadUserDNE,
  removedPayload2,
  removedPayloadUserDNE,
} from './mock/github-webhook'
import { verifyGithubWebhookEvent } from './../src/routes/api/webhooks/_verifyWebhook'
import { ACCESS_LEVELS } from '$lib/constants'
import type { Server } from 'node:http'
import type { Session } from 'next-auth'

let config
let staffRoleId: string
let app: Express.Application
const session: Session = {
  expires: '1',
  user: { email: 'hello@fake.com', name: 'Bob', image: 'llama.jpg' },
}

beforeAll(async () => {
  installPolyfills() // we're in Node, so we need to polyfill `fetch` and `Request` etc
  try {
    const build = await import('../build/server.js')
    // instead of adding a condition to open the server in the source code, we'll just close it here.
    // TODO: instead of "supertest", should we make actual requests to the server?
    ;(build.server as Server).close()
    app = build.app
  } catch (error) {
    throw new Error(
      `Unable to import server application, has it been built?${EOL}${EOL}Run "pnpm build"`
    )
  }

  config = await prisma.configuration.findUnique({
    where: {
      id: import.meta.env.VITE_DISCORD_GUILD_ID,
    },
    select: {
      id: true,
      roles: {
        select: {
          discordRoleId: true,
          accessLevelId: true,
        },
        where: {
          accessLevelId: {
            in: [ACCESS_LEVELS.STAFF],
          },
        },
      },
    },
  })

  if (!config?.roles?.some((r) => !!r.discordRoleId)) {
    console.error(`No staff roles found for guild ${config?.id}, skipping...`)
    return
  }
  staffRoleId = config.roles[0].discordRoleId
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
  describe('POST /api/admin/commands', () => {
    it('should return 401', async () => {
      const response = await request(app).post('/api/admin/commands')
      expect(response.status).toBe(401)
    })
  })
})

describe('webhooks', () => {
  describe('POST /api/webhooks/github-release', () => {
    it('should not return 401', async () => {
      const response = await request(app)
        .post('/api/webhooks/github-release')
        .send({})
      expect(response.status).not.toBe(401)
    })

    it('should return 403 without auth header', async () => {
      const response = await request(app)
        .post('/api/webhooks/github-release')
        .send({})
      expect(response.status).toBe(403)
    })

    it('should return 403 with invalid auth header', async () => {
      const response = await request(app)
        .post('/api/webhooks/github-release')
        .send(mockedReleased.body)
        .set({ 'X-Hub-Signature-256': 'invalid' })
      expect(response.status).toBe(403)
    })

    it('should return 400 if webhook URL is bad', async () => {
      const url = process.env.DISCORD_WEBHOOK_URL_RELEASES
      process.env.DISCORD_WEBHOOK_URL_RELEASES =
        'https://discordapp.com/api/webhooks/bad'
      const response = await request(app)
        .post('/api/webhooks/github-release')
        .send(mockedReleased.body)
        .set(mockedReleased.headers)
      expect(response.status).toBe(400)
      process.env.DISCORD_WEBHOOK_URL_RELEASES = url
    })

    it('should return 400 if invalid content-type', async () => {
      // if webhook in GitHub is set to application/x-www-url-encoded
      const response = await request(app)
        .post('/api/webhooks/github-release')
        .send(
          `payload=${encodeURIComponent(JSON.stringify(mockedReleased.body))}`
        )
        .set({ 'Content-Type': 'application/x-www-url-encoded' })
      expect(response.status).toBe(400)
      // TODO: test for correct error message
    })

    it('should return 201 if everything is correct', async () => {
      const response = await request(app)
        .post('/api/webhooks/github-release')
        .send(mockedReleased.body)
        .set(mockedReleased.headers)
      expect(response.status).toBe(201)
    })

    it(`should return 204 is event action is not 'released'`, async () => {
      const response = await request(app)
        .post('/api/webhooks/github-release')
        .send(mockedCreated.body)
        .set(mockedCreated.headers)
      expect(response.status).toBe(204)
    })

    it(`should return 204 is event action is not 'released'`, async () => {
      const response = await request(app)
        .post('/api/webhooks/github-release')
        .send(mockedPublished.body)
        .set(mockedPublished.headers)
      expect(response.status).toBe(204)
    })

    it(`should return 204 is event action is not 'released'`, async () => {
      const response = await request(app)
        .post('/api/webhooks/github-release')
        .send(mockedPreReleased.body)
        .set(mockedPreReleased.headers)
      expect(response.status).toBe(204)
    })
  })

  describe('POST api/webhooks/github-org-membership', () => {
    describe('webhook verification', () => {
      it('should return true with payload for added member', () => {
        expect(
          verifyGithubWebhookEvent(
            process.env.GITHUB_WEBHOOK_SECRET,
            addedPayload1.body,
            addedPayload1.headers['X-Hub-Signature-256']
          )
        ).toBeTruthy()
      })

      it('should return true with payload for removed member', () => {
        expect(
          verifyGithubWebhookEvent(
            process.env.GITHUB_WEBHOOK_SECRET,
            removedPayload2.body,
            removedPayload2.headers['X-Hub-Signature-256']
          )
        ).toBeTruthy()
      })

      it('should return true for removed member', () => {
        expect(
          verifyGithubWebhookEvent(
            process.env.GITHUB_WEBHOOK_SECRET,
            removedPayloadUserDNE.body,
            removedPayloadUserDNE.headers['X-Hub-Signature-256']
          )
        ).toBeTruthy()
      })

      it('should return true for added member', () => {
        expect(
          verifyGithubWebhookEvent(
            process.env.GITHUB_WEBHOOK_SECRET,
            addedPayloadUserDNE.body,
            addedPayloadUserDNE.headers['X-Hub-Signature-256']
          )
        ).toBeTruthy()
      })

      it('should return false with jumbled payload body and headers', () => {
        expect(
          verifyGithubWebhookEvent(
            process.env.GITHUB_WEBHOOK_SECRET,
            addedPayloadUserDNE.body,
            addedPayload1.headers['X-Hub-Signature-256']
          )
        ).toBe(false)
      })

      it('should return false with empty body', () => {
        expect(
          verifyGithubWebhookEvent(
            process.env.GITHUB_WEBHOOK_SECRET,
            {},
            addedPayload2.headers['X-Hub-Signature-256']
          )
        ).toBe(false)
      })

      it('should return false with empty payload and token', () => {
        expect(verifyGithubWebhookEvent('', {}, '')).toBe(false)
      })
    })

    it('should return 403 without auth header', async () => {
      const response = await request(app)
        .post('/api/webhooks/github-org-membership')
        .send({})
      expect(response.status).toBe(403)
    })

    it('should return 403 with invalid auth header', async () => {
      const response = await request(app)
        .post('/api/webhooks/github-org-membership')
        .send(addedPayload1.body)
        .set({ 'X-Hub-Signature-256': 'invalid' })
      expect(response.status).toBe(403)
    })

    /**
     * @TODO fix this in CI, it runs fine locally
     */
    // it('should return 201 if everything is correct', async () => {
    //   const response = await request(app)
    //     .post('/api/webhooks/github-org-membership')
    //     .send(addedPayload1.body)
    //     .set(addedPayload1.headers)
    //   expect(response.status).toBe(201)
    // })

    it(`should return 403 if user isn't in db`, async () => {
      const response = await request(app)
        .post('/api/webhooks/github-org-membership')
        .send(removedPayloadUserDNE.body)
        .set(removedPayloadUserDNE.headers)
      expect(response.status).toBe(403)
    })

    it(`should return 403 if user isn't in db`, async () => {
      const response = await request(app)
        .post('/api/webhooks/github-org-membership')
        .send(addedPayloadUserDNE.body)
        .set(addedPayloadUserDNE.headers)
      expect(response.status).toBe(403)
    })
  })
})

describe('GET /api/p/color/[code]', () => {
  it('should return 200 if color code is valid', async () => {
    const response = await request(app).get('/api/p/color/f3f.svg')
    expect(response.status).toBe(200)
  })

  it('should return an SVG if color code is valid', async () => {
    const response = await request(app).get('/api/p/color/f3f.svg')
    expect(response.headers['content-type']).toBe('image/svg+xml')
    expect(prettier.format(response.body.toString())).toBe(
      prettier.format(
        '<svg xmlns="http://www.w3.org/2000/svg" fill="#f3f" viewBox="0 0 100 100"><circle cx="50%" cy="50%" r="40%"/></svg>'
      )
    )
  })

  it('should return 400 if ".svg" is not appended to the color code', async () => {
    const response = await request(app).get('/api/p/color/f3f')
    expect(response.status).toBe(400)
  })

  it('should return 400 if color code is invalid', async () => {
    const response = await request(app).get('/api/p/color/zzz.svg')
    expect(response.status).toBe(400)
  })
})
