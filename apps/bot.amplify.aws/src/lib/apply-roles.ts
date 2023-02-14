import { addRole, removeRole } from '@hey-amplify/discord'
import { isOrgMember, isContributor, fetchOrgRepos } from '@hey-amplify/github'
import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from './db'

/** driver code that checks github membership/contribution status and applies roles */
export async function applyRoles(
  userId: string,
  ghUserId: string,
  accessToken: string,
  guildId: string = import.meta.env.VITE_DISCORD_GUILD_ID
) {
  let discUserId
  let staffResponse = true
  let contributorResponse = true

  // retrieve discord user id for current user
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      accounts: {
        where: {
          provider: 'discord',
        },
      },
    },
  })
  if (data?.accounts?.length === 1) {
    discUserId = data.accounts[0].providerAccountId
  }

  if (!discUserId) return false

  const isGitHubOrgMember = await isOrgMember(accessToken, ghUserId)

  const config = await prisma.configuration.findUnique({
    where: {
      id: guildId,
    },
    select: {
      id: true,
      roles: {
        select: {
          accessLevelId: true,
          discordRoleId: true,
        },
        where: {
          accessLevelId: {
            in: [ACCESS_LEVELS.STAFF, ACCESS_LEVELS.CONTRIBUTOR],
          },
        },
      },
    },
  })

  if (!config?.roles?.some((r) => !!r.discordRoleId)) {
    console.error('No roles found')
    return
  }

  const staffRoleId = config.roles.find(
    (r) => r.accessLevelId === ACCESS_LEVELS.STAFF
  )?.discordRoleId
  const contributorRoleId = config.roles.find(
    (r) => r.accessLevelId === ACCESS_LEVELS.CONTRIBUTOR
  )?.discordRoleId

  // user is member of amplify org -> apply staff role
  if (staffRoleId) {
    if (isGitHubOrgMember) {
      staffResponse = await addRole(staffRoleId, config.id, discUserId)
    } else if (
      // user is NOT member of amplify org -> remove role
      !isGitHubOrgMember
    ) {
      staffResponse = await removeRole(staffRoleId, config.id, discUserId)
    }
  } else {
    console.error('No staff role found, skipping...')
  }

  if (contributorRoleId) {
    const repos = await fetchOrgRepos(accessToken)
    if (repos?.length) {
      const userIsContributor = await isContributor(
        accessToken,
        repos,
        ghUserId
      )

      // user is a contributor -> apply role
      if (userIsContributor) {
        contributorResponse = await addRole(
          contributorRoleId,
          config.id,
          discUserId
        )
        // user is NOT a contributor -> remove role
      } else if (!userIsContributor) {
        contributorResponse = await removeRole(
          contributorRoleId,
          config.id,
          discUserId
        )
      }
    }
  } else {
    console.error('No contributor role found, skipping...')
  }
  // if removal/addition of either role failed, return false
  return contributorResponse && staffResponse
}
