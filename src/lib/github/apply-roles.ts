import { Octokit } from '@octokit/rest'
import { prisma } from '$lib/db'
import { addRole } from '$discord/roles/addRole'
import { removeRole } from '$discord/roles/removeRole'

// returns the given user's roles within the guild,
// false if user doesn't exist or isn't a member of the guild
async function fetchDiscordUserRoles(discUserId: string) {
  const res = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${discUserId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      method: 'GET',
    }
  )
  if (!res.ok) {
    console.error(
      `Failed to fetch user roles userID ${discUserId} guildID ${process.env.DISCORD_GUILD_ID}: ${res.statusText}`
    )
    return false
  } else {
    const user = await res.json()
    return user.roles
  }
}

// returns true if the user is a member of that org
// false otherwise or if error
// (uses access token to determine current user)
async function isOrgMember(accessToken) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })
  try {
    await octokit.request('GET /user/memberships/orgs/{org}', {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    return true
  } catch (err) {
    console.error(
      `Failed to find org member in ${process.env.GITHUB_ORG_LOGIN}: ${err.response.data.message}`
    )
    return false
  }
}

// returns a list of the given organization's repositories,
// false if error
export async function fetchOrgRepos(accessToken) {
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

// for each repository belonging to the org, retrieves a list of
// contributors. returns true if the user with a given id is
// a contributor in at least one repository,
// false otherwise or if error
export async function isContributor(
  accessToken: string,
  repos: [],
  userId: string
) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })

  for (let i = 0; i < repos.length; i++) {
    const amplifyRepo = repos[i].name

    try {
      const { data } = await octokit.request(
        'GET /repos/{owner}/{repo}/contributors',
        {
          owner: process.env.GITHUB_ORG_LOGIN,
          repo: amplifyRepo,
        }
      )

      const index = data.findIndex(
        (contributor) => contributor.id === Number(userId)
      )
      if (index !== -1) return true
    } catch (err) {
      console.error(
        `Error searching for user in repository ${amplifyRepo}: ${err.response.data.message}`
      )
    }
  }
  return false
}

// driver code that checks github membership/contribution status and applies roles
export async function appplyRoles(userId: string) {
  let staffResponse = true
  let contributorResponse = true
  let accessToken, ghUserId, discUserId

  const userAccounts = await prisma.account.findMany({
    where: { userId: userId },
  })
   
  if(userAccounts.length === 2) {
    accessToken = userAccounts.filter(
      (account) => account.provider === 'github'
    )[0].access_token
    ghUserId = userAccounts.filter(
      (account) => account.provider === 'github'
    )[0].providerAccountId
    discUserId = userAccounts.filter(
      (account) => account.provider === 'discord'
    )[0].providerAccountId
  } else {
    return false
  }

  // user's current Discord roles
  const userRoles = await fetchDiscordUserRoles(discUserId)

  if (!accessToken || !ghUserId || !discUserId || !userRoles) return false

  const isGitHubOrgMember = await isOrgMember(accessToken)

  // user is member of amplify org
  // and user DOESN'T already have staff role -> apply staff role
  if (isGitHubOrgMember && !(process.env.DISCORD_STAFF_ROLE_ID in userRoles)) {
    console.log("adding staff role")
    staffResponse = await addRole(
      process.env.DISCORD_STAFF_ROLE_ID,
      process.env.DISCORD_GUILD_ID,
      discUserId
    )
  } else if (
    // user is NOT member of amplify org
    // but user DOES have staff role -> remove role
    !isGitHubOrgMember &&
    process.env.DISCORD_STAFF_ROLE_ID in userRoles
  ) {
    console.log("removing staff role")
    staffResponse = await removeRole(
      process.env.DISCORD_STAFF_ROLE_ID,
      process.env.DISCORD_GUILD_ID,
      discUserId
    )
  }

  // if user is a contrinutor, apply contributor role
  const repos = await fetchOrgRepos(accessToken)
  if (repos && repos.length > 0) {
    const userIsContributor = await isContributor(accessToken, repos, ghUserId)

    // user is a contributor and
    // user DOESN'T have contrubitor role -> apply role
    if (
      userIsContributor &&
      !(process.env.DISCORD_CONTRIBUTOR_ROLE_ID in userRoles)
    ) {
      console.log("adding contributor role")
      contributorResponse = await addRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        discUserId
      )
      // user is NOT a contributor and user has role -> remove role
    } else if (
      !userIsContributor &&
      process.env.DISCORD_CONTRIBUTOR_ROLE_ID in userRoles
    ) {
      console.log("removing contributor role")
      contributorResponse = await removeRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        discUserId
      )
    }
  }
  // if removal/addition of either role failed, return false
  return contributorResponse && staffResponse
}

