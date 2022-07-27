import { addRole } from '$discord/roles/addRole'
import { prisma } from '$lib/db'
import { removeRole } from '$discord/roles/removeRole'
import { verifyGithubWebhookEvent } from './_verifyWebhook'
import { seed } from '../../../../tests/setup/seed'
import { addedPayload1, addedPayload2, addedPayloadUserDNE, removedPayload1, removedPayload2, removedPayloadUserDNE } from '../../../../tests/mock/github-webhook'

async function getDiscordUserId(ghUserId: string) {
  console.log(ghUserId)
  const data = await prisma.user.findFirst({
    where: {
      accounts: {
        some: {
          provider: 'github',
          providerAccountId: ghUserId,
        },
      },
    },
    select: {
      accounts: {
        where: {
          provider: 'discord',
        },
      },
    },
  })
  console.log(data)

  if (data && data.accounts && data.accounts.length === 1) {
    const userId = data.accounts[0].providerAccountId
    if (userId) return userId
  }
  throw new Error(`Discord account not found for GitHub user ${ghUserId}`)
}

export async function post({ request }) {
  let rolesApplied, guildMemberId
  const payload = await request.json()

  if (!import.meta.vitest) {
    const sig256 = request.headers.get('x-hub-signature-256')
    if (
      !verifyGithubWebhookEvent(
        process.env.GITHUB_WEBHOOK_SECRET,
        payload,
        sig256
      )
    ) {
      return { status: 403 }
    }
  }

  try {
    guildMemberId = await getDiscordUserId(String(payload.membership.user.id))
  } catch (err) {
    console.error(err)
    return { status: 403 }
  }

  switch (payload.action) {
    case 'member_added':
      rolesApplied = await addRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      break
    case 'member_removed':
      rolesApplied = await removeRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      break
    default:
      rolesApplied = true
  }

  if (!rolesApplied) {
    return {
      status: 400,
    }
  } else {
    return {
      status: 200,
    }
  }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  try {
    await seed()
  } catch (error) {
    console.log(error)
  }

  describe('Webhook verification', () => {
    it('should return true with payload for added member', () => {
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

  describe('Getting discord user id', () => {
    test('should return correct id if user in db', async () => {
      expect(
        await getDiscordUserId(String(removedPayload1.body.membership.user.id))
      ).toEqual('985985131271585833')
    })

    test('should throw error if user not in db', async () => {
      await expect(
         getDiscordUserId(String(addedPayloadUserDNE.body.membership.user.id))
      ).rejects.toThrowError()
    })

    test('should throw error if no user id is passed', async () => {
      await expect(getDiscordUserId('')).rejects.toThrowError()
    })
  })
}
