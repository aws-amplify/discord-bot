import { test, expect } from '@playwright/test'
import { verifyGithubWebhookEvent } from '../../../src/routes/api/webhooks/_verifyWebhook'
import {
  addedPayload1,
  addedPayload2,
  addedPayloadUserDNE,
  removedPayload2,
  removedPayloadUserDNE,
} from '../../mock/github-webhook'

test.describe('POST api/webhooks/github-org-membership', () => {
  test.describe('webhook verification', () => {
    test('should return true with payload for added member', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_WEBHOOK_SECRET,
          addedPayload1.body,
          addedPayload1.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })

    test('should return true with payload for removed member', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_WEBHOOK_SECRET,
          removedPayload2.body,
          removedPayload2.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })

    test('should return true for removed member', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_WEBHOOK_SECRET,
          removedPayloadUserDNE.body,
          removedPayloadUserDNE.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })

    test('should return true for added member', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_WEBHOOK_SECRET,
          addedPayloadUserDNE.body,
          addedPayloadUserDNE.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })

    test('should return false with jumbled payload body and headers', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_WEBHOOK_SECRET,
          addedPayloadUserDNE.body,
          addedPayload1.headers['X-Hub-Signature-256']
        )
      ).toBe(false)
    })

    test('should return false with empty body', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_WEBHOOK_SECRET,
          {},
          addedPayload2.headers['X-Hub-Signature-256']
        )
      ).toBe(false)
    })

    test('should return false with empty payload and token', () => {
      expect(verifyGithubWebhookEvent('', {}, '')).toBe(false)
    })
  })

  test('should return 403 without auth header', async ({ request }) => {
    const response = await request.post('/api/webhooks/github-org-membership', {
      data: {},
    })
    expect(response.status()).toBe(403)
  })

  test('should return 403 with invalid auth header', async ({ request }) => {
    const response = await request.post('/api/webhooks/github-org-membership', {
      data: addedPayload1.body,
      headers: { 'X-Hub-Signature-256': 'invalid' },
    })
    expect(response.status()).toBe(403)
  })

  /**
   * @TODO fix this in CI, test runs fine locally
   */
  // test('should return 201 if everything is correct', async () => {
  //   const response = await request(app)
  //     .post('/api/webhooks/github-org-membership')
  //     .send(addedPayload1.body)
  //     .set(addedPayload1.headers)
  //   expect(response.status).toBe(201)
  // })

  // test(`should return 403 if user isn't in db`, async ({ request }) => {
  //   const response = await request.post('/api/webhooks/github-org-membership', {
  //     data: addedPayloadUserDNE.body,
  //     headers: addedPayloadUserDNE.headers,
  //   })
  //   expect(response.status()).toBe(403)
  // })
})