if (import.meta.vitest) {
  const { describe, expect, test, beforeAll } = import.meta.vitest
  let repos: []
  const userId = 'cl4n0kjqd0006iqtda15yzzcw'
  const ghUserId = '107655607'
  const guildMemberId = '985985131271585833'
  const userAccounts = await prisma.account.findMany({
    where: { userId: userId },
  })
  const accessToken = userAccounts.filter(
    (account) => account.provider === 'github'
  )[0].access_token

  beforeAll(async () => {
    await addRole(
      process.env.DISCORD_STAFF_ROLE_ID,
      process.env.DISCORD_GUILD_ID,
      guildMemberId
    )
    await addRole(
      process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
      process.env.DISCORD_GUILD_ID,
      guildMemberId
    )
    repos = await fetchOrgRepos(accessToken)
  })

  describe('Successful adding and removal of roles', () => {
    test('Fetch guild user roles', async () => {
      const roles = await fetchDiscordUserRoles(guildMemberId)
      expect(roles).toHaveLength(2)
    })
    test('Fetch org repos', async () => {
      const response = await fetchOrgRepos(accessToken)
      expect(response).toEqual(repos)
    })
    test('Is org member', async () => {
      const response = await isOrgMember(accessToken)
      expect(response).toBeTruthy()
    })
    test('Is org contributor', async () => {
      const response = await isContributor(accessToken, repos, ghUserId)
      expect(response).toBe(true)
    }, 20000)
    test('Remove staff role', async () => {
      const response = await removeRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      expect(response).toBeTruthy()
      const roles = await fetchDiscordUserRoles(guildMemberId)
      expect(roles).not.toContain(process.env.DISCORD_STAFF_ROLE_ID)
    })
    test('Add staff role', async () => {
      const response = await addRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      expect(response).toBeTruthy()
      const roles = await fetchDiscordUserRoles(guildMemberId)
      expect(roles).toContain(process.env.DISCORD_STAFF_ROLE_ID)
    })
    test('Remove contributor role', async () => {
      const response = await removeRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      expect(response).toBeTruthy()
      const roles = await fetchDiscordUserRoles(guildMemberId)
      expect(roles).not.toContain(process.env.DISCORD_CONTRIBUTOR_ROLE_ID)
    })
    test('Add contributor role', async () => {
      const response = await addRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      expect(response).toBeTruthy()
      const roles = await fetchDiscordUserRoles(guildMemberId)
      expect(roles).toContain(process.env.DISCORD_CONTRIBUTOR_ROLE_ID)
    })
  })

  describe('Failed adding and removal of roles', () => {
    test('Fetch guild user roles unknown user id', async () => {
      const response = await fetchDiscordUserRoles(`bad${guildMemberId}`)
      expect(response).toBe(false)
    })

    test('Fetch guild user bad bot token', async () => {
      const botToken = process.env.DISCORD_BOT_TOKEN
      process.env.DISCORD_BOT_TOKEN = `bad${botToken}`
      const response = await fetchDiscordUserRoles(guildMemberId)
      expect(response).toBe(false)
      process.env.DISCORD_BOT_TOKEN = botToken
    })

    test('Fetch org repos bad access token', async () => {
      const response = await fetchOrgRepos(`b${accessToken}ad`)
      expect(response).toBe(false)
    })

    test('Fetch org repos unknown org', async () => {
      const orgLogin = process.env.GITHUB_ORG_LOGIN
      process.env.GITHUB_ORG_LOGIN = `${orgLogin}bad`
      const response = await fetchOrgRepos(accessToken)
      process.env.GITHUB_ORG_LOGIN = orgLogin
      expect(response).toBe(false)
    })

    test('Is org member bad access token', async () => {
      const response = await isOrgMember(`bad${accessToken}`)
      expect(response).toBe(false)
    })

    test('Is org member unknown org', async () => {
      const orgLogin = process.env.GITHUB_ORG_LOGIN
      process.env.GITHUB_ORG_LOGIN = `bad${orgLogin}`
      const response = await isOrgMember(accessToken)
      process.env.GITHUB_ORG_LOGIN = orgLogin
      expect(response).toBe(false)
    })

    test('Remove role from unknown user', async () => {
      const response = await removeRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        `1${guildMemberId}`
      )
      expect(response).toBe(false)
    })

    test('Add role to unknown user', async () => {
      const response = await addRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        `1${guildMemberId}`
      )
      expect(response).toBe(false)
    })

    test('Add unknown role', async () => {
      const response = await addRole(
        `1${process.env.DISCORD_CONTRIBUTOR_ROLE_ID}`,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      expect(response).toBe(false)
    })

    test('Add role in unknown guild', async () => {
      const response = await addRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        `123${process.env.DISCORD_GUILD_ID}`,
        guildMemberId
      )
      expect(response).toBe(false)
    })

    test('Is org contributor wrong repos', async () => {
      const filtered = repos.filter((repo) => !(repo.name === 'discord-bot'))
      const response = await isContributor(accessToken, filtered, ghUserId)
      expect(response).toBe(false)
    }, 20000)

    test('Is org contributor bad user id', async () => {
      const response = await isContributor(accessToken, repos, `bad${ghUserId}`)
      expect(response).toBe(false)
    }, 20000)
  })

  describe('Test full pipeline success', async () => {
    test('Add and remove roles', async () => {
      await removeRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      await removeRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
    })

    test('Applying roles full pipeline', async () => {
      const response = await appplyRoles(userId)
      expect(response).toBeTruthy()
    }, 10000)
  })

  describe('Test full pipeline failure', async () => {
    test('Add and remove roles', async () => {
      await removeRole(
        process.env.DISCORD_CONTRIBUTOR_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
      await removeRole(
        process.env.DISCORD_STAFF_ROLE_ID,
        process.env.DISCORD_GUILD_ID,
        guildMemberId
      )
    })

    test('Applying roles full pipeline bad user id', async () => {
      const response = await appplyRoles('baduserid')
      expect(response).toBe(false)
    }, 10000)

    // this returns true, do we need to check for errors here?
    test('Applying roles full pipeline bad org login', async () => {
      const orgLogin = process.env.GITHUB_ORG_LOGIN
      process.env.GITHUB_ORG_LOGIN = "somethingthatdoesn'texist123"
      const response = await appplyRoles(userId)
     expect(response).toBe(true)
      process.env.GITHUB_ORG_LOGIN = orgLogin 
    }, 10000)

    test('Applying roles full pipeline bad guild id', async () => {
      const orgLogin = process.env.DISCORD_GUILD_ID
      process.env.DISCORD_GUILD_ID = "somethingthatdoesn'texist123"
      const response = await appplyRoles(userId)
      expect(response).toBe(false)
      process.env.GITHUB_ORG_LOGIN = orgLogin 
    }, 10000)
  })

}
