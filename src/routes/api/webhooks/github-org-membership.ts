import { addRole } from '$discord/roles/addRole'
import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from '$lib/db'
import { removeRole } from '$discord/roles/removeRole'
import { verifyGithubWebhookEvent } from './_verifyWebhook'
import type { RequestHandler } from '@sveltejs/kit'

async function getDiscordUserId(ghUserId: string) {
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

  if (data && data?.accounts && data?.accounts?.length === 1) {
    const userId = data.accounts[0].providerAccountId
    if (userId) return userId
  }
  throw new Error(`Discord account not found for GitHub user ${ghUserId}`)
}

export const POST: RequestHandler = async function post({ request }) {
  let rolesApplied, guildMemberId
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

  /**
   * @TODO match org from webhook with guild id's with this config
   */

  const config = await prisma.configuration.findUnique({
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
    console.error(`No staff roles found for guild ${config!.id}, skipping...`)
    /**
     * @TODO better error code? 412?
     */
    return {
      status: 400,
    }
  }

  const [{ discordRoleId: staffRoleId }] = config.roles

  try {
    guildMemberId = await getDiscordUserId(String(payload.membership.user.id))
  } catch (err) {
    console.error(err)
    return {
      status: 403,
      body: {
        errors: [
          {
            message: 'Could not find Discord user',
          },
        ],
      },
    }
  }

  switch (payload.action) {
    case 'member_added':
      rolesApplied = await addRole(staffRoleId, config.id, guildMemberId)
      break
    case 'member_removed':
      rolesApplied = await removeRole(staffRoleId, config.id, guildMemberId)
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
      status: 201,
    }
  }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  it.runIf(process.env.GITHUB_TESTS_ENABLED)(
    'only run if secrets enabled',
    () => {
      describe('Getting discord user id', () => {
        const ghUserId = '107655607'
        const ghUserId2 = '70536670'
        it('should return correct id if user in db', async () => {
          expect(await getDiscordUserId(String(ghUserId))).toEqual(
            '985985131271585833'
          )
        })

        it('should throw error if user not in db', async () => {
          await expect(
            getDiscordUserId(String(ghUserId2))
          ).rejects.toThrowError()
        })

        it('should throw error if no user id is passed', async () => {
          await expect(getDiscordUserId('')).rejects.toThrowError()
        })
      })
    }
  )
}
