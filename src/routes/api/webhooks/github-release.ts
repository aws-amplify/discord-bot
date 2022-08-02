import { EmbedBuilder } from 'discord.js'
import { verifyGithubWebhookEvent } from './_verifyWebhook'
import { mocked, mockedBad } from '../../../../tests/mock/github-webhook'
import type { RequestHandler } from '@sveltejs/kit'

function createReleaseMessage(payload) {
  const embed = new EmbedBuilder()
  embed.setTitle(`[${payload.repository.full_name}] ${payload.release.name}`)
  embed.setColor('#ff9900')
  embed.setDescription(payload.release.body)
  embed.setURL(payload.release.html_url)
  embed.setAuthor({
    name: payload.repository.full_name,
    url: payload.release.author.html_url,
    iconURL: payload.release.author.avatar_url,
  })
  return {
    content: 'New Release!',
    tts: false,
    embeds: [embed],
  }
}

// application/x-www-form-urlencoded
export const post: RequestHandler = async function post({ request }) {
  let payload
  try {
    payload = await request.json()
  } catch (error) {
    return {
      status: 400,
      body: {
        errors: [
          {
            message: `Invalid payload: ${error.message}`,
          },
        ],
      },
    }
  }

  if (!import.meta.vitest) {
    const sig256 = request.headers.get('x-hub-signature-256')
    if (
      !sig256 ||
      !verifyGithubWebhookEvent(
        process.env.GITHUB_WEBHOOK_SECRET,
        payload,
        sig256
      )
    ) {
      return {
        status: 403,
        body: {
          errors: [
            {
              message: 'Unable to verify signature',
            },
          ],
        },
      }
    }
  }

  if (payload.action !== 'released') {
    return { status: 204 }
  }

  const message = createReleaseMessage(payload)

  const res = await fetch(process.env.DISCORD_WEBHOOK_URL_RELEASES, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(message),
  })

  // if response is not okay or if Discord did not return a 204
  if (!res.ok) {
    if (res.body) console.log(await res.json())
    return {
      status: 400,
    }
  } else {
    return {
      status: 201,
    }
  }
}

if (import.meta.vitest) {
  const { it, describe, expect } = import.meta.vitest

  describe('Webhook verification', () => {
    it('should return true if everything is correct', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_WEBHOOK_SECRET,
          mocked.body,
          mocked.headers['X-Hub-Signature-256']
        )
      ).toBeTruthy()
    })

    it('should return false with a jumbled payload', () => {
      expect(
        verifyGithubWebhookEvent(
          process.env.GITHUB_WEBHOOK_SECRET,
          mockedBad.body,
          mockedBad.headers['X-Hub-Signature-256']
        )
      ).toEqual(false)
    })

    test('should return false with empty payload and header', () => {
      expect(
        verifyGithubWebhookEvent(process.env.GITHUB_WEBHOOK_SECRET, {}, '')
      ).toEqual(false)
    })

    test('should return false with null payload and header is null', () => {
      expect(
        verifyGithubWebhookEvent(process.env.GITHUB_WEBHOOK_SECRET, null, null)
      ).toEqual(false)
    })
  })
}
