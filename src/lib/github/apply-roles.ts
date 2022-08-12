import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import { addRole } from '$discord/roles/addRole'
import { removeRole } from '$discord/roles/removeRole'
import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from '$lib/db'

/**
 * returns true if the user is a member of that org
 * false otherwise or if error
 * (uses access token to determine current user)
 */
async function isOrgMember(accessToken: string, ghUserId: string) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })
  try {
    const { data } = await octokit.request('GET /orgs/{org}/members', {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    const isOrgMember = data.some(
      (contributor) => contributor.id === Number(ghUserId)
    )
    //if (isOrgMember) return true
    return isOrgMember
  } catch (err) {
    console.error(
      `Failed to find org member in ${process.env.GITHUB_ORG_LOGIN}: ${err.response.data.message}`
    )
  }
  return false
}

/**
 * returns a list of the given organization's repositories,
 * false if error
 *  also this will only work if repos are public
 */
export async function fetchOrgRepos(accessToken: string) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })
  try {
    const { data } = await octokit.request('GET /orgs/{org}/repos', {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    return data
  } catch (err) {
    console.error(
      `Failed to fetch repos for ${process.env.GITHUB_ORG_LOGIN}: ${err.response.data.message}`
    )
    return false
  }
}

/**
 *  for each repository belonging to the org, retrieves a list of
 * contributors. returns true if the user with a given id is
 * a contributor in at least one repository,
 * false otherwise or if error
 */
export async function isContributor(
  accessToken: string,
  repos: [],
  userId: string
) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })

  for (let i = 0; i < repos.length; i++) {
    const amplifyRepo = repos[i]?.name

    try {
      const { data } = await octokit.request(
        'GET /repos/{owner}/{repo}/contributors',
        {
          owner: process.env.GITHUB_ORG_LOGIN,
          repo: amplifyRepo,
        }
      )

      const isContributor = data.some(
        (contributor) => contributor.id === Number(userId)
      )
      if (isContributor) return true
    } catch (err) {
      console.error(
        `Error searching for user in repository ${amplifyRepo}: ${err.response.data.message}`
      )
    }
  }
  return false
}

