import { test, expect } from '@playwright/test'
import { mockedCreated, mockedReleased } from '../../mock/github-webhook'

test.describe('GitHub Release webhook', () => {
  test('should not return 401', async ({ request }) => {
    const response = await request.post('/api/webhooks/github-release', {
      data: {},
    })
    expect(response.status()).not.toBe(401)
  })

  test('should return 403 without auth header', async ({ request }) => {
    const response = await request.post('/api/webhooks/github-release', {
      data: {},
    })
    expect(response.status()).toBe(403)
  })

  test('should return 403 with invalid auth header', async ({ request }) => {
    const response = await request.post('/api/webhooks/github-release', {
      headers: { 'X-Hub-Signature-256': 'invalid' },
      data: mockedReleased.body,
    })
    expect(response.status()).toBe(403)
  })

  /** @todo unskip */
  test.skip('should return 400 if webhook URL is bad', async ({ request }) => {
    const url = process.env.DISCORD_WEBHOOK_URL_RELEASES
    process.env.DISCORD_WEBHOOK_URL_RELEASES =
      'https://discordapp.com/api/webhooks/bad'
    const response = await request.post('/api/webhooks/github-release', {
      headers: mockedReleased.headers,
      data: mockedReleased.body,
    })

    expect(response.status()).toBe(400)
    process.env.DISCORD_WEBHOOK_URL_RELEASES = url
  })

  test('should return 400 if invalid content-type', async ({ request }) => {
    // if webhook in GitHub is set to application/x-www-url-encoded
    const response = await request.post('/api/webhooks/github-release', {
      headers: { 'Content-Type': 'application/x-www-url-encoded' },
      data: `payload=${encodeURIComponent(
        JSON.stringify(mockedReleased.body)
      )}`,
    })
    expect(response.status()).toBe(400)
  })

  /** @todo unskip */
  test.skip('should return 201 if everything is correct', async ({
    request,
  }) => {
    const response = await request.post('/api/webhooks/github-release', {
      headers: mockedReleased.headers,
      data: mockedReleased.body,
    })

    expect(response.status()).toBe(201)
  })

  test(`should return 204 is event action is not 'released'`, async ({
    request,
  }) => {
    const response = await request.post('/api/webhooks/github-release', {
      data: mockedCreated.body,
      headers: mockedCreated.headers,
    })

    expect(response.status()).toBe(204)
  })
})