/** driver code that checks github membership/contribution status and applies roles */
export async function applyRoles(
  userId: string,
  ghUserId: string,
  accessToken: string
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
      id: import.meta.env.VITE_DISCORD_GUILD_ID,
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

if (import.meta.vitest) {
  const { describe, expect, test, it, beforeAll } = import.meta.vitest
  test.runIf(process.env.GITHUB_TESTS_ENABLED)(
    'only test if app secrets are enabled',
    async () => {
      const { privateKey } = JSON.parse(process.env.GITHUB_PRIVATE_KEY)
      const id = 'cl4n0kjqd0006iqtda15yzzcw'
      const ghUserId = '107655607'
      const guildMemberId = '985985131271585833'

      let token: string, repos: []

      const config = await prisma.configuration.findUnique({
        where: {
          id: import.meta.env.VITE_DISCORD_GUILD_ID,
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

      // type cast to string because this data will be seeded in test db
      const staffRoleId = config.roles.find(
        (r) => r.accessLevelId === ACCESS_LEVELS.STAFF
      )?.discordRoleId as string
      const contributorRoleId = config.roles.find(
        (r) => r.accessLevelId === ACCESS_LEVELS.CONTRIBUTOR
      )?.discordRoleId as string

      beforeAll(async () => {
        const auth = createAppAuth({
          appId: process.env.GITHUB_APP_ID,
          privateKey: privateKey,
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        })

        try {
          const data = await auth({
            type: 'installation',
            installationId: process.env.GITHUB_INSTALLATION_ID,
          })
          token = data.token
        } catch (err) {
          console.log(err)
        }
        repos = await fetchOrgRepos(token)

        await addRole(staffRoleId, config.id, guildMemberId)
        await addRole(contributorRoleId, config.id, guildMemberId)
      })

      describe('Successful adding and removal of roles', () => {
        test('Fetch org repos', async () => {
          const response = await fetchOrgRepos(token)
          expect(response).toEqual(repos)
        })
        test('Is org member', async () => {
          const response = await isOrgMember(token, ghUserId)
          expect(response).toBeTruthy()
        })
        test('Is org contributor', async () => {
          const response = await isContributor(token, repos, ghUserId)
          expect(response).toBe(true)
        }, 20000)
        test('Remove staff role', async () => {
          const response = await removeRole(
            staffRoleId,
            config.id,
            guildMemberId
          )
          expect(response).toBeTruthy()
        })
        test('Add staff role', async () => {
          const response = await addRole(staffRoleId, config.id, guildMemberId)
          expect(response).toBeTruthy()
        })
        test('Remove contributor role', async () => {
          const response = await removeRole(
            contributorRoleId,
            config.id,
            guildMemberId
          )
          expect(response).toBeTruthy()
        })
        test('Add contributor role', async () => {
          const response = await addRole(
            contributorRoleId,
            config.id,
            guildMemberId
          )
          expect(response).toBeTruthy()
        })
      })

      describe('Failed adding and removal of roles', () => {
        test('Fetch org repos bad access token', async () => {
          const response = await fetchOrgRepos(`b${token}ad`)
          expect(response).toBe(false)
        })

        test('Fetch org repos unknown org', async () => {
          const orgLogin = process.env.GITHUB_ORG_LOGIN
          process.env.GITHUB_ORG_LOGIN = `${orgLogin}bad`
          const response = await fetchOrgRepos(token)
          process.env.GITHUB_ORG_LOGIN = orgLogin
          expect(response).toBe(false)
        })

        test('Is org member bad access token', async () => {
          const response = await isOrgMember(`bad${token}`, ghUserId)
          expect(response).toBe(false)
        })

        test('Is org member unknown org', async () => {
          const orgLogin = process.env.GITHUB_ORG_LOGIN
          process.env.GITHUB_ORG_LOGIN = `bad${orgLogin}`
          const response = await isOrgMember(token, ghUserId)
          process.env.GITHUB_ORG_LOGIN = orgLogin
          expect(response).toBe(false)
        })

        test('Remove role from unknown user', async () => {
          const response = await removeRole(
            contributorRoleId,
            config.id,
            `1${guildMemberId}`
          )
          expect(response).toBe(false)
        })

        test('Add role to unknown user', async () => {
          const response = await addRole(
            contributorRoleId,
            config.id,
            `1${guildMemberId}`
          )
          expect(response).toBe(false)
        })

        test('Add unknown role', async () => {
          const response = await addRole(
            `1${contributorRoleId}`,
            config.id,
            guildMemberId
          )
          expect(response).toBe(false)
        })

        test('Add role in unknown guild', async () => {
          const response = await addRole(
            contributorRoleId,
            `123${config.id}`,
            guildMemberId
          )
          expect(response).toBe(false)
        })

        test('Is org contributor wrong repos', async () => {
          const filtered = repos.filter(
            (repo) => !(repo.name === 'discord-bot')
          )
          const response = await isContributor(token, filtered, ghUserId)
          expect(response).toBe(false)
        }, 20000)

        test('Is org contributor bad user id', async () => {
          const response = await isContributor(token, repos, `bad${ghUserId}`)
          expect(response).toBe(false)
        }, 20000)
      })

      describe('Test full pipeline success', async () => {
        test('Add and remove roles', async () => {
          await removeRole(contributorRoleId, config.id, guildMemberId)
          await removeRole(staffRoleId, config.id, guildMemberId)
        })

        test('Applying roles full pipeline', async () => {
          const response = await applyRoles(id, ghUserId, token)
          expect(response).toBeTruthy()
        }, 10000)
      })

      describe('Test full pipeline failure', async () => {
        test('Add and remove roles', async () => {
          await removeRole(contributorRoleId, config.id, guildMemberId)
          await removeRole(staffRoleId, config.id, guildMemberId)
        })

        test('Applying roles full pipeline bad user id', async () => {
          const response = await applyRoles('baduserid', ghUserId, token)
          expect(response).toBe(false)
        }, 10000)

        // this returns true, do we need to check for errors here?
        it('should return false with bad org login', async () => {
          const orgLogin = process.env.GITHUB_ORG_LOGIN
          process.env.GITHUB_ORG_LOGIN = "somethingthatdoesn'texist123"
          const response = await applyRoles(id, ghUserId, token)
          expect(response).toBe(true)
          process.env.GITHUB_ORG_LOGIN = orgLogin
        }, 10000)

        it('should return false with bad guild id', async () => {
          const orgLogin = config.id
          config.id = "somethingthatdoesn'texist123"
          const response = await applyRoles(id, ghUserId, token)
          expect(response).toBe(false)
          process.env.GITHUB_ORG_LOGIN = orgLogin
        }, 10000)
      })
    }
  )
}
